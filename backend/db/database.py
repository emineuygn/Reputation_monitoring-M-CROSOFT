from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def run_light_migrations():
    """create_all() yalnızca eksik tabloları oluşturur; mevcut 'reports'
    tablosuna sonradan eklenen kolonları burada elle ekliyoruz."""
    with engine.connect() as conn:
        existing = {row[1] for row in conn.execute(text("PRAGMA table_info(reports)"))}
        for column, ddl_type in (
            ("vergi_no", "VARCHAR(20)"),
            ("nace_kodu", "VARCHAR(20)"),
            ("user_id", "INTEGER REFERENCES users(id)"),
        ):
            if column not in existing:
                conn.execute(text(f"ALTER TABLE reports ADD COLUMN {column} {ddl_type}"))
        conn.commit()
