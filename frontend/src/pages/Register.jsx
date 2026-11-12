
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

export default function Register({ onLogin }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await authAPI.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      const result = await authAPI.login({
        email: form.email.trim(),
        password: form.password,
      });

      localStorage.setItem("access_token", result.access_token);
      onLogin?.();

      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-6 py-20">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <Link to="/" className="text-2xl font-semibold tracking-tight">
          abode.
        </Link>

        <h1 className="mt-12 font-serif text-4xl">
          Create your account.
        </h1>

        <p className="mt-3 text-sm text-stone-500">
          Find your next home away from home.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block text-sm">
            Full name
            <input
              type="text"
              name="name"
              required
              minLength={2}
              maxLength={120}
              value={form.name}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-stone-200 p-4 outline-none focus:border-stone-500"
            />
          </label>

          <label className="block text-sm">
            Email address
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-stone-200 p-4 outline-none focus:border-stone-500"
            />
          </label>

          <label className="block text-sm">
            Password
            <input
              type="password"
              name="password"
              required
              minLength={8}
              maxLength={128}
              value={form.password}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-stone-200 p-4 outline-none focus:border-stone-500"
            />
          </label>

          <label className="block text-sm">
            Confirm password
            <input
              type="password"
              name="confirmPassword"
              required
              value={form.confirmPassword}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-stone-200 p-4 outline-none focus:border-stone-500"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#303b33] py-4 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-stone-900 underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
