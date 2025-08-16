// src/components/LoginModal.jsx
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function LoginModal({ closeModal, openSignupModal  }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
        { withCredentials: true }
      );
      toast.success("Logged in successfully!");

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setErr(err.response?.data || "Login failed");
    }
  };
  const handleGoToSignup = () => {
    closeModal();            // Close login modal
    openSignupModal();       // Open signup modal
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow w-80 space-y-4"
      >
        <h2 className="text-xl font-bold">Login</h2>
        {err && <p className="text-red-500">{err}</p>}
        <input
          type="email"
          placeholder="Email"
          className="w-full border px-3 py-2 rounded"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border px-3 py-2 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-sm text-center">
          Not registered yet?{" "}
          <button
            type="button"
            onClick={handleGoToSignup}
            className="text-blue-600 hover:underline"
          >
            Sign Up
          </button>
        </p>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Login
        </button>
        <button
          onClick={closeModal}
          type="button"
          className="w-full text-sm text-gray-600 hover:underline"
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
