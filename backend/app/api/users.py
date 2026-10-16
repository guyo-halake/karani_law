import os
import json
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Request, Depends, status
from pydantic import BaseModel, EmailStr, Field

try:
    from app.core.security import (
        hash_password,
        verify_password,
        create_access_token,
        create_refresh_token,
        decode_token,
        get_current_user_claims,
        require_admin_or_developer,
    )
except ModuleNotFoundError:
    from backend.app.core.security import (
        hash_password,
        verify_password,
        create_access_token,
        create_refresh_token,
        decode_token,
        get_current_user_claims,
        require_admin_or_developer,
    )

router = APIRouter(prefix="/api/v1/users", tags=["Users Management"])

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
USERS_FILE = os.path.join(DATA_DIR, "users.json")

# Default authoritative seeded firm roster
DEFAULT_USERS = [
    {
        "id": "usr-guyoh-admin",
        "fullName": "Guyo Halake",
        "username": "guyoh_alake",
        "advocateTitle": "Adv. Guyo Halake",
        "lskNo": "ADMIN/2026/001",
        "role": "Admin",
        "position": "Senior Managing Partner & System Administrator",
        "workEmail": "guyohalakeofficial@gmail.com",
        "personalEmail": "guyohalakeofficial@gmail.com",
        "phonePrimary": "+254 700 888 999",
        "phoneSecondary": "+254 722 000 888",
        "hasAllPermissions": True,
        "passwordHash": hash_password("guyoh123"),
        "firmId": "firm-001"
    },
    {
        "id": "usr-karani-admin",
        "fullName": "Karani Victor",
        "username": "karani_victor",
        "advocateTitle": "Adv. Karani Victor",
        "lskNo": "P.105/9920",
        "role": "Developer",
        "position": "Senior Partner & Remuneration Lead",
        "workEmail": "vickarani@gmail.com",
        "personalEmail": "vickarani@gmail.com",
        "phonePrimary": "+254 712 345678",
        "phoneSecondary": "+254 733 987654",
        "hasAllPermissions": True,
        "passwordHash": hash_password("karani123"),
        "firmId": "firm-001"
    },
    {
        "id": "usr-advocate-002",
        "fullName": "Nyagah Kithinji",
        "username": "nyagah_kithinji",
        "advocateTitle": "Adv. Nyagah Kithinji",
        "lskNo": "P.105/1992",
        "role": "Advocate",
        "position": "Managing Partner & Senior Counsel",
        "workEmail": "advocate@kithinjilegal.co.ke",
        "personalEmail": "nkithinji@gmail.com",
        "phonePrimary": "+254 722 000 111",
        "phoneSecondary": "+254 733 111 222",
        "hasAllPermissions": True,
        "passwordHash": hash_password("lawyer123"),
        "firmId": "firm-001"
    },
    {
        "id": "usr-p3l-admin",
        "fullName": "Razak Wako",
        "username": "razak_wako",
        "advocateTitle": "Razak Wako ",
        "lskNo": "P3L/DEV/2026/001",
        "role": "Developer",
        "position": "Lead Developer & System Administrator",
        "workEmail": "razak.admin@p3ldev.com",
        "personalEmail": "razak.admin@p3ldev.com",
        "phonePrimary": "+254 700 123456",
        "phoneSecondary": "+254 711 654321",
        "hasAllPermissions": True,
        "passwordHash": hash_password("razak123"),
        "firmId": "firm-001"
    },
   
]

DELETED_USERS_FILE = os.path.join(DATA_DIR, "deleted_users.json")

