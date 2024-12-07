from sqlalchemy import Column, Integer, String, Float, JSON, DateTime
from sqlalchemy.sql import func
from database import Base
import uuid

class PuzzleResult(Base):
    __tablename__ = "puzzle_results"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String, index=True)  
    method = Column(String, index=True)
    solution = Column(JSON)
    elapsed_time = Column(Float)
    move_count = Column(Integer) 
    is_solved = Column(Integer)
    size = Column(Integer)

    timestamp = Column(DateTime, server_default=func.now())  
