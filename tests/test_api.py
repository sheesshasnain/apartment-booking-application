from datetime import date, timedelta
from decimal import Decimal
from app.models import User, Apartment
from app.security import hash_password

def register(client, email="user@example.com"):
    return client.post("/api/auth/register", json={"name":"Test User","email":email,"password":"strongpass123"})

def login(client, email="user@example.com"):
    return client.post("/api/auth/login", json={"email":email,"password":"strongpass123"}).json()["access_token"]

def seed_admin_and_apartment(db):
    admin = User(name="Admin", email="admin@example.com", password_hash=hash_password("strongpass123"), role="admin")
    apartment = Apartment(title="Test Apartment", description="", city="Lahore", address="Test Road",
                          price_per_night=Decimal("5000.00"), bedrooms=2, is_active=True)
    db.add_all([admin, apartment])
    db.commit()
    return apartment

def test_register_and_login(client):
    assert register(client).status_code == 201
    assert client.post("/api/auth/login", json={"email":"user@example.com","password":"strongpass123"}).status_code == 200

def test_duplicate_email_rejected(client):
    register(client)
    assert register(client).status_code == 409

def test_wrong_password_rejected(client):
    register(client)
    assert client.post("/api/auth/login", json={"email":"user@example.com","password":"wrongpassword"}).status_code == 401

def test_admin_can_create_apartment(client, db_session):
    seed_admin_and_apartment(db_session)
    token = login(client, "admin@example.com")
    response = client.post("/api/apartments", headers={"Authorization":f"Bearer {token}"}, json={
        "title":"Second Apartment","city":"Lahore","address":"Main Boulevard","price_per_night":7000,"bedrooms":2
    })
    assert response.status_code == 201

def test_non_admin_cannot_create_apartment(client):
    register(client)
    token = login(client)
    response = client.post("/api/apartments", headers={"Authorization":f"Bearer {token}"}, json={
        "title":"No Access Apartment","city":"Lahore","address":"Main Boulevard","price_per_night":7000,"bedrooms":2
    })
    assert response.status_code == 403

def test_overlapping_booking_is_rejected(client, db_session):
    apartment = seed_admin_and_apartment(db_session)
    register(client)
    token = login(client)
    headers = {"Authorization":f"Bearer {token}"}
    start = date.today() + timedelta(days=10)
    first = client.post("/api/bookings", headers=headers, json={
        "apartment_id":apartment.id,"check_in":start.isoformat(),"check_out":(start+timedelta(days=3)).isoformat()
    })
    second = client.post("/api/bookings", headers=headers, json={
        "apartment_id":apartment.id,"check_in":(start+timedelta(days=1)).isoformat(),"check_out":(start+timedelta(days=4)).isoformat()
    })
    assert first.status_code == 201
    assert first.json()["total_price"] == "15000.00"
    assert second.status_code == 409

def test_health_endpoint(client):
    assert client.get("/health").json() == {"status":"healthy"}