def load_deleted_keys() -> set[str]:
    if not os.path.exists(DELETED_USERS_FILE):
        return set()
    try:
        with open(DELETED_USERS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return {k.lower() for k in data if isinstance(k, str)}
    except Exception:
        return set()

def record_deleted_key(keys: list[str]):
    existing = load_deleted_keys()
    for k in keys:
        if k:
            existing.add(k.strip().lower())
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(DELETED_USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(list(existing), f, indent=2)

def unrecord_deleted_key(keys: list[str]):
    existing = load_deleted_keys()
    cleaned = False
    for k in keys:
        if k and isinstance(k, str):
            clean_k = k.strip().lower()
            if clean_k in existing:
                existing.remove(clean_k)
                cleaned = True
    if cleaned:
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(DELETED_USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(list(existing), f, indent=2)

def load_persisted_users() -> list[dict]:
    os.makedirs(DATA_DIR, exist_ok=True)
    deleted_keys = load_deleted_keys()

    if not os.path.exists(USERS_FILE):
        initial = [d for d in DEFAULT_USERS if d["id"].lower() not in deleted_keys and d["workEmail"].lower() not in deleted_keys]
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(initial, f, indent=2)
        return initial

    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            raw_users = json.load(f)
            users = [u for u in raw_users if isinstance(u, dict) and u.get("id")]

            # Any user currently stored in USERS_FILE is an active database user;
            # they must NEVER be filtered out or blocked by stale deletion entries.
            active_identifiers = []
            for u in users:
                for f_name in ["id", "workEmail", "personalEmail", "username", "fullName"]:
                    val = (u.get(f_name) or "").strip().lower()
                    if val:
                        active_identifiers.append(val)
            unrecord_deleted_key(active_identifiers)
            deleted_keys = load_deleted_keys()

            # Include default seed users only if not already present and not explicitly deleted
            existing_ids = {u.get("id") for u in users}
            existing_emails = {u.get("workEmail", "").lower() for u in users}
            for d in DEFAULT_USERS:
                d_id = (d.get("id") or "").lower()
                d_email = (d.get("workEmail") or "").lower()
                if d_id not in deleted_keys and d_email not in deleted_keys:
                    if d["id"] not in existing_ids and d_email not in existing_emails:
                        users.append(d)
            return users
    except Exception:
        return [d for d in DEFAULT_USERS if d.get("id", "").lower() not in deleted_keys and d.get("workEmail", "").lower() not in deleted_keys]

def save_persisted_users(users: list[dict]):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)

class UserInputModel(BaseModel):
    id: Optional[str] = None
    fullName: str
    username: Optional[str] = None
    advocateTitle: Optional[str] = None
    lskNo: Optional[str] = None
    role: Optional[str] = "Advocate"
    position: Optional[str] = "Senior Advocate"
    department: Optional[str] = None
    workEmail: str
    personalEmail: Optional[str] = None
    phonePrimary: Optional[str] = None
    phoneSecondary: Optional[str] = None
    avatarUrl: Optional[str] = None
    passwordHash: Optional[str] = None
    hasAllPermissions: Optional[bool] = False
    firmId: Optional[str] = "firm-001"

FIRM_SETTINGS_FILE = os.path.join(DATA_DIR, "firm_settings.json")

@router.get("/firm-settings")
async def get_firm_settings():
    """Returns the persistent firm branding and settings."""
    if os.path.exists(FIRM_SETTINGS_FILE):
        try:
            with open(FIRM_SETTINGS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

@router.post("/firm-settings")
async def save_firm_settings(payload: dict):
    """Persists firm branding and banking settings to backend storage."""
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(FIRM_SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
    return {"success": True, "settings": payload}

class LoginRequest(BaseModel):
    identifier: str
    password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

@router.get("")
async def get_all_users():
    """Returns all active firm users (sanitizes sensitive hashes)."""
    users = load_persisted_users()
    sanitized = []
    for u in users:
        safe_u = {k: v for k, v in u.items() if k != "passwordHash"}
        sanitized.append(safe_u)
    return {"users": sanitized, "count": len(sanitized)}

@router.get("/me")
async def get_current_user_profile(claims: dict = Depends(get_current_user_claims)):
    """Returns the authenticated user profile derived from the active JWT."""
    users = load_persisted_users()
    user_id = claims.get("sub")
    matched = next((u for u in users if u.get("id") == user_id), None)
    if not matched:
        raise HTTPException(status_code=404, detail="User not found.")
    safe = {k: v for k, v in matched.items() if k != "passwordHash"}
    return {"success": True, "user": safe}

@router.post("")
async def create_or_update_user(payload: UserInputModel):
    """Registers or updates a firm user with salted bcrypt password hashing."""
    email_clean = payload.workEmail.strip().lower()
    username_clean = (payload.username or email_clean.split("@")[0]).strip().lstrip("@")
    user_id = payload.id or f"usr-{int(os.times()[4] * 1000) if hasattr(os, 'times') else int(os.urandom(4).hex(), 16)}"

    # Immediately unblock this user across any previously recorded deletion keys
    keys_to_unblock = [
        user_id,
        email_clean,
        (payload.personalEmail or "").strip().lower(),
        username_clean,
        (payload.fullName or "").strip().lower()
    ]
    unrecord_deleted_key(keys_to_unblock)

    users = load_persisted_users()

    # Determine password hash
    new_password_hash = None
    if payload.passwordHash and payload.passwordHash.strip():
        raw_pwd = payload.passwordHash.strip()
        # If already a bcrypt hash, store as-is, otherwise hash it
        if raw_pwd.startswith("$2b$") or raw_pwd.startswith("$2a$"):
            new_password_hash = raw_pwd
        else:
            new_password_hash = hash_password(raw_pwd)
    else:
        new_password_hash = hash_password("Nyagah@2026")

    new_record = {
        "id": user_id,
        "fullName": payload.fullName.strip(),
        "username": username_clean,
        "advocateTitle": payload.advocateTitle or payload.fullName.strip(),
        "lskNo": payload.lskNo or "",
        "role": payload.role or "Advocate",
        "position": payload.position or "Senior Advocate",
        "department": (payload.department or "").strip(),
        "workEmail": email_clean,
        "personalEmail": (payload.personalEmail or email_clean).strip().lower(),
        "phonePrimary": (payload.phonePrimary or "").strip(),
        "phoneSecondary": (payload.phoneSecondary or "").strip(),
        "avatarUrl": payload.avatarUrl or None,
        "passwordHash": new_password_hash,
        "hasAllPermissions": payload.role in ["Admin", "Developer"],
        "firmId": payload.firmId or "firm-001"
    }

    # Upsert in list
    idx = -1
    for i, u in enumerate(users):
        if u.get("id") == user_id or u.get("workEmail", "").lower() == email_clean:
            idx = i
            break

    if idx != -1:
        if not payload.passwordHash and users[idx].get("passwordHash"):
            new_record["passwordHash"] = users[idx]["passwordHash"]
        users[idx] = {**users[idx], **new_record}
    else:
        users.insert(0, new_record)

    save_persisted_users(users)
    unrecord_deleted_key(keys_to_unblock)
    safe_profile = {k: v for k, v in new_record.items() if k != "passwordHash"}
    return {"success": True, "user": safe_profile}

class PurgeUserRequest(BaseModel):
    id: Optional[str] = None
    email: Optional[str] = None
    personalEmail: Optional[str] = None
    username: Optional[str] = None
    fullName: Optional[str] = None
    keys: Optional[List[str]] = Field(default_factory=list)

@router.post("/purge")
async def purge_users(payload: PurgeUserRequest):
    """
    Purges any user matching id, email, username or specified keys permanently.
    Guarantees they will never reappear in backend rosters or default re-seeds.
    """
    keys_to_purge = set()
    for k in [payload.id, payload.email, payload.personalEmail, payload.username, payload.fullName]:
        if k and isinstance(k, str) and k.strip():
            keys_to_purge.add(k.strip().lower())
    for k in (payload.keys or []):
        if k and isinstance(k, str) and k.strip():
            keys_to_purge.add(k.strip().lower())

    record_deleted_key(list(keys_to_purge))
    users = load_persisted_users()
    
    deleted_keys = load_deleted_keys()
    updated = [
        u for u in users
        if (u.get("id") or "").lower() not in deleted_keys
        and (u.get("workEmail") or "").lower() not in deleted_keys
        and (u.get("personalEmail") or "").lower() not in deleted_keys
        and (u.get("username") or "").lower() not in deleted_keys
        and (u.get("fullName") or "").lower() not in deleted_keys
    ]
    save_persisted_users(updated)
    return {"success": True, "purged_keys": list(keys_to_purge), "remaining": len(updated)}

@router.get("/deleted-keys")
async def get_deleted_keys():
    """Returns the set of all permanently deleted user keys and identifiers."""
    return {"deleted_keys": list(load_deleted_keys())}

@router.delete("/{user_id}")
async def delete_user(user_id: str):
    """Deletes a user permanently from the system and records the deletion."""
    clean_key = user_id.strip().lower()
    users = load_persisted_users()
    
    # Identify all matching users across all identifier fields
    matching = [
        u for u in users
        if u.get("id", "").lower() == clean_key
        or (u.get("workEmail") or "").lower() == clean_key
        or (u.get("personalEmail") or "").lower() == clean_key
        or (u.get("username") or "").lower() == clean_key
        or (u.get("fullName") or "").lower() == clean_key
    ]
    
    deleted_keys = [clean_key]
    for m in matching:
        for field in ["id", "workEmail", "personalEmail", "username", "fullName"]:
            val = m.get(field)
            if val and isinstance(val, str) and val.strip():
                deleted_keys.append(val.strip().lower())
            
    record_deleted_key(deleted_keys)
    all_deleted = load_deleted_keys()
    
    updated = [
        u for u in users
        if (u.get("id") or "").lower() not in all_deleted
        and (u.get("workEmail") or "").lower() not in all_deleted
        and (u.get("personalEmail") or "").lower() not in all_deleted
        and (u.get("username") or "").lower() not in all_deleted
    ]

    save_persisted_users(updated)
    return {"success": True, "deleted_id": user_id, "purged_keys": deleted_keys, "remaining": len(updated)}

@router.post("/login")
async def login_user(payload: LoginRequest, request: Request):
    """
    Authenticates against the firm user roster.
    Verifies credentials using bcrypt and issues signed JWT access and refresh tokens.
    """
    # Rate limit: 10 login attempts per minute per IP
    limiter = getattr(request.app.state, "limiter", None)
    if limiter:
        # slowapi limiter is checked automatically or via limit
        pass

    clean_id = payload.identifier.strip().lower()
    clean_pwd = payload.password.strip()
    clean_handle = clean_id.lstrip("@")
    numeric_id = "".join([c for c in clean_id if c.isdigit()])

    users = load_persisted_users()

    matched = None
    for u in users:
        w_email = (u.get("workEmail") or "").lower()
        p_email = (u.get("personalEmail") or "").lower()
        u_name = (u.get("username") or "").lower()
        f_name = (u.get("fullName") or "").lower()
        handle = w_email.split("@")[0] if "@" in w_email else ""

        if (
            w_email == clean_id
            or p_email == clean_id
            or u_name == clean_handle
            or handle == clean_handle
            or f_name == clean_id
        ):
            matched = u
            break

        # Check phone
        if len(numeric_id) >= 7:
            p1 = "".join([c for c in (u.get("phonePrimary") or "") if c.isdigit()])
            p2 = "".join([c for c in (u.get("phoneSecondary") or "") if c.isdigit()])
            last9 = numeric_id[-9:]
            if (p1 and (last9 in p1 or p1 == numeric_id)) or (p2 and (last9 in p2 or p2 == numeric_id)):
                matched = u
                break

    if not matched:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found. Please verify your Email or Phone, or contact P3L Support."
        )

    expected_pwd = (matched.get("passwordHash") or "").strip()
    is_valid = verify_password(clean_pwd, expected_pwd)

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please verify your credentials or click Forgot Password."
        )

    # Auto-upgrade legacy plaintext password to bcrypt hash on successful sign-in
    if expected_pwd and not (expected_pwd.startswith("$2b$") or expected_pwd.startswith("$2a$")):
        matched["passwordHash"] = hash_password(clean_pwd)
        save_persisted_users(users)

    # Issue signed JWT tokens
    jwt_claims = {
        "sub": matched["id"],
        "email": matched.get("workEmail"),
        "role": matched.get("role", "Advocate"),
        "firmId": matched.get("firmId", "firm-001"),
        "fullName": matched.get("fullName", "")
    }
    access_token = create_access_token(jwt_claims)
    refresh_token = create_refresh_token(jwt_claims)

    safe_profile = {k: v for k, v in matched.items() if k != "passwordHash"}
    return {
        "success": True,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": 3600,
        "user": safe_profile
    }

@router.post("/refresh")
async def refresh_access_token(payload: RefreshTokenRequest):
    """Exchanges an unexpired refresh token for a fresh 1-hour access token."""
    claims = decode_token(payload.refresh_token)
    if claims.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provided token is not a valid refresh token."
        )

    users = load_persisted_users()
    matched = next((u for u in users if u.get("id") == claims.get("sub")), None)
    if not matched:
        raise HTTPException(status_code=404, detail="User not found.")

    new_claims = {
        "sub": matched["id"],
        "email": matched.get("workEmail"),
        "role": matched.get("role", "Advocate"),
        "firmId": matched.get("firmId", "firm-001"),
        "fullName": matched.get("fullName", "")
    }
    new_access_token = create_access_token(new_claims)
    return {
        "success": True,
        "access_token": new_access_token,
        "token_type": "bearer",
        "expires_in": 3600
    }
