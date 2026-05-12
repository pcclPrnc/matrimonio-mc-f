import { useState, useRef, useEffect } from "react";
import { COLORS, FONTS, useUpload } from "../designSystem.jsx";
import PhotoSlot from "../components/PhotoSlot";
import { useSite } from "../context/SiteContext";

/* ── Chevron arrow SVG ──────────────────────────────────── */
function ChevronIcon({ color = "#3D5A3E", open }) {
  return (
    <svg
      width="18" height="18" viewBox="0 0 18 18" fill="none"
      style={{
        flexShrink: 0,
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.35s ease",
      }}
    >
      <path
        d="M4 7 L9 12 L14 7"
        stroke={color} strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* ── Single accordion item ───────────────────────────────── */
function AccordionItem({ item, isOpen, onToggle, C, interpolate }) {
  const bodyRef = useRef(null);
  const [height, setHeight] = useState(0);

  /* Measure real content height whenever it changes */
  useEffect(() => {
    if (bodyRef.current) setHeight(bodyRef.current.scrollHeight);
  }, [item.r, isOpen]);

  return (
    <div style={{
      borderBottom: `1px solid ${C.olive}1E`,
      background: isOpen ? C.card : "transparent",
      border: isOpen ? `1px solid ${C.gold}44` : `1px solid transparent`,
      borderRadius: isOpen ? 8 : 0,
      marginBottom: isOpen ? 4 : 0,
      transition: "background 0.3s, border-color 0.3s",
      overflow: "hidden",
    }}>
      {/* Question row */}
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "18px 24px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
        onMouseEnter={e => {
          if (!isOpen) e.currentTarget.style.background = `${C.olive}09`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        <span style={{
          fontFamily: FONTS.serif,
          fontSize: 18,
          fontWeight: 400,
          color: C.olive,
          lineHeight: 1.4,
          flex: 1,
        }}>
          {item.q}
        </span>
        <ChevronIcon color={C.olive} open={isOpen} />
      </button>

      {/* Answer — animated via max-height */}
      <div
        ref={bodyRef}
        style={{
          maxHeight: isOpen ? `${height}px` : "0px",
          overflow: "hidden",
          transition: "max-height 0.4s ease",
        }}
      >
        <p style={{
          fontFamily: FONTS.body,
          fontSize: 16,
          color: C.dark,
          opacity: 0.78,
          lineHeight: 1.8,
          padding: "0 24px 20px",
        }}>
          {interpolate(item.r)}
        </p>
      </div>
    </div>
  );
}

/* ── Decorative olive sprig top-left ────────────────────── */
function OliveSprig({ color }) {
  return (
    <svg width="90" height="70" viewBox="0 0 90 70" fill="none" opacity="0.55">
      <path d="M10 60 C20 40 40 20 80 10" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <ellipse cx="35" cy="33" rx="9" ry="5" stroke={color} strokeWidth="1" fill="none"
        transform="rotate(-38 35 33)"/>
      <ellipse cx="55" cy="22" rx="8" ry="4.5" stroke={color} strokeWidth="1" fill="none"
        transform="rotate(-28 55 22)"/>
      <ellipse cx="22" cy="46" rx="8" ry="4.5" stroke={color} strokeWidth="1" fill="none"
        transform="rotate(-50 22 46)"/>
      <ellipse cx="70" cy="15" rx="7" ry="4" stroke={color} strokeWidth="1" fill="none"
        transform="rotate(-18 70 15)"/>
    </svg>
  );
}

/* ── Page ────────────────────────────────────────────────── */
export default function FAQ() {
  const { siteData } = useSite();
  const C = COLORS;

  const faqItems = siteData.faqItems ?? [];
  const [openIndex, setOpenIndex] = useState(0);
  const polaroidUp = useUpload();

  /* Interpolate {token} placeholders with siteData values */
  const interpolate = (text) =>
    text.replace(/\{(\w+)\}/g, (_, key) => siteData[key] ?? `{${key}}`);

  const toggle = (i) => setOpenIndex(prev => (prev === i ? null : i));

  return (
    <div style={{
      background: C.cream,
      minHeight: "100vh",
      fontFamily: FONTS.body,
      color: C.dark,
      paddingBottom: 80,
    }}>
      {polaroidUp.inp}

      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{
        paddingTop: 110,
        paddingBottom: 56,
        paddingLeft: 24,
        paddingRight: 24,
        maxWidth: 900,
        margin: "0 auto",
      }}>
        {/* Two-column flex: testo | foto */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 48,
          flexWrap: "wrap",
        }}>
          {/* ── Left: titles + divider ── */}
          <div style={{ flex: "1 1 300px", position: "relative", minWidth: 0 }}>
            {/* Decorative sprig */}
            <div style={{ position: "absolute", top: -18, left: -10, pointerEvents: "none" }}>
              <OliveSprig color={C.olive} />
            </div>

            <h1 style={{
              fontFamily: FONTS.script,
              fontSize: "clamp(2.6rem, 6vw, 4.8rem)",
              color: C.olive,
              lineHeight: 1.1,
              marginBottom: 14,
              position: "relative",
            }}>
              Domande Frequenti
            </h1>
            <p style={{
              fontFamily: FONTS.body,
              fontStyle: "italic",
              fontSize: "clamp(1.1rem, 2.2vw, 1.3rem)",
              color: C.rose,
              letterSpacing: ".06em",
            }}>
              Tutto quello che vorreste sapere
            </p>

            {/* Gold divider */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 32,
            }}>
              <div style={{ flex: 1, height: 1, background: C.gold, opacity: .35 }} />
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="3" fill={C.gold} opacity=".6"/>
              </svg>
              <div style={{ flex: 1, height: 1, background: C.gold, opacity: .35 }} />
            </div>
          </div>

          {/* ── Right: photo slot (stile Home) ── */}
          <div
            onClick={polaroidUp.trigger}
            style={{
              flex: "0 0 220px",
              width: 220,
              aspectRatio: "3/4",
              border: polaroidUp.url ? "none" : `2px dashed ${C.olive}55`,
              borderRadius: 10,
              overflow: "hidden",
              background: polaroidUp.url ? "transparent" : `${C.olive}06`,
              cursor: "pointer",
              position: "relative",
              alignSelf: "flex-start",
            }}
          >
            {polaroidUp.url
              ? <img
                  src={polaroidUp.url}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              : (
                <div style={{
                  width: "100%", height: "100%",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 10,
                }}>
                  <span style={{ fontSize: 30 }}>📷</span>
                  <span style={{
                    fontFamily: FONTS.body, fontSize: 12, color: C.olive,
                    opacity: .42, letterSpacing: ".18em", textTransform: "uppercase",
                    textAlign: "center", padding: "0 12px",
                  }}>
                    Aggiungi foto
                  </span>
                </div>
              )
            }

            {/* Hover overlay when photo loaded */}
            {polaroidUp.url && (
              <div
                style={{
                  position: "absolute", inset: 0,
                  background: "rgba(61,90,62,.5)",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 8,
                  opacity: 0, transition: "opacity .2s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                onMouseLeave={e => e.currentTarget.style.opacity = 0}
              >
                <span style={{ fontSize: 22 }}>🔄</span>
                <span style={{
                  fontFamily: FONTS.body, fontSize: 11, color: "#F5F0E8",
                  letterSpacing: ".14em", textTransform: "uppercase",
                }}>
                  Cambia foto
                </span>
                <button
                  onClick={e => { e.stopPropagation(); polaroidUp.clear(); }}
                  style={{
                    background: "rgba(255,255,255,.2)", border: "1px solid rgba(255,255,255,.5)",
                    color: "#fff", fontSize: 10, padding: "2px 8px", borderRadius: 2,
                    cursor: "pointer", fontFamily: FONTS.body, marginTop: 4,
                  }}
                >
                  Rimuovi
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── ACCORDION ────────────────────────────────────── */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
        {faqItems.map((item, i) => (
          <AccordionItem
            key={i}
            item={item}
            isOpen={openIndex === i}
            onToggle={() => toggle(i)}
            C={C}
            interpolate={interpolate}
          />
        ))}

        {/* Bottom flourish */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 52,
          opacity: .45,
        }}>
          <svg width="120" height="24" viewBox="0 0 120 24" fill="none">
            <path d="M10 12 C30 4 50 20 60 12 C70 4 90 20 110 12"
              stroke={C.gold} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
            <circle cx="60" cy="12" r="3" fill={C.gold} />
            <circle cx="10" cy="12" r="2" fill={C.gold} />
            <circle cx="110" cy="12" r="2" fill={C.gold} />
          </svg>
        </div>
      </section>
    </div>
  );
}
