from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import uvicorn

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./projects.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class DBTeamMember(Base):
    __tablename__ = "team_members"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    avatar = Column(String)
    role = Column(String)
    project_id = Column(Integer, ForeignKey("projects.id"))

class DBTask(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    due_date = Column(String)
    completed = Column(Boolean, default=False)
    project_id = Column(Integer, ForeignKey("projects.id"))

class DBComment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    author = Column(String)
    avatar = Column(String)
    text = Column(String)
    date = Column(String)
    project_id = Column(Integer, ForeignKey("projects.id"))

class DBProject(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    category = Column(String)
    description = Column(String)
    deadline = Column(String)
    progress = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    team_members = relationship("DBTeamMember", cascade="all, delete-orphan")
    tasks = relationship("DBTask", cascade="all, delete-orphan")
    comments = relationship("DBComment", cascade="all, delete-orphan")

# Create database tables
Base.metadata.create_all(bind=engine)

# Pydantic Models
class TeamMember(BaseModel):
    id: Optional[int] = None
    name: str
    avatar: str
    role: str

    class Config:
        orm_mode = True

class Task(BaseModel):
    id: Optional[int] = None
    title: str
    description: str
    due_date: str
    completed: bool

    class Config:
        orm_mode = True

class Comment(BaseModel):
    id: Optional[int] = None
    author: str
    avatar: str
    text: str
    date: str

    class Config:
        orm_mode = True

class ProjectBase(BaseModel):
    title: str
    category: str
    description: str
    deadline: str
    progress: int

class ProjectCreate(ProjectBase):
    team_members: List[TeamMember] = []
    tasks: List[Task] = []
    comments: List[Comment] = []

class Project(ProjectBase):
    id: int
    created_at: datetime
    team_members: List[TeamMember] = []
    tasks: List[Task] = []
    comments: List[Comment] = []

    class Config:
        orm_mode = True

# FastAPI app
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API Routes
@app.get("/api/projects", response_model=List[Project])
def get_projects():
    db = SessionLocal()
    projects = db.query(DBProject).all()
    return projects

@app.post("/api/projects", response_model=Project)
def create_project(project: ProjectCreate):
    db = SessionLocal()
    db_project = DBProject(
        title=project.title,
        category=project.category,
        description=project.description,
        deadline=project.deadline,
        progress=project.progress
    )
    
    for member in project.team_members:
        db_member = DBTeamMember(**member.dict(exclude_unset=True))
        db_project.team_members.append(db_member)
    
    for task in project.tasks:
        db_task = DBTask(**task.dict(exclude_unset=True))
        db_project.tasks.append(db_task)
    
    for comment in project.comments:
        db_comment = DBComment(**comment.dict(exclude_unset=True))
        db_project.comments.append(db_comment)
    
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.put("/api/projects/{project_id}", response_model=Project)
def update_project(project_id: int, project: ProjectCreate):
    db = SessionLocal()
    db_project = db.query(DBProject).filter(DBProject.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    for field, value in project.dict(exclude={'team_members', 'tasks', 'comments'}).items():
        setattr(db_project, field, value)
    
    db_project.team_members = []
    for member in project.team_members:
        db_member = DBTeamMember(**member.dict(exclude_unset=True))
        db_project.team_members.append(db_member)
    
    db_project.tasks = []
    for task in project.tasks:
        db_task = DBTask(**task.dict(exclude_unset=True))
        db_project.tasks.append(db_task)
    
    db_project.comments = []
    for comment in project.comments:
        db_comment = DBComment(**comment.dict(exclude_unset=True))
        db_project.comments.append(db_comment)
    
    db.commit()
    db.refresh(db_project)
    return db_project

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int):
    db = SessionLocal()
    project = db.query(DBProject).filter(DBProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"message": "Project deleted"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)