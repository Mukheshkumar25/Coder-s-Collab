import React from 'react'
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <div>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 bg-gradient-to-b from-[#08D9D6] to-[#EAEAEA]">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6 max-w-3xl text-[#252A34]">
          Code Together. Build Faster.
        </h1>
        <p className="text-lg text-[#252A34] mb-8 max-w-xl">
          Write, share, and collaborate in real-time using our multi-mode code editor platform.
        </p>
        <div className="flex gap-6">
          <button
            onClick={() => navigate("/solo")}
            className="px-6 py-3 bg-[#FF2E63] text-white rounded-lg shadow hover:bg-[#e02658]"
          >
            Solo Mode
          </button>
          <button
            onClick={() => navigate("/group")}
            className="px-6 py-3 bg-[#252A34] text-white rounded-lg shadow hover:bg-[#1c1f27]"
          >
            Group Mode
          </button>
        </div>
      </section>
    </div>
  )
}

export default HeroSection
