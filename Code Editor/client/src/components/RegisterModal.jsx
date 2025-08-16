// src/components/RegisterModal.jsx
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export default function RegisterModal({ closeModal, openLoginModal }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [err, setErr] = useState("");

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      await axios.post("http://localhost:5000/api/auth/register", formData, {
        withCredentials: true
      });
      toast.success("Account created successfully!");
      
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setErr(err.response?.data || "Registration failed");
    }
  };

  const handleGoToLogin = () => {
    closeModal();            // Close signup modal
    openLoginModal();       // Open login modal
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded shadow w-80 space-y-4"
      >
        <h2 className="text-xl font-bold">Sign Up</h2>
        {err && <p className="text-red-500">{err}</p>}
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="w-full border px-3 py-2 rounded"
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full border px-3 py-2 rounded"
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full border px-3 py-2 rounded"
          onChange={handleChange}
        />
        <p className="text-sm text-center">
          Already have an account?{" "}
          <button
            type="button"
            onClick={handleGoToLogin}
            className="text-blue-600 hover:underline"
          >
            Login
          </button>
        </p>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Register
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