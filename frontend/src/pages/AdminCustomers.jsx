
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Users,
  CalendarDays,
  Eye,
  X,
  ClipboardList,
} from "lucide-react";

import {
  adminAPI,
  bookingAPI,
  apartmentAPI,
} from "../services/api";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [apartments, setApartments] = useState({});
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCustomers() {
      try {
        const [customerData, bookingData, apartmentData] =
          await Promise.all([
            adminAPI.getCustomers(),
            bookingAPI.getAll(),
            apartmentAPI.getAll(),
          ]);

        if (!active) return;

        setCustomers(customerData);
        setBookings(bookingData);

        setApartments(
          Object.fromEntries(
            apartmentData.map((apartment) => [
              apartment.id,
              apartment.title,
            ])
          )
        );
      } catch (err) {
        if (active) {
          setError(
            err.message || "Failed to load customers."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCustomers();

    return () => {
      active = false;
    };
  }, []);

  // Format booking amounts in Pakistani Rupees
  const formatPKR = (value) =>
    `PKR ${Number(value ?? 0).toLocaleString("en-PK", {
      maximumFractionDigits: 2,
    })}`;

  // Search customers
  const filteredCustomers = customers.filter((customer) => {
    const query = search.trim().toLowerCase();

    return (
      String(customer.name || "")
        .toLowerCase()
        .includes(query) ||
      String(customer.email || "")
        .toLowerCase()
        .includes(query) ||
      String(customer.id).includes(query)
    );
  });

  // Customer statistics
  const totalBookings = customers.reduce(
    (sum, customer) =>
      sum + Number(customer.total_bookings || 0),
    0
  );

  const totalConfirmed = customers.reduce(
    (sum, customer) =>
      sum + Number(customer.confirmed_bookings || 0),
    0
  );

  // Bookings for the selected customer
  const customerBookings = selectedCustomer
    ? bookings.filter(
        (booking) =>
          Number(booking.user_id) ===
          Number(selectedCustomer.id)
      )
    : [];

  const customerBookingValue = customerBookings
    .filter((booking) => booking.status === "confirmed")
    .reduce(
      (sum, booking) =>
        sum + Number(booking.total_price || 0),
      0
    );

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-6 py-12 text-stone-900">
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
        <div className="mt-10">
          <p className="text-xs uppercase tracking-widest text-stone-500">
            Administration
          </p>

          <h1 className="mt-3 font-serif text-4xl">
            Customer Management
          </h1>

          <p className="mt-3 text-stone-500">
            View registered users, booking activity,
            and customer reservation history.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <p
            role="alert"
            className="mt-8 rounded-xl bg-red-50 p-4 text-red-700"
          >
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-10">Loading customers...</p>
        ) : (
          <>
            {/* Statistics */}
            <div className="mt-10 grid gap-5 sm:grid-cols-3">
              {[
                {
                  label: "Registered Users",
                  value: customers.length,
                  icon: Users,
                },
                {
                  label: "Total Bookings",
                  value: totalBookings,
                  icon: CalendarDays,
                },
                {
                  label: "Confirmed Bookings",
                  value: totalConfirmed,
                  icon: ClipboardList,
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

                    <p className="mt-2 text-3xl font-semibold">
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Customer search */}
            <div className="mt-10 flex items-center gap-3 rounded-xl border border-stone-300 bg-white px-4">
              <Search
                size={18}
                className="text-stone-400"
              />

              <input
                type="text"
                placeholder="Search by name, email, or user ID..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full bg-transparent py-3 text-sm outline-none"
              />
            </div>

            <p className="mt-4 text-sm text-stone-500">
              Showing {filteredCustomers.length} of{" "}
              {customers.length} users
            </p>

            {/* Customers table */}
            <div className="mt-5 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="bg-stone-100 text-stone-600">
                  <tr>
                    <th className="p-4">User ID</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Bookings</th>
                    <th className="p-4">Confirmed</th>
                    <th className="p-4">Booking Value (PKR)</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-t border-stone-100 hover:bg-stone-50"
                    >
                      <td className="p-4">
                        #{customer.id}
                      </td>

                      <td className="p-4 font-medium">
                        {customer.name}
                      </td>

                      <td className="p-4">
                        {customer.email}
                      </td>

                      <td className="p-4 capitalize">
                        {customer.role}
                      </td>

                      <td className="p-4">
                        {customer.total_bookings}
                      </td>

                      <td className="p-4">
                        {customer.confirmed_bookings}
                      </td>

                      <td className="p-4 font-medium">
                        {formatPKR(
                          customer.total_booking_value
                        )}
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCustomer(customer)
                          }
                          className="inline-flex items-center gap-2 font-medium text-[#303b33] hover:underline"
                        >
                          <Eye size={16} />
                          View Bookings
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredCustomers.length === 0 && (
                <p className="p-8 text-center text-stone-500">
                  No users match your search.
                </p>
              )}
            </div>

            {/* Selected customer booking history */}
            {selectedCustomer && (
              <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-stone-500">
                      Customer Details
                    </p>

                    <h2 className="mt-3 font-serif text-3xl">
                      {selectedCustomer.name}
                    </h2>

                    <p className="mt-2 text-sm text-stone-500">
                      {selectedCustomer.email}
                    </p>

                    <p className="mt-1 text-sm text-stone-500">
                      User ID: #{selectedCustomer.id}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedCustomer(null)
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm hover:bg-stone-100"
                  >
                    <X size={16} />
                    Close
                  </button>
                </div>

                {/* Customer booking summary */}
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-stone-50 p-5">
                    <p className="text-sm text-stone-500">
                      Total Reservations
                    </p>

                    <p className="mt-2 text-2xl font-semibold">
                      {customerBookings.length}
                    </p>
                  </div>

                  <div className="rounded-xl bg-stone-50 p-5">
                    <p className="text-sm text-stone-500">
                      Confirmed Booking Value
                    </p>

                    <p className="mt-2 break-words text-2xl font-semibold">
                      {formatPKR(customerBookingValue)}
                    </p>
                  </div>
                </div>

                <h3 className="mt-10 font-serif text-2xl">
                  Booking History
                </h3>

                <div className="mt-5 overflow-x-auto rounded-xl border border-stone-200">
                  <table className="w-full min-w-[750px] text-left text-sm">
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
                      {customerBookings.map((booking) => (
                        <tr
                          key={booking.id}
                          className="border-t border-stone-100"
                        >
                          <td className="p-4">
                            #{booking.id}
                          </td>

                          <td className="p-4">
                            {apartments[
                              booking.apartment_id
                            ] ||
                              `Apartment #${booking.apartment_id}`}
                          </td>

                          <td className="p-4">
                            {booking.check_in}
                          </td>

                          <td className="p-4">
                            {booking.check_out}
                          </td>

                          <td className="p-4 font-medium">
                            {formatPKR(
                              booking.total_price
                            )}
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

                  {customerBookings.length === 0 && (
                    <p className="p-8 text-center text-stone-500">
                      This customer has no bookings yet.
                    </p>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
