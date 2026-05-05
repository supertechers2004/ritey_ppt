from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
from urllib.parse import quote_plus
load_dotenv()

# Use full PPT_URL if provided (e.g. Neon with sslmode=require), else build from parts
DATABASE_URL = os.getenv("PPT_URL") or "postgresql://{}:{}@{}:{}/{}".format(
    os.getenv("DB_USER"),
    quote_plus(os.getenv("DB_PASSWORD", "")),
    os.getenv("DB_HOST", "localhost"),
    os.getenv("DB_PORT", "5432"),
    os.getenv("DB_NAME"),
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()