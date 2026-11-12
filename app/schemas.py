from datetime import date, datetime
from decimal import Decimal
from pydantic import BaseModel, EmailStr, ConfigDict, Field

class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    model_config = ConfigDict(from_attributes=True)

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ApartmentIn(BaseModel):
    title: str = Field(min_length=3, max_length=180)
    description: str = ""
    city: str
    address: str
    price_per_night: Decimal = Field(gt=0)
    bedrooms: int = Field(ge=0)

class ApartmentOut(ApartmentIn):
    id: int
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

class BookingCreate(BaseModel):
    apartment_id: int
    check_in: date
    check_out: date

class BookingOut(BaseModel):
    id: int
    apartment_id: int
    user_id: int
    check_in: date
    check_out: date
    total_price: Decimal
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
