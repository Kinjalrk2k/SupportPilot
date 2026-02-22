from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import create_engine
from dotenv import load_dotenv
import os
from typing import Annotated
from fastapi import Depends

load_dotenv()

DATABSE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABSE_URL)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def get_db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

SessionDep = Annotated[Session, Depends(get_db_session)]