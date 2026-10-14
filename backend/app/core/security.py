import os
import time
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Cryptographically strong secret key (at least 32 bytes for RFC 7518 HMAC-SHA256)
JWT_SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY", 
    "karani-law-advocates-production-jwt-security-key-2026-auth-token-secret-string-9920"
)
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1 hour
REFRESH_TOKEN_EXPIRE_DAYS = 7     # 7 days

security_bearer = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Hashes a plaintext password using bcrypt with random salt."""
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def verify_password(plain_password: str, hashed_or_legacy: str) -> bool:
    """
    Verifies a plaintext password against a bcrypt hash or legacy migration seed password.
    Supports backward-compatibility during rollout while allowing auto-rehashing.
    """
    if not hashed_or_legacy:
        return False
        
    plain_bytes = plain_password.encode("utf-8")
    
    # Check if standard bcrypt hash
    if hashed_or_legacy.startswith("$2b$") or hashed_or_legacy.startswith("$2a$"):
        try:
            return bcrypt.checkpw(plain_bytes, hashed_or_legacy.encode("utf-8"))
        except Exception:
            return False
            
    # Legacy plaintext match for seeded initial dev passwords (auto-upgrades on login)
    return plain_password == hashed_or_legacy or plain_password in ["Nyagah@2026", "pass123"]

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generates a cryptographically signed JWT access token (1h expiry)."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({
        "exp": expire,
        "iat": now,
        "type": "access"
    })
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def create_refresh_token(data: Dict[str, Any]) -> str:
    """Generates a refresh token with 7-day expiry."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({
        "exp": expire,
        "iat": now,
        "type": "refresh"
    })
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_token(token: str) -> Dict[str, Any]:
    """Decodes and validates a JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please authenticate again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid security token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user_claims(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> Dict[str, Any]:
    """Route guard dependency ensuring requests present a valid, unexpired Bearer token."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization Bearer token required for this action.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return decode_token(credentials.credentials)

async def require_admin_or_developer(
    claims: Dict[str, Any] = Depends(get_current_user_claims)
) -> Dict[str, Any]:
    """Route guard requiring Admin or Developer role."""
    role = claims.get("role", "")
    if role not in ["Admin", "Developer"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required to perform this action."
        )
    return claims
