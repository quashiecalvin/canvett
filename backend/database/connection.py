import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://kayhunter@localhost:5432/canvett",
)

# Connection tuning. Against a managed Postgres like Neon the app talks to the
# database over the network, and idle connections get dropped by the provider.
# Without pooling care, many requests pay for a brand-new connection (a full
# TLS + auth handshake), which is slow and shows up as multi-second responses.
#
# - pool_pre_ping: check a pooled connection is still alive before using it, so a
#   dropped connection is transparently replaced instead of erroring or hanging.
# - pool_recycle: proactively refresh connections older than 5 minutes so we
#   never hand out one the provider is about to close.
# - keepalives: keep otherwise-idle TCP connections warm so they survive between
#   requests rather than being torn down and rebuilt.
# For local SQLite/other setups these psycopg2 args are harmless; they only apply
# to PostgreSQL, which is what both dev and production use here.
_is_postgres = DATABASE_URL.startswith("postgres")

_engine_kwargs = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
    "pool_size": 5,
    "max_overflow": 5,
}
if _is_postgres:
    _engine_kwargs["connect_args"] = {
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
        "connect_timeout": 10,
    }

engine = create_engine(DATABASE_URL, **_engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
