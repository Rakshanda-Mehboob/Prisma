
"""
database.py — SQLAlchemy engine, session factory, and get_db dependency.
SQLite file: server/app.db (auto-created on first run, gitignored).
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # Required for SQLite + FastAPI
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency — yields a DB session and ensures it's closed after."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
