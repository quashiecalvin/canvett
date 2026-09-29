"""One-off schema reset.

Drops every table and recreates it to match the current SQLAlchemy models. This
is for bringing a database with an old or partial schema fully up to date when
its data is expendable (it WILL delete all rows). Run it inside the deployed
machine, which already has the DATABASE_URL configured:

    fly ssh console -C "python reset_schema.py"

Do not run this against a database whose data you want to keep.
"""
from database.connection import engine, Base

# Importing the model modules registers every table on Base.metadata.
from database import (  # noqa: F401
    models_user,
    models_job,
    models_candidate,
    models_application,
    models_saved,
    models_settings,
    models_activity,
    models_reset,
)


def main():
    print("Dropping all existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all tables from the current models...")
    Base.metadata.create_all(bind=engine)
    print("Schema reset complete.")


if __name__ == "__main__":
    main()
