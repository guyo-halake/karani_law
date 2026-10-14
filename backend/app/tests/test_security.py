import pytest
from datetime import timedelta
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from fastapi import HTTPException

def test_bcrypt_password_hashing():
    raw_pwd = "AdvocatePassword@2026"
    hashed = hash_password(raw_pwd)
    
    assert hashed.startswith("$2b$")
    assert verify_password(raw_pwd, hashed) is True
    assert verify_password("WrongPassword123", hashed) is False

def test_legacy_password_compatibility():
    # Legacy dev passwords allow fallback
    assert verify_password("Nyagah@2026", "Nyagah@2026") is True
    assert verify_password("pass123", "") is False

def test_jwt_access_and_refresh_tokens():
    claims = {
        "sub": "usr-test-advocate",
        "email": "test@kithinjilegal.co.ke",
        "role": "Advocate",
        "firmId": "firm-001"
    }
    access_tok = create_access_token(claims)
    decoded = decode_token(access_tok)
    
    assert decoded["sub"] == "usr-test-advocate"
    assert decoded["role"] == "Advocate"
    assert decoded["type"] == "access"
    assert "exp" in decoded

    # Refresh token
    refresh_tok = create_refresh_token(claims)
    decoded_ref = decode_token(refresh_tok)
    assert decoded_ref["sub"] == "usr-test-advocate"
    assert decoded_ref["type"] == "refresh"

def test_expired_jwt_token_rejection():
    claims = {"sub": "usr-expired"}
    # Token expired 10 minutes ago
    expired_tok = create_access_token(claims, expires_delta=timedelta(minutes=-10))
    
    with pytest.raises(HTTPException) as exc_info:
        decode_token(expired_tok)
    assert exc_info.value.status_code == 401
    assert "expired" in str(exc_info.value.detail).lower()
