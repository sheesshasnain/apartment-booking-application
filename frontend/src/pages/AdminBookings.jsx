
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  CalendarDays,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";

import {
  adminAPI,
  bookingAPI,
  apartmentAPI,
} from "../services/api";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [apartments, setApartments] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Format all booking amounts in Pakistani Rupees
  const formatPKR = (amount) => {
    const value = Number(amount ?? 0);

    return `PKR ${value.toLocaleString("en-PK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  async function loadBookings(showRefresh = false) {
    if (showRefresh) setRefreshing(true);
    setError("");

    try {
      const [bookingData, apartmentData] = await Promise.all([
        adminAPI.getBookings(),
        apartmentAPI.getAll(),
      ]);

      const apartmentMap = Object.fromEntries(
        apartmentData.map((apartment) => [
          apartment.id,
          apartment.title,
        ])
      );

      setBookings(bookingData);
      setApartments(apartmentMap);
    } catch (err) {
      setError(err.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function cancelBooking(booking) {
    if (booking.status !== "confirmed") return;

    const confirmed = window.confirm(
      `Are you sure you want to cancel booking #${booking.id}?`
    );

    if (!confirmed) return;

    setCancellingId(booking.id);
    setError("");
    setMessage("");

    try {
      await bookingAPI.cancel(booking.id);

      setMessage(
        `Booking #${booking.id} cancelled successfully.`
      );

      await loadBookings();
    } catch (err) {
      setError(
        err.message || "Failed to cancel booking."
      );
    } finally {
      setCancellingId(null);
    }
  }

  // Booking statistics
  const confirmedCount = bookings.filter(
    (booking) => booking.status === "confirmed"
  ).length;

  const cancelledCount = bookings.filter(
    (booking) => booking.status === "cancelled"
  ).length;

  const confirmedBookingValue = bookings
    .filter((booking) => booking.status === "confirmed")
    .reduce(
      (total, booking) =>
        total + Number(booking.total_price ?? 0),
      0
    );

  // Search and filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const query = search.trim().toLowerCase();

    const apartmentName =
      apartments[booking.apartment_id] ||
      `Apartment #${booking.apartment_id}`;

    const matchesSearch =
      String(booking.id).includes(query) ||
      String(booking.user_id).includes(query) ||
      apartmentName.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "all" ||
      booking.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-5 py-10 text-stone-900">
      <div className="mx-auto max-w-7xl">
        {/* Back navigation */}
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Page header */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500">
              Administration
            </p>

            <h1 className="mt-3 font-serif text-4xl">
              Manage Bookings
            </h1>

            <p className="mt-3 text-stone-500">
              View, search, and manage customer reservations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadBookings(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-3 text-sm hover:bg-stone-100 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            {refreshing ? "Refreshing..." : "Refresh Bookings"}
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <p
            role="alert"
            className="mt-6 rounded-xl bg-red-50 p-4 text-red-700"
          >
            {error}
          </p>
        )}

        {message && (
          <p
            role="status"
            className="mt-6 rounded-xl bg-green-50 p-4 text-green-700"
          >
            {message}
          </p>
        )}

        {loading ? (
          <p className="mt-10">Loading bookings...</p>
        ) : (
          <>
            {/* Statistics */}
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Total Bookings",
                  value: bookings.length,
                  icon: CalendarDays,
                },
                {
                  label: "Confirmed",
                  value: confirmedCount,
                  icon: CheckCircle2,
                },
                {
                  label: "Cancelled",
                  value: cancelledCount,
                  icon: XCircle,
                },
                {
                  label: "Confirmed Booking Value",
                  value: formatPKR(confirmedBookingValue),
                  icon: CalendarDays,
                },
              ].map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-stone-200 bg-white p-6"
                  >
                    <Icon
                      size={22}
                      className="text-stone-500"
                    />

                    <p className="mt-5 text-sm text-stone-500">
                      {stat.label}
                    </p>

                    <p className="mt-2 break-words text-2xl font-semibold">
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Search and filters */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <div className="flex min-w-[260px] flex-1 items-center gap-3 rounded-xl border border-stone-300 bg-white px-4">
                <Search
                  size={18}
                  className="text-stone-400"
                />

                <input
                  type="text"
                  placeholder="Search booking ID, user ID, apartment..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-full bg-transparent py-3 text-sm outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
                className="rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm"
              >
                <option value="all">All Bookings</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <p className="mt-4 text-sm text-stone-500">
              Showing {filteredBookings.length} of{" "}
              {bookings.length} bookings
            </p>

            {/* Bookings table */}
            <div className="mt-5 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="bg-stone-100 text-stone-600">
                  <tr>
                    <th className="p-4">Booking ID</th>
                    <th className="p-4">User ID</th>
                    <th className="p-4">Apartment</th>
                    <th className="p-4">Check-in</th>
                    <th className="p-4">Check-out</th>
                    <th className="p-4">Amount (PKR)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-t border-stone-100 hover:bg-stone-50"
                    >
                      <td className="p-4 font-medium">
                        #{booking.id}
                      </td>

                      <td className="p-4">
                        #{booking.user_id}
                      </td>

                      <td className="p-4">
                        {apartments[booking.apartment_id] ||
                          `Apartment #${booking.apartment_id}`}
                      </td>

                      <td className="p-4">
                        {booking.check_in}
                      </td>

                      <td className="p-4">
                        {booking.check_out}
                      </td>

                      <td className="p-4 font-medium">
                        {formatPKR(booking.total_price)}
                      </td>

                      <td className="p-4">
                        <span
                          className={
                            booking.status === "confirmed"
                              ? "font-medium text-green-700"
                              : booking.status === "cancelled"
                              ? "font-medium text-red-700"
                              : "font-medium text-amber-700"
                          }
                        >
                          {booking.status}
                        </span>
                      </td>

                      <td className="p-4">
                        {booking.status === "confirmed" ? (
                          <button
                            type="button"
                            onClick={() =>
                              cancelBooking(booking)
                            }
                            disabled={
                              cancellingId === booking.id
                            }
                            className="font-medium text-red-700 hover:underline disabled:opacity-50"
                          >
                            {cancellingId === booking.id
                              ? "Cancelling..."
                              : "Cancel Booking"}
                          </button>
                        ) : (
                          <span className="text-stone-400">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredBookings.length === 0 && (
                <p className="p-8 text-center text-stone-500">
                  No bookings match your search or filter.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
