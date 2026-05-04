from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    threads = relationship("Thread", back_populates="owner")

class Thread(Base):
    __tablename__ = "thread"

    thread_id = Column(String, primary_key=True, index=True)
    topic = Column(String, nullable=False)
    last_update = Column(String, nullable=False, server_default='update')
    num_slide = Column(Integer, nullable=False, server_default='5')
    img_path = Column(String, nullable=True)
    theme = Column(String, nullable=True)  # Store the selected template name
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Allow null for now so existing threads don't crash
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="threads")