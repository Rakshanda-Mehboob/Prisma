"""
database.py — SQLAlchemy engine, session factory, and get_db dependency.

Manages SQLite connection pooling, metadata declarations, and session lifecycles.
Default SQLite file: server/app.db (auto-created on first run, excluded from git).
"""

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase, Session
from config import DATABASE_URL

SQLALCHEMY_DATABASE_URL: str = DATABASE_URL

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # Required for SQLite concurrency in FastAPI
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy declarative models in the application."""
    pass


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that yields a SQLAlchemy database session for each request
    and guarantees that the session is closed cleanly upon request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
