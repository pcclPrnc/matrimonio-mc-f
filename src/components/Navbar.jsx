import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { COLORS, FONTS } from "../designSystem";
import { useSite } from "../context/SiteContext";

const ROUTE_MAP = {
  "Home":               "/",
  "Programma":          "/programma",
  "RSVP":               "/rsvp",
  "FAQ":                "/faq",
  "Non posso aspettare":"/game",
  "Admin":              "/admin",
};

export default function Navbar() {
  const { siteData } = useSite();
  const C = COLORS;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const vis = siteData.menuVisibility ?? {};
  const navLinks = siteData.ordineMenu
    .filter(label => vis[label] !== false)
    .map(label => ({ label, to: ROUTE_MAP[label] ?? "/" }));

  return (
    <>
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? C.cream + "F2" : "transparent",
      backdropFilter: scrolled ? "blur(10px)" : "none",
      borderBottom: scrolled ? `1px solid ${C.olive}22` : "none",
      transition: "all .4s ease", padding: "18px 40px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      {/* Hamburger — mobile only */}
      <button
        className="wc-hb"
        onClick={() => setMenuOpen(o => !o)}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", flexDirection: "column", gap: 5 }}
      >
        {[0,1,2].map(i => (
          <span key={i} style={{ display: "block", width: 26, height: 1.5, background: C.olive, borderRadius: 1 }} />
        ))}
      </button>

      {/* Brand */}
      <Link to="/" style={{ fontFamily: FONTS.script, fontSize: 30, color: C.olive, letterSpacing: ".05em", textAlign: "center", flex: 1, textDecoration: "none" }}>
        MC &amp; F
      </Link>

      {/* Desktop links */}
      <div className="wc-dn" style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {navLinks.map(({ label, to }) => (
          <Link
            key={label}
            to={to}
            className="wc-nl"
            style={{ fontFamily: FONTS.body, fontSize: 13, color: C.olive, textDecoration: "none", letterSpacing: ".17em", textTransform: "uppercase" }}
          >
            {label}
          </Link>
        ))}
      </div>
      <div style={{ width: 200 }} className="wc-dn" />

    </nav>

    {/* Mobile overlay — rendered in document.body via Portal to avoid
        backdropFilter creating a new containing block for position:fixed */}
    {menuOpen && createPortal(
      <div style={{
        position: "fixed", inset: 0, background: C.cream + "F8", zIndex: 9999,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36,
      }}>
        <button
          onClick={() => setMenuOpen(false)}
          style={{ position: "absolute", top: 22, right: 32, background: "none", border: "none", fontSize: 36, cursor: "pointer", color: C.olive, lineHeight: 1 }}
        >
          ×
        </button>
        {navLinks.map(({ label, to }) => (
          <Link
            key={label}
            to={to}
            onClick={() => setMenuOpen(false)}
            style={{ fontFamily: FONTS.script, fontSize: 32, color: C.olive, textDecoration: "none" }}
          >
            {label}
          </Link>
        ))}
      </div>,
      document.body
    )}
    </>
  );
}
