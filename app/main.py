from contextlib import asynccontextmanager
from datetime import date
from decimal import Decimal
from fastapi import FastAPI, Depends, HTTPException, Query, status
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import Session
from app.database import Base, engine, get_db
from app import models, schemas
from app.security import hash_password, verify_password, create_access_token
from app.dependencies import get_current_user, require_admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="Apartment Booking API", version="1.0.0", lifespan=lifespan)

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/api/auth/register", response_model=schemas.UserOut, status_code=201)
def register(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    email = payload.email.lower()
    if db.scalar(select(models.User).where(models.User.email == email)):
        raise HTTPException(409, "Email is already registered")
    user = models.User(name=payload.name, email=email, password_hash=hash_password(payload.password))
    db.add(user); db.commit(); db.refresh(user)
    return user

@app.post("/api/auth/login", response_model=schemas.TokenOut)
def login(payload: schemas.LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(models.User).where(models.User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(401, "Incorrect email or password")
    return {"access_token": create_access_token(str(user.id)), "token_type": "bearer"}



@app.get("/api/auth/me")
def get_my_profile(
    user: models.User = Depends(get_current_user)
):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
    }

@app.get("/api/admin/customers")
def get_admin_customers(
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin),
):
    users = db.scalars(
        select(models.User).order_by(models.User.id.desc())
    ).all()

    bookings = db.scalars(
        select(models.Booking)
    ).all()

    customer_data = []

    for user in users:
        user_bookings = [
            booking
            for booking in bookings
            if booking.user_id == user.id
        ]

        confirmed_bookings = [
            booking
            for booking in user_bookings
            if booking.status == "confirmed"
        ]

        customer_data.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "total_bookings": len(user_bookings),
            "confirmed_bookings": len(confirmed_bookings),
            "total_booking_value": str(
                sum(
                    (
                        booking.total_price
                        for booking in confirmed_bookings
                    ),
                    Decimal("0")
                )
            ),
        })

    return customer_data


@app.get("/api/apartments", response_model=list[schemas.ApartmentOut])
def list_apartments(city: str | None = None, min_price: Decimal | None = Query(None, gt=0),
                    max_price: Decimal | None = Query(None, gt=0), bedrooms: int | None = Query(None, ge=0),
                    check_in: date | None = None, check_out: date | None = None,
                    db: Session = Depends(get_db)):
    stmt = select(models.Apartment).where(models.Apartment.is_active.is_(True))
    if city: stmt = stmt.where(models.Apartment.city.ilike(f"%{city}%"))
    if min_price is not None: stmt = stmt.where(models.Apartment.price_per_night >= min_price)
    if max_price is not None: stmt = stmt.where(models.Apartment.price_per_night <= max_price)
    if bedrooms is not None: stmt = stmt.where(models.Apartment.bedrooms >= bedrooms)
    if check_in or check_out:
        if not check_in or not check_out or check_out <= check_in or check_in < date.today():
            raise HTTPException(400, "Provide valid future check_in and check_out dates")
        conflict = select(models.Booking.id).where(
            models.Booking.apartment_id == models.Apartment.id,
            models.Booking.status == "confirmed",
            models.Booking.check_in < check_out,
            models.Booking.check_out > check_in
        ).exists()
        stmt = stmt.where(~conflict)
    return db.scalars(stmt.order_by(models.Apartment.id)).all()

@app.get("/api/apartments/{apartment_id}", response_model=schemas.ApartmentOut)
def apartment_detail(apartment_id: int, db: Session = Depends(get_db)):
    apartment = db.get(models.Apartment, apartment_id)
    if not apartment or not apartment.is_active: raise HTTPException(404, "Apartment not found")
    return apartment

@app.post("/api/apartments", response_model=schemas.ApartmentOut, status_code=201)
def create_apartment(payload: schemas.ApartmentIn, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    apartment = models.Apartment(**payload.model_dump())
    db.add(apartment); db.commit(); db.refresh(apartment)
    return apartment

@app.put("/api/apartments/{apartment_id}", response_model=schemas.ApartmentOut)
def update_apartment(apartment_id: int, payload: schemas.ApartmentIn, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    apartment = db.get(models.Apartment, apartment_id)
    if not apartment: raise HTTPException(404, "Apartment not found")
    for key, value in payload.model_dump().items(): setattr(apartment, key, value)
    db.commit(); db.refresh(apartment)
    return apartment

@app.delete("/api/apartments/{apartment_id}", status_code=204)
def delete_apartment(apartment_id: int, db: Session = Depends(get_db), _: models.User = Depends(require_admin)):
    apartment = db.get(models.Apartment, apartment_id)
    if not apartment: raise HTTPException(404, "Apartment not found")
    apartment.is_active = False
    db.commit()

@app.post("/api/bookings", response_model=schemas.BookingOut, status_code=201)
def create_booking(payload: schemas.BookingCreate, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if payload.check_in < date.today() or payload.check_out <= payload.check_in:
        raise HTTPException(400, "Check-out must be after check-in and check-in cannot be in the past")
    apartment = db.get(models.Apartment, payload.apartment_id)
    if not apartment or not apartment.is_active: raise HTTPException(404, "Apartment not found")
    conflict = db.scalar(select(models.Booking.id).where(
        models.Booking.apartment_id == apartment.id,
        models.Booking.status == "confirmed",
        models.Booking.check_in < payload.check_out,
        models.Booking.check_out > payload.check_in
    ).limit(1))
    if conflict: raise HTTPException(409, "Apartment is already booked for overlapping dates")
    nights = (payload.check_out - payload.check_in).days
    booking = models.Booking(user_id=user.id, apartment_id=apartment.id, check_in=payload.check_in,
                             check_out=payload.check_out, total_price=Decimal(str(apartment.price_per_night)) * nights)
    db.add(booking); db.commit(); db.refresh(booking)
    return booking

@app.get("/api/bookings", response_model=list[schemas.BookingOut])
def list_bookings(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    stmt = select(models.Booking)
    if user.role != "admin": stmt = stmt.where(models.Booking.user_id == user.id)
    return db.scalars(stmt.order_by(models.Booking.created_at.desc())).all()

@app.delete("/api/bookings/{booking_id}", status_code=204)
def cancel_booking(booking_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    booking = db.get(models.Booking, booking_id)
    if not booking: raise HTTPException(404, "Booking not found")
    if user.role != "admin" and booking.user_id != user.id: raise HTTPException(403, "You can only cancel your own bookings")
    booking.status = "cancelled"
    db.commit()
