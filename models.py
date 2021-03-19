from datetime import datetime
from os import getenv

from sqlalchemy import BigInteger, Boolean, Column, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql.sqltypes import Boolean, Date
from sqlalchemy_utils import create_database, database_exists

Base = declarative_base()

engine = create_engine(getenv("DATABASE_URL", "sqlite:///test.db"))

if not database_exists(engine.url):
    create_database(engine.url)

Session = sessionmaker(bind=engine)
session = Session()


class Warzone(Base):
    __tablename__ = "warzone"
    battletag = Column(String, primary_key=True)
    channel_id = Column(BigInteger, nullable=True)
    member_id = Column(BigInteger, nullable=False)
    track = Column(Boolean, nullable=False, default=False)
    last_match = Column(String, nullable=True)


class User(Base):
    __tablename__ = "user"
    member_id = Column(BigInteger, primary_key=True)
    guild_id = Column(BigInteger, primary_key=True)
    birthday = Column(Date, nullable=True)
    name = Column(String, nullable=False)


class BDay(Base):
    __tablename__ = "bday"
    guild_id = Column(BigInteger, primary_key=True)
    channel_id = Column(BigInteger, default=None)
    last_notify = Column(Date, nullable=True)


Base.metadata.create_all(engine)
