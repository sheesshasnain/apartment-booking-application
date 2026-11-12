# Apartment Booking Application

FastAPI + MySQL apartment booking API built to meet the supplied assignment brief.

## Features
- Email/password registration and JWT login; passwords are Argon2-hashed.
- Apartment listing and filters: city, price range, bedrooms and available date range.
- Admin-only apartment create/update/soft-delete.
- Authenticated booking creation, user's own booking list/cancellation, admin-wide booking list.
- Date validation, nightly total calculation and overlap rejection.
- Docker image, Compose stack, MySQL volume/health check and pytest tests.

## Run locally with Docker Compose
1. Copy `.env.example` to `.env`.
2. Replace all placeholder passwords and `SECRET_KEY` with strong unique values.
3. Set `APP_IMAGE` to your published image name/tag in `.env`.
4. Build locally for development: `docker build -t apartment-booking:dev .`
5. For local build testing, temporarily set `APP_IMAGE=apartment-booking:dev` in `.env`, then run `docker compose up -d`.
6. Open http://localhost:8000/docs and check http://localhost:8000/health.

The deployment Compose file deliberately uses `image:` rather than `build:` as required. Push the image to a registry before deploying.

## Seeded admin
The SQL seed creates five apartments. Create an admin account securely by registering, then promote that account in MySQL:
`UPDATE users SET role='admin' WHERE email='your-admin-email@example.com';`
Do not store an admin password in source control.

## Tests
Create a virtual environment, install `requirements.txt`, then run `pytest -q`.
The tests use an isolated in-memory SQLite database.

## Docker Hub
`docker build -t YOUR_DOCKERHUB_USERNAME/apartment-booking:1.0.0 .`
`docker login`
`docker push YOUR_DOCKERHUB_USERNAME/apartment-booking:1.0.0`
Then update `APP_IMAGE` in `.env` to the pushed image.

## AWS EC2 deployment (SSH-only)
- Launch Ubuntu 22.04/24.04, at least 20 GB gp3.
- Security group inbound: only TCP 22 from your public IP `/32`; no web/database ports.
- Install Docker Engine and Compose plugin from Docker's official repository.
- Copy `docker-compose.yml` and `.env` to EC2; ensure `.env` is chmod 600.
- Run `docker compose pull && docker compose up -d`.
- From your computer: `ssh -i key.pem -L 8000:localhost:8000 ubuntu@EC2_PUBLIC_IP`
- Browse `http://localhost:8000`.
- Verify with `docker compose ps`, `docker compose logs`, and `curl localhost:8000/health`.

## Important security note
The assignment requires preventing overlapping bookings. The application checks overlap before insert; for production-grade concurrent booking safety, add a transaction/locking strategy (for example, lock the apartment row during booking) to avoid simultaneous requests racing between check and insert.
