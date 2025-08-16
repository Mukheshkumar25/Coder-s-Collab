import { useAuth } from "../context/AuthContext";
import HeroSection from "../components/HeroSection";
import FeatureSection from "../components/FeatureSection";

export default function Home() {
  const { isLoggedIn, user } = useAuth();
  return (
    <div className="min-h-screen bg-[#EAEAEA] text-[#252A34]">
      {isLoggedIn && user?.username && (
        <div className="text-center bg-[#08D9D6] py-4 text-gray-800 font-semibold shadow-sm">
          👋 Welcome back, {user.username}!
        </div>
      )}

      <HeroSection />

      <FeatureSection />
    </div>
  );
}