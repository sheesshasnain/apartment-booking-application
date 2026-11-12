
import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyBookings from "./pages/MyBookings";
import AdminDashboard from "./pages/AdminDashboard";
import ManageApartments from "./pages/ManageApartments";
import AdminBookings from "./pages/AdminBookings";
import { authAPI } from "./services/api";
import AdminCustomers from "./pages/AdminCustomers";
export default function App() {
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const isLoggedIn = Boolean(user);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    let active = true;
    let requestId = 0;

    async function checkUser() {
      const currentRequest = ++requestId;
      const token = localStorage.getItem("access_token");

      if (!token) {
        if (active && currentRequest === requestId) {
          setUser(null);
          setCheckingAuth(false);
        }
        return;
      }

      setCheckingAuth(true);

      try {
        const profile = await authAPI.getMe();

        if (active && currentRequest === requestId) {
          setUser(profile);
        }
      } catch (error) {
        if (active && currentRequest === requestId) {
          console.error("Authentication error:", error);
          setUser(null);

          if (error.status === 401) {
            localStorage.removeItem("access_token");
          }
        }
      } finally {
        if (active && currentRequest === requestId) {
          setCheckingAuth(false);
        }
      }
    }

    checkUser();

    window.addEventListener("storage", checkUser);
    window.addEventListener("auth-changed", checkUser);

    return () => {
      active = false;
      requestId++;

      window.removeEventListener("storage", checkUser);
      window.removeEventListener("auth-changed", checkUser);
    };
  }, []);

  function handleLogin() {
    window.dispatchEvent(new Event("auth-changed"));
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    setUser(null);
    setCheckingAuth(false);

    window.dispatchEvent(new Event("auth-changed"));
  }

  useEffect(() => {
    if (!location.hash || location.pathname !== "/") {
      return;
    }

    const frame = requestAnimationFrame(() => {
      document
        .getElementById(location.hash.slice(1))
        ?.scrollIntoView({
          behavior: "smooth",
        });
    });

    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash, checkingAuth]);

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] text-stone-700">
        <p role="status">Checking authentication...</p>
      </main>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Home
            isLoggedIn={isLoggedIn}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />
        }
      />

      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate
              to={isAdmin ? "/admin" : "/"}
              replace
            />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />

      <Route
        path="/register"
        element={
          isLoggedIn ? (
            <Navigate
              to={isAdmin ? "/admin" : "/"}
              replace
            />
          ) : (
            <Register onLogin={handleLogin} />
          )
        }
      />

      <Route
        path="/my-bookings"
        element={
          isLoggedIn ? (
            <MyBookings />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/admin"
        element={
          !isLoggedIn ? (
            <Navigate to="/login" replace />
          ) : isAdmin ? (
            <AdminDashboard />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/admin/apartments"
        element={
          !isLoggedIn ? (
            <Navigate to="/login" replace />
          ) : isAdmin ? (
            <ManageApartments />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
  path="/admin/bookings"
  element={
    !isLoggedIn ? (
      <Navigate to="/login" replace />
    ) : isAdmin ? (
      <AdminBookings />
    ) : (
      <Navigate to="/" replace />
    )
  }
/>
<Route
  path="/admin/customers"
  element={
    !isLoggedIn ? (
      <Navigate to="/login" replace />
    ) : isAdmin ? (
      <AdminCustomers />
    ) : (
      <Navigate to="/" replace />
    )
  }
/>

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}
