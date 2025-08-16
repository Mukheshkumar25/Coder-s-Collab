import './App.css';

import { useAuth } from "./context/AuthContext";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Page Components
import Home from "./pages/Home";
import SoloEditor from "./pages/SoloEditor";
import GroupLanding from "./pages/GroupLanding";
import GroupRoom from "./pages/GroupRoom";

// Global Components
import Navbar from "./components/Navbar";
import LoginModal from "./components/LoginModal";
import RegisterModal from "./components/RegisterModal";

import { Routes, Route, useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  const goTOHome = () => navigate("/");

  const {
    showLoginModal,
    closeLoginModal,
    showSignupModal,
    closeSignupModal,
    openSignupModal,
    openLoginModal
  } = useAuth();

  return (
    <div>
      <Navbar goTOHome={goTOHome} />
      {showLoginModal && <LoginModal closeModal={closeLoginModal} openSignupModal={openSignupModal}/>}
      {showSignupModal && <RegisterModal closeModal={closeSignupModal} openLoginModal={openLoginModal} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/solo" element={<SoloEditor />} />
        <Route path="/group" element={<GroupLanding />} />
        <Route path="/group/room" element={<GroupRoom />} />
        <Route path="*" element={<div><h1>Page Not Found</h1></div>} />
      </Routes>
      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
}

export default App;