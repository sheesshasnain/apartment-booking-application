
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, Trash2 } from "lucide-react";
import { bookingAPI, apartmentAPI } from "../services/api";

export default function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [apartments, setApartments] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");

  async function loadBookings() {
    setLoading(true);
    setError("");

    try {
      const data = await bookingAPI.getAll();
      setBookings(data);

      const apartmentIds = [
        ...new Set(data.map((booking) => booking.apartment_id)),
      ];

      const results = await Promise.allSettled(
        apartmentIds.map((id) => apartmentAPI.getById(id))
      );

      const apartmentMap = {};

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          apartmentMap[apartmentIds[index]] = result.value;
        }
      });

      setApartments(apartmentMap);
    } catch (err) {
      if (err.status === 401) {
  localStorage.removeItem("access_token");
  window.dispatchEvent(new Event("auth-changed"));
  navigate("/login", { replace: true });
  return;
}

      setError(err.message || "Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function cancelBooking(id) {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setBusy(id);
    setError("");

    try {
      await bookingAPI.cancel(id);
      await loadBookings();
    } catch (err) {
      setError(err.message || "Unable to cancel booking.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4]">
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft size={17} />
          Back to home
        </Link>

        <p className="mt-16 text-xs uppercase tracking-[0.25em] text-[#7a8779]">
          Your reservations
        </p>

        <h1 className="mt-4 font-serif text-5xl">
          My bookings
        </h1>

        <p className="mt-4 text-stone-500">
          View and manage your apartment reservations.
        </p>

        {loading && (
          <p role="status" className="mt-10 text-stone-500">
            Loading your bookings...
          </p>
        )}

        {error && (
          <p role="alert" className="mt-8 text-sm text-red-700">
            {error}
          </p>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="mt-12 rounded-3xl border border-stone-200 bg-white p-10 text-center">
            <h2 className="font-serif text-3xl">
              No bookings yet.
            </h2>

            <p className="mt-3 text-stone-500">
              Explore our residences and find your next stay.
            </p>

            <Link
              to="/#residences"
              className="mt-7 inline-block rounded-full bg-[#303b33] px-7 py-4 text-sm text-white"
            >
              Explore residences
            </Link>
          </div>
        )}

        {!loading && (
          <div className="mt-10 space-y-5">
            {bookings.map((booking) => {
              const apartment = apartments[booking.apartment_id];

              const isCancelled =
                booking.status?.toLowerCase() === "cancelled";

              return (
                <article
                  key={booking.id}
                  className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-stone-400">
                        Booking #{booking.id}
                      </p>

                      <h2 className="mt-2 font-serif text-2xl">
                        {apartment?.title ||
                          `Apartment #${booking.apartment_id}`}
                      </h2>

                      {apartment && (
                        <p className="mt-2 flex items-center gap-2 text-sm text-stone-500">
                          <MapPin size={15} />
                          {apartment.city}
                        </p>
                      )}
                    </div>

                    <span
                      className={`rounded-full px-4 py-2 text-xs font-medium capitalize ${
                        isCancelled
                          ? "bg-stone-100 text-stone-500"
                          : "bg-[#e9ebe5] text-[#303b33]"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-stone-100 pt-5 text-sm text-stone-600">
                    <CalendarDays size={17} />

                    <span>{booking.check_in}</span>
                    <span>→</span>
                    <span>{booking.check_out}</span>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-stone-400">
                        Total price
                      </p>

                      <p className="mt-1 text-xl font-semibold">
                        ${Number(booking.total_price).toLocaleString()}
                      </p>
                    </div>

                    {!isCancelled && (
                      <button
                        type="button"
                        disabled={busy !== null}
                        onClick={() => cancelBooking(booking.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 px-5 py-3 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={16} />

                        {busy === booking.id
                          ? "Cancelling..."
                          : "Cancel booking"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
