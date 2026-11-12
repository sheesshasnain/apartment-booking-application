
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  CalendarDays,
  DollarSign,
  ArrowLeft,
  Plus,
  ClipboardList,
  Users,
} from "lucide-react";

import { apartmentAPI, adminAPI } from "../services/api";

export default function AdminDashboard() {
  const [apartments, setApartments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const [apartmentData, bookingData] = await Promise.all([
          apartmentAPI.getAll(),
          adminAPI.getBookings(),
        ]);

        if (active) {
          setApartments(apartmentData);
          setBookings(bookingData);
        }
      } catch (err) {
        if (active) {
          setError(
            err.message || "Unable to load dashboard."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const apartmentNames = Object.fromEntries(
    apartments.map((apartment) => [
      apartment.id,
      apartment.title,
    ])
  );

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "confirmed"
  );

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "cancelled"
  );

  const totalBookingValue = confirmedBookings.reduce(
    (total, booking) =>
      total + Number(booking.total_price || 0),
    0
  );

  const formatPKR = (amount) =>
    `PKR ${Number(amount ?? 0).toLocaleString("en-PK", {
      maximumFractionDigits: 2,
    })}`;

  const stats = [
    {
      label: "Active Apartments",
      value: apartments.length,
      icon: Building2,
    },
    {
      label: "Total Bookings",
      value: bookings.length,
      icon: CalendarDays,
    },
    {
      label: "Confirmed Bookings",
      value: confirmedBookings.length,
      icon: ClipboardList,
    },
    {
      label: "Confirmed Booking Value",
      value: formatPKR(totalBookingValue),
      icon: DollarSign,
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-6 py-12 text-stone-900">
      <div className="mx-auto max-w-7xl">
        {/* Back to homepage */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to homepage
        </Link>

        {/* Dashboard header */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500">
              Administration
            </p>

            <h1 className="mt-3 font-serif text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-3 text-stone-500">
              Manage apartments, bookings, and customers.
            </p>
          </div>

          {/* Admin navigation buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/apartments"
              className="inline-flex items-center gap-2 rounded-full bg-[#303b33] px-6 py-3 text-sm text-white hover:opacity-90"
            >
              <Plus size={17} />
              Manage Apartments
            </Link>

            <Link
              to="/admin/bookings"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 text-sm hover:bg-stone-100"
            >
              <ClipboardList size={17} />
              Manage Bookings
            </Link>

            <Link
              to="/admin/customers"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 text-sm hover:bg-stone-100"
            >
              <Users size={17} />
              Manage Customers
            </Link>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <p role="status" className="mt-12">
            Loading dashboard...
          </p>
        )}

        {/* Error */}
        {error && (
          <p
            role="alert"
            className="mt-10 rounded-xl bg-red-50 p-4 text-red-700"
          >
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            {/* Statistics */}
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => {
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

                    <p className="mt-6 text-sm text-stone-500">
                      {stat.label}
                    </p>

                    <p className="mt-2 break-words text-2xl font-semibold">
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Recent bookings */}
            <section className="mt-14">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-3xl">
                    Recent Bookings
                  </h2>

                  <p className="mt-2 text-sm text-stone-500">
                    {confirmedBookings.length} confirmed ·{" "}
                    {cancelledBookings.length} cancelled
                  </p>
                </div>

                <Link
                  to="/admin/bookings"
                  className="text-sm font-medium text-[#303b33] underline"
                >
                  View All Bookings
                </Link>
              </div>

              <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-stone-100 text-stone-600">
                    <tr>
                      <th className="p-4">Booking ID</th>
                      <th className="p-4">Apartment</th>
                      <th className="p-4">Check-in</th>
                      <th className="p-4">Check-out</th>
                      <th className="p-4">Amount (PKR)</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {bookings.slice(0, 10).map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-t border-stone-100 hover:bg-stone-50"
                      >
                        <td className="p-4">
                          #{booking.id}
                        </td>

                        <td className="p-4">
                          {apartmentNames[booking.apartment_id] ||
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
                                ? "font-medium capitalize text-green-700"
                                : booking.status === "cancelled"
                                ? "font-medium capitalize text-red-700"
                                : "font-medium capitalize text-amber-700"
                            }
                          >
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {bookings.length === 0 && (
                  <p className="p-8 text-center text-stone-500">
                    No bookings found.
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
