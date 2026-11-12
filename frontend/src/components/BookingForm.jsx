
import { useState } from "react";
import { Link } from "react-router-dom";
import { bookingAPI } from "../services/api";

function dateToday() {
  const d = new Date();

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function nextDay(date) {
  if (!date) return dateToday();

  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);

  return d.toISOString().slice(0, 10);
}

export default function BookingForm({
  apartment,
  isLoggedIn,
  onSignIn,
}) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const nights =
    checkIn && checkOut
      ? Math.round(
          (Date.parse(`${checkOut}T00:00:00Z`) -
            Date.parse(`${checkIn}T00:00:00Z`)) /
            86400000
        )
      : 0;

  const valid =
    Boolean(checkIn && checkOut) &&
    checkIn >= dateToday() &&
    nights > 0;

  const totalPrice =
    nights * Number(apartment.price_per_night);

  async function handleBooking() {
    if (busy || success) return;

    setError("");

    if (!isLoggedIn) {
      onSignIn();
      return;
    }

    if (!valid) {
      setError(
        "Please select valid check-in and check-out dates."
      );
      return;
    }

    setBusy(true);

    try {
      await bookingAPI.create({
        apartment_id: apartment.id,
        check_in: checkIn,
        check_out: checkOut,
      });

      setSuccess(true);
    } catch (err) {
      setError(
        err.message || "Booking failed. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 space-y-5 border-t border-stone-200 pt-6">
      <h3 className="font-serif text-2xl">
        Reserve your stay
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <label className="text-sm">
          Check-in

          <input
            type="date"
            min={dateToday()}
            value={checkIn}
            disabled={busy || success}
            onChange={(e) => {
              setCheckIn(e.target.value);
              setCheckOut("");
              setError("");
            }}
            className="mt-2 w-full rounded-xl border border-stone-200 bg-white p-3"
          />
        </label>

        <label className="text-sm">
          Check-out

          <input
            type="date"
            min={nextDay(checkIn)}
            value={checkOut}
            disabled={!checkIn || busy || success}
            onChange={(e) => {
              setCheckOut(e.target.value);
              setError("");
            }}
            className="mt-2 w-full rounded-xl border border-stone-200 bg-white p-3"
          />
        </label>
      </div>

      {valid && !success && (
        <div className="flex items-center justify-between rounded-xl bg-[#e9ebe5] p-4 text-sm">
          <span>
            {nights} night{nights !== 1 ? "s" : ""}
          </span>

          <strong>
            ${totalPrice.toLocaleString()}
          </strong>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {success ? (
        <div
          role="status"
          className="space-y-4 rounded-2xl bg-[#e9ebe5] p-5"
        >
          <p className="font-medium text-[#303b33]">
            Booking confirmed!
          </p>

          <p className="text-sm text-stone-600">
            Your reservation has been created successfully.
          </p>

          <Link
            to="/my-bookings"
            className="inline-block rounded-full bg-[#303b33] px-6 py-3 text-sm font-medium text-white"
          >
            View My Bookings
          </Link>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleBooking}
          disabled={busy}
          className="w-full rounded-full bg-[#303b33] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#465649] disabled:opacity-50"
        >
          {busy
            ? "Confirming..."
            : isLoggedIn
            ? "Confirm booking"
            : "Sign in to book"}
        </button>
      )}
    </div>
  );
}
