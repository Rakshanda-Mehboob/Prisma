from logging.config import fileConfig
import sys
import os

# Put the server/ directory on the path so imports resolve
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import engine_from_config, pool
from alembic import context

# Alembic Config object (access to alembic.ini values)
config = context.config

# Set up Python logging from the .ini file
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import our metadata and DB URL
from database import Base, engine as _app_engine
import models  # noqa: F401 — registers all ORM models with Base.metadata
from config import DATABASE_URL  # noqa: F401

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode (no live DB connection required)."""
    url = DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=True,  # Required for SQLite ALTER TABLE support
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode using the application engine."""
    with _app_engine.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch=True,  # Required for SQLite ALTER TABLE support
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
