from server import SessionLocal, User, engine, Base
from datetime import datetime, timezone

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if users already exist
    if db.query(User).first() is None:
        # Create test users
        users = [
            User(
                name="Sarah Johnson",
                email="sarah@example.com",
                avatar="https://placehold.co/100",
                status="online",
                last_seen=datetime.now(timezone.utc)
            ),
            User(
                name="Michael Chen",
                email="michael@example.com",
                avatar="https://placehold.co/100",
                status="offline",
                last_seen=datetime.now(timezone.utc)
            ),
            User(
                name="Emily Wilson",
                email="emily@example.com",
                avatar="https://placehold.co/100",
                status="online",
                last_seen=datetime.now(timezone.utc)
            ),
            User(
                name="John Doe",
                email="john@example.com",
                avatar="https://placehold.co/100",
                status="online",
                last_seen=datetime.now(timezone.utc)
            )
        ]
        
        db.add_all(users)
        db.commit()

    db.close()

if __name__ == "__main__":
    init_db()