from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os
import time

# SQLAlchemy imports
from sqlalchemy import create_engine, Column, String, Integer, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship

# Database Connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/youtube_channels")

# Wait for DB to be ready (simple retry logic for Docker startup)
engine = None
for i in range(10):
    try:
        engine = create_engine(DATABASE_URL)
        engine.connect()
        break
    except Exception:
        print("Waiting for database...")
        time.sleep(2)

if not engine:
    raise Exception("Could not connect to database")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- DB Models ---
class ChannelModel(Base):
    __tablename__ = "channels"

    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text, nullable=True)
    thumb = Column(String)
    subs = Column(String)
    video_count = Column(String) # Mapped from videoCount
    view_count = Column(String)  # Mapped from viewCount
    created = Column(String)
    saved_at = Column(String)    # Mapped from savedAt
    
    history = relationship("HistoryModel", back_populates="channel", cascade="all, delete-orphan")

class HistoryModel(Base):
    __tablename__ = "history"

    id = Column(Integer, primary_key=True, index=True)
    channel_id = Column(String, ForeignKey("channels.id"))
    date = Column(String)
    subs = Column(String)
    video_count = Column(String)
    view_count = Column(String)

    channel = relationship("ChannelModel", back_populates="history")

# Create Tables
Base.metadata.create_all(bind=engine)

# --- Pydantic Schemas (API) ---
class ChannelHistory(BaseModel):
    date: str
    subs: str
    videoCount: str
    viewCount: str

    class Config:
        orm_mode = True

class Channel(BaseModel):
    id: str
    title: str
    description: Optional[str] = ""
    thumb: str
    subs: str
    videoCount: str
    viewCount: str
    created: str
    savedAt: Optional[str] = None
    history: List[ChannelHistory] = []

    class Config:
        orm_mode = True

app = FastAPI()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Endpoints ---

@app.get("/")
def read_root():
    return {"message": "YouTube Channel Search API is running with PostgreSQL"}

@app.get("/channels", response_model=List[Channel])
def get_channels(db: Session = Depends(get_db)):
    channels = db.query(ChannelModel).all()
    # Map DB models to Pydantic models manually or let Pydantic handle it if names match.
    # Since we changed some snake_case to camelCase mapping might need care, 
    # but let's try to map explicit fields for safety or align names.
    # To keep it simple, I'll return list of dicts that match the schema.
    
    results = []
    for c in channels:
        history_list = [
            ChannelHistory(
                date=h.date, 
                subs=h.subs, 
                videoCount=h.video_count, 
                viewCount=h.view_count
            ) for h in c.history
        ]
        results.append(Channel(
            id=c.id,
            title=c.title,
            description=c.description,
            thumb=c.thumb,
            subs=c.subs,
            videoCount=c.video_count,
            viewCount=c.view_count,
            created=c.created,
            savedAt=c.saved_at,
            history=history_list
        ))
    return results

@app.post("/channels")
def save_channel(channel: Channel, db: Session = Depends(get_db)):
    existing_channel = db.query(ChannelModel).filter(ChannelModel.id == channel.id).first()
    
    # Prepare history snapshot
    history_date = datetime.now().isoformat()
    
    if existing_channel:
        # Update existing
        existing_channel.subs = channel.subs
        existing_channel.video_count = channel.videoCount
        existing_channel.view_count = channel.viewCount
        # Add history
        new_history = HistoryModel(
            channel_id=channel.id,
            date=history_date,
            subs=channel.subs,
            video_count=channel.videoCount,
            view_count=channel.viewCount
        )
        db.add(new_history)
        db.commit()
        db.refresh(existing_channel)
        
        # Return converted object
        # (Simplified for brevity, assuming standard fetch logic works)
        return Channel(
            id=existing_channel.id,
            title=existing_channel.title,
            description=existing_channel.description,
            thumb=existing_channel.thumb,
            subs=existing_channel.subs,
            videoCount=existing_channel.video_count,
            viewCount=existing_channel.view_count,
            created=existing_channel.created,
            savedAt=existing_channel.saved_at,
            history=[ChannelHistory(date=h.date, subs=h.subs, videoCount=h.video_count, viewCount=h.view_count) for h in existing_channel.history]
        )

    else:
        # Create New
        saved_at = channel.savedAt or datetime.now().isoformat()
        
        new_channel = ChannelModel(
            id=channel.id,
            title=channel.title,
            description=channel.description,
            thumb=channel.thumb,
            subs=channel.subs,
            video_count=channel.videoCount,
            view_count=channel.viewCount,
            created=channel.created,
            saved_at=saved_at
        )
        db.add(new_channel)
        db.commit() # Commit to get the ID ready for foreign key if needed (though we set ID manually)
        
        # Add initial history
        first_history = HistoryModel(
            channel_id=channel.id,
            date=history_date,
            subs=channel.subs,
            video_count=channel.videoCount,
            view_count=channel.viewCount
        )
        db.add(first_history)
        db.commit()
        db.refresh(new_channel)
        
        return channel # Return input as it matches the new state basically

@app.delete("/channels/{channel_id}")
def delete_channel(channel_id: str, db: Session = Depends(get_db)):
    channel = db.query(ChannelModel).filter(ChannelModel.id == channel_id).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    db.delete(channel)
    db.commit()
    return {"message": "Channel deleted"}

# CORS setup
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
