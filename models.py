from os import getenv

from sqlalchemy import Boolean, Column, BigInteger, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql.sqltypes import Boolean

Base = declarative_base()

engine = create_engine(getenv("DATABASE_URL", "sqlite:///test.db"))

Session = sessionmaker(bind=engine)
session = Session()


class Warzone(Base):
    __tablename__ = "warzone"
    battletag = Column(String, primary_key=True)
    channel_id = Column(BigInteger, nullable=True)
    member_id = Column(BigInteger, nullable=False)
    track = Column(Boolean, nullable=False, default=False)
    last_match = Column(String, nullable=True)


Base.metadata.create_all(engine)
