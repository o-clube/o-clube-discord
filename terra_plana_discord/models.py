import os

from sqlalchemy import create_engine, Column, String, Integer, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

engine = create_engine(os.getenv('DATABASE_URL', 'sqlite:///test.db'))

Base = declarative_base()

Session = sessionmaker(bind=engine)
session = Session()

class Stock(Base):
    __tablename__ = 'stocks'

    id = Column(String, primary_key=True)
    last_price = Column(Numeric, nullable=True)

class StockMessage(Base):
    __tablename__ = 'stocks_message'

    id = Column(Integer, primary_key=True)

Base.metadata.create_all(engine)
