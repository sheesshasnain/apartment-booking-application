
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar({ isLoggedIn, onSignOut }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleSignOut() {
    onSignOut();
    setMenuOpen(false);
    navigate("/");
  }

  return (
    <header className="absolute left-0 top-0 z-30 w-full">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-7 lg:px-10">
        <Link
          to="/"
          className="text-2xl font-semibold tracking-[-0.07em] text-white"
        >
          abode.
        </Link>

        <nav className="hidden items-center gap-9 rounded-full border border-white/25 bg-white/15 px-9 py-3 text-sm text-white backdrop-blur-xl md:flex">
          <Link to="/">Home</Link>
          <Link to="/#residences">Residences</Link>
          <Link to="/#about">Our story</Link>
          {isLoggedIn && <Link to="/my-bookings">My Bookings</Link>}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-stone-900"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-stone-900"
            >
              Sign in
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {menuOpen && (
        <nav className="mx-5 flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-xl md:hidden">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/#residences" onClick={() => setMenuOpen(false)}>Residences</Link>
          <Link to="/#about" onClick={() => setMenuOpen(false)}>Our story</Link>

          {isLoggedIn ? (
            <>
              <Link to="/my-bookings" onClick={() => setMenuOpen(false)}>
                My Bookings
              </Link>
              <button type="button" onClick={handleSignOut} className="text-left">
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}>
              Sign in
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
