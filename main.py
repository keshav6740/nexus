from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
import pandas as pd
import uvicorn
from typing import List
import datetime

app = FastAPI(title="Nexus Backend API")

# -----------------------------
# Load Sample CSV Data
# -----------------------------
PROJECTS_CSV = "sample_data.csv"
try:
    projects_df = pd.read_csv(PROJECTS_CSV, parse_dates=['created_at'])
except Exception as e:
    projects_df = pd.DataFrame([])
    print("Error loading CSV:", e)

# -----------------------------
# Pydantic Models
# -----------------------------
class Project(BaseModel):
    project_id: int
    project_name: str
    project_type: str
    square_footage: float
    num_floors: int
    soil_condition_score: float
    complexity_score: float
    initial_estimated_duration: int
    initial_estimated_cost: float
    avg_daily_workers: int
    equipment_utilization_rate: float
    actual_duration: float
    actual_cost_overrun: float
    created_at: datetime.datetime
    status: str

# For user authentication (dummy in-memory store)
class User(BaseModel):
    username: str
    password: str

# -----------------------------
# Dummy User Store
# -----------------------------
users = {}

# -----------------------------
# Endpoints
# -----------------------------

# Signup Endpoint
@app.post("/signup")
def signup(user: User):
    if user.username in users:
        raise HTTPException(status_code=400, detail="User already exists")
    users[user.username] = user.password
    return {"message": "Signup successful"}

# Login Endpoint
@app.post("/login")
def login(user: User):
    if user.username not in users or users[user.username] != user.password:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    # In production, return a secure JWT token. Here we return a dummy token.
    return {"message": "Login successful", "token": "dummy_token"}

# Get Projects Endpoint
@app.get("/projects", response_model=List[Project])
def get_projects():
    if projects_df.empty:
        return []
    projects = projects_df.to_dict(orient="records")
    return projects

# Sample Automation Hook Endpoint (e.g., for n8n integration)
@app.post("/automation/hook")
def automation_hook(data: dict):
    # Process the incoming automation request.
    # For example, trigger workflows, update status, etc.
    return {"message": "Automation hook received", "data": data}

# -----------------------------
# Run the Application
# -----------------------------
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
