
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

export default function Login({ onLogin }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1: Authenticate user
      const result = await authAPI.login({
        email: email.trim(),
        password,
      });

      // Step 2: Save authentication token
      localStorage.setItem(
        "access_token",
        result.access_token
      );

      // Step 3: Fetch authenticated user profile
      const profile = await authAPI.getMe();

      // Step 4: Update authentication state
      onLogin?.();

      // Step 5: Redirect based on user role
      if (profile.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }

    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-6 py-20">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">

        <Link
          to="/"
          className="text-2xl font-semibold tracking-tight"
        >
          abode.
        </Link>

        <h1 className="mt-12 font-serif text-4xl">
          Welcome back.
        </h1>

        <p className="mt-3 text-sm text-stone-500">
          Sign in to manage your stays.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <label className="block text-sm">
            Email address

            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-200 p-4 outline-none focus:border-stone-500"
            />
          </label>

          <label className="block text-sm">
            Password

            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-200 p-4 outline-none focus:border-stone-500"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="text-sm text-red-600"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#303b33] py-4 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-stone-500">
          New to abode?{" "}

          <Link
            to="/register"
            className="font-medium text-stone-900 underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
