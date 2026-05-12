import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SiteProvider } from "./context/SiteContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Programma from "./pages/Programma";
import RSVP from "./pages/RSVP";
import FAQ from "./pages/FAQ";
import Game from "./pages/Game";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <SiteProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Navbar />
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/programma" element={<Programma />} />
          <Route path="/rsvp"      element={<RSVP />} />
          <Route path="/faq"       element={<FAQ />} />
          <Route path="/game"       element={<Game />} />
          <Route path="/admin"     element={<Admin />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </SiteProvider>
  );
}
