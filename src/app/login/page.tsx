"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (!name.trim()) {
        setError("Please enter your name before sending OTP.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Unable to send OTP.");
        return;
      }

      setStep("otp");
      setMessage(data.message || "Enter the code we sent to your phone.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, name }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "OTP verification failed.");
        return;
      }

      login({ name, phone });
      router.push("/orders");
    } catch {
      setError("Unable to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <span className="mb-3 block text-5xl">📱</span>
          <h1 className="text-3xl font-bold text-gray-900">Login with OTP</h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your phone number and verify with the code we send you.
          </p>
        </div>

        <form onSubmit={step === "phone" ? handleSendOtp : handleVerifyOtp} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder="Enter your name"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              placeholder="Enter 10-digit phone number"
              required
            />
          </div>

          {step === "otp" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                placeholder="Enter 6-digit OTP"
                required
              />
            </div>
          )}

          {message && (
            <p className="rounded-2xl bg-green-50 p-3 text-sm text-green-700">
              {message}
            </p>
          )}
          {error && (
            <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : step === "phone"
              ? "Send OTP"
              : "Verify OTP"}
          </button>

          {step === "otp" && (
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setMessage("");
                setError("");
              }}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-orange-300 hover:text-orange-600"
            >
              Use a different phone number
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
