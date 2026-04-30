import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { injectGoogleTranslate } from "./utils/translate";
import "./styles/theme.css";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Detect from "./pages/Detect";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Import from "./pages/Import";
import Legal from "./pages/Legal";
import { ToastHost, ConfirmHost } from "./components/Toast";

export default function App() {
  useEffect(() => { injectGoogleTranslate(); }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/home" element={<Home />} />
        <Route path="/detect" element={<Detect />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/import" element={<Import />} />
        <Route path="/privacy" element={<Legal />} />
        <Route path="/terms" element={<Legal />} />
        <Route path="/cookies" element={<Legal />} />
        <Route path="/gdpr" element={<Legal />} />
        <Route path="/qa-policy" element={<Legal />} />
        <Route path="/help" element={<Legal />} />
      </Routes>
      <ToastHost />
      <ConfirmHost />
    </BrowserRouter>
  );
}
