from pydantic import BaseModel, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def username_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if len(v) > 32:
            raise ValueError("Username must be 32 characters or fewer")
        return v

    @field_validator("password")
    @classmethod
    def password_valid(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

class UserResponse(BaseModel):
    id: int
    username: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class Ppt(BaseModel):
    feedback: Optional[str] = None
    num_slide: Optional[int] = None
    topic: Optional[str] = None
    action: Optional[str] = None
    last_update: Optional[str] = None
    thread_id: Optional[str] = None
    theme: Optional[str] = None  # Added theme support

class ThreadResponse(BaseModel):
    thread_id: str
    topic: str
    updated_at: datetime
    last_update: str
    img_path: Optional[str] = None
    theme: Optional[str] = None

    class Config:
        from_attributes = True

class ThreadWithStateResponse(BaseModel):
    thread: ThreadResponse
    outline: List
    detailed_slides: List[Dict]

class CustomPptRequest(BaseModel):
    title: str
    slides_data: List[Dict[str, Any]]
    theme: Optional[str] = None
    thread_id: Optional[str] = None
