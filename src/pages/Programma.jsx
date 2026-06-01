import { useState, useEffect, useRef } from "react";

const B = import.meta.env.BASE_URL;
const progBase = (key) => `${B}media/graphic_programma_${key}.png`;
import {
  COLORS, FONTS,
  Church, Cocktail, Cake, Moon, HeartSVG,
} from "../designSystem.jsx";
import { useSite } from "../context/SiteContext";
import { uploadMedia, isGithubConfigured } from "../services/githubApi";

/* ── Page-specific SVG icons ────────────────────────────── */
const ForkPlate = ({ color = "#1C1C1C" }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="19" stroke={color} strokeWidth="1.2" fill="none"/>
    <line x1="18" y1="13" x2="18" y2="20" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M15 20 C15 27 21 27 21 20" stroke={color} strokeWidth="1.1" fill="none" strokeLinecap="round"/>
    <line x1="18" y1="27" x2="18" y2="35" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="30" y1="13" x2="30" y2="35" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M27 13 C27 19 33 19 33 13" stroke={color} strokeWidth="1.1" fill="none" strokeLinecap="round"/>
  </svg>
);

const MusicNote = ({ color = "#C9A84C" }) => (
  <svg width="44" height="50" viewBox="0 0 44 50" fill="none">
    <path d="M14 36 C14 40 8 42 8 38 C8 34 14 36 14 36Z" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <path d="M32 30 C32 34 26 36 26 32 C26 28 32 30 32 30Z" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <line x1="14" y1="36" x2="14" y2="14" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="32" y1="30" x2="32" y2="8" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="14" y1="14" x2="32" y2="8" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const DiscoBall = ({ color = "#D4849A" }) => (
  <svg width="50" height="58" viewBox="0 0 50 58" fill="none">
    <circle cx="25" cy="22" r="16" stroke={color} strokeWidth="1.2" fill="none"/>
    <line x1="9"  y1="22" x2="41" y2="22" stroke={color} strokeWidth="0.9" opacity="0.55"/>
    <line x1="11" y1="14" x2="39" y2="14" stroke={color} strokeWidth="0.9" opacity="0.55"/>
    <line x1="11" y1="30" x2="39" y2="30" stroke={color} strokeWidth="0.9" opacity="0.55"/>
    <path d="M25 6 C17 6 11 13 11 22" stroke={color} strokeWidth="0.9" fill="none" opacity="0.55"/>
    <path d="M25 6 C33 6 39 13 39 22" stroke={color} strokeWidth="0.9" fill="none" opacity="0.55"/>
    <line x1="25" y1="38" x2="25" y2="52" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="18" y1="11" x2="15" y2="8"  stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.7"/>
    <line x1="37" y1="15" x2="40" y2="12" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.7"/>
    <line x1="40" y1="24" x2="44" y2="23" stroke={color} strokeWidth="1"   strokeLinecap="round" opacity="0.7"/>
  </svg>
);

/* ── Icon registry ───────────────────────────────────────── */
const ICON_MAP = {
  chiesa:   (c) => <Church    color={c} />,
  cocktail: (c) => <Cocktail  color={c} />,
  piatto:   (c) => <ForkPlate color={c} />,
  cuore:    (c) => <HeartSVG  color={c} />,
  torta:    (c) => <Cake      color={c} />,
  note:     (c) => <MusicNote color={c} />,
  disco:    (c) => <DiscoBall color={c} />,
  luna:     (c) => <Moon      color={c} />,
};
const iconColor = (key, C) => ({
  chiesa: C.olive, cocktail: C.rose, piatto: C.dark,
  cuore: C.rose, torta: C.gold, note: C.gold, disco: C.rose, luna: C.gold,
}[key] ?? C.olive);

/* ── EventCard ───────────────────────────────────────────── */
function EventCard({ event, isRight, C, anim, customUrl }) {
  const [baseErr, setBaseErr] = useState(false);
  const render = ICON_MAP[event.icona];
  const icolor = iconColor(event.icona, C);

  /* Fallback chain: admin upload → static base PNG → original SVG */
  const iconContent = (() => {
    if (customUrl) {
      return <img src={customUrl} alt="" style={{ width: 72, height: 72, objectFit: "contain" }} />;
    }
    if (!baseErr) {
      return (
        <img
          src={progBase(event.icona)} alt=""
          style={{ width: 72, height: 72, objectFit: "contain" }}
          onError={() => setBaseErr(true)}
        />
      );
    }
    return render ? render(icolor) : null;
  })();

  return (
    <div style={{ textAlign: isRight ? "left" : "right", ...anim }}>
      <p style={{
        fontFamily: FONTS.serif, fontStyle: "italic",
        fontSize: 15, letterSpacing: ".14em", color: C.gold, marginBottom: 8,
      }}>
        {event.ora}
      </p>
      {iconContent && (
        <div style={{ display: "flex", justifyContent: isRight ? "flex-start" : "flex-end", marginBottom: 10, opacity: .88 }}>
          {iconContent}
        </div>
      )}
      <h3 style={{ fontFamily: FONTS.serif, fontSize: 20, fontWeight: 400, color: C.olive, marginBottom: 5 }}>
        {event.titolo}
      </h3>
      <p style={{ fontFamily: FONTS.body, fontSize: 15, color: C.dark, opacity: .7, lineHeight: 1.65 }}>
        {event.desc}
      </p>
    </div>
  );
}

/* ── Vine berry decoration ───────────────────────────────── */
function VineBerry({ color }) {
  return (
    <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
      <ellipse cx="7" cy="13" rx="4" ry="5.5" stroke={color} strokeWidth="1" fill={color} fillOpacity=".5"/>
      <path d="M7 7 C7 7 4.5 3.5 7 2 C9.5 3.5 7 7 7 7Z" stroke={color} strokeWidth="0.9" fill="none"/>
    </svg>
  );
}

/* ── Main Page ───────────────────────────────────────────── */
/* ── Inline upload hook wired to Firebase/context ─────────── */
function useContextUpload(storageKey) {
  const { siteData, updateMedia } = useSite();
  const fileRef = useRef();
  const url = siteData.media?.[storageKey] || localStorage.getItem(`media_${storageKey}`) || null;

  const trigger = () => fileRef.current?.click();

  const onChange = async e => {
    const file = e.target.files?.[0]; if (!file) return;
    e.target.value = "";
    try {
      if (isGithubConfigured()) {
        const dlUrl = await uploadMedia(storageKey, file);
        updateMedia(storageKey, dlUrl);
      } else {
        await new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = ev => {
            try { localStorage.setItem(`media_${storageKey}`, ev.target.result); } catch {}
            updateMedia(storageKey, ev.target.result);
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
    } catch {}
  };

  const inp = <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onChange} />;
  return { url, trigger, inp, has: !!url };
}

export default function Programma() {
  const { siteData } = useSite();
  const C = COLORS;

  /* Use events from context (editable via Admin), fall back to context defaults */
  const events = siteData.programmaEventi;

  /* Graphics visibility from context */
  const gp = siteData.graphics?.programma ?? {};

  /* Admin-uploaded icon URLs (override static base images) */
  const media = siteData.media ?? {};
  const progCustomUrl = (key) => media[`graphic_programma_${key}`] || null;

  /* Vine line (ramo centrale) */
  const [vineLineBaseErr, setVineLineBaseErr] = useState(false);
  const vineLineCustomUrl = media[`graphic_programma_vineLine`] || null;
  const vineLineUrl = vineLineCustomUrl || (!vineLineBaseErr ? `${B}media/graphic_programma_vineLine.png` : null);

  const heroImg    = useContextUpload("programma_hero");
  const polaroidImg = useContextUpload("programma_polaroid");

  /* IntersectionObserver — trigger animation when row enters viewport */
  const [visible, setVisible] = useState({});
  const rowRefs = useRef([]);

  useEffect(() => {
    const observers = events.map((_, i) => {
      const el = rowRefs.current[i];
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(v => ({ ...v, [i]: true }));
            obs.disconnect();
          }
        },
        { threshold: 0.15 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, [events.length]);

  const animLeft  = (i) => ({
    opacity:   visible[i] ? 1 : 0,
    transform: visible[i] ? "translateX(0)" : "translateX(-44px)",
    transition: "opacity 0.65s ease, transform 0.65s ease",
  });
  const animRight = (i) => ({
    opacity:   visible[i] ? 1 : 0,
    transform: visible[i] ? "translateX(0)" : "translateX(44px)",
    transition: "opacity 0.65s ease, transform 0.65s ease",
  });

  /* Vine berry decoration positions (% of timeline height) */
  const berryPositions = [8, 23, 38, 53, 68, 84];

  return (
    <div style={{ background: C.cream, minHeight: "100vh", fontFamily: FONTS.body, color: C.dark }}>
      <style>{`
        @keyframes dotPulse {
          0%, 100% { opacity: 1;    transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.78); }
        }
        .prog-dot-inner { animation: dotPulse 2.8s ease infinite; }

        .prog-row {
          display: grid;
          grid-template-columns: 1fr 64px 1fr;
          align-items: flex-start;
          margin-bottom: 80px;
        }
        .prog-left-col  { padding-right: 36px; }
        .prog-right-col { padding-left:  36px; }
        .prog-center-col {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          padding-top: 12px;
          position: relative;
          z-index: 1;
        }
        .prog-mobile-only { display: none; }

        /* Vine image — desktop only */
        .prog-vine-img { display: block; }

        @media (max-width: 700px) {
          .prog-row { grid-template-columns: 48px 1fr; }
          .prog-left-col  { display: none !important; }
          .prog-right-col { padding-left: 20px; }
          .prog-mobile-only { display: block !important; }
          /* Centra la linea CSS sui dot (left=24px = centro della colonna 48px) */
          .prog-vline { left: 24px !important; transform: translateX(-50%) !important; }
          .prog-vine-deco { display: none !important; }
          /* Nasconde l'immagine del ramo su mobile */
          .prog-vine-img { display: none !important; }
        }
      `}</style>

      {/* Hidden file inputs */}
      <span>{heroImg.inp}</span>
      <span>{polaroidImg.inp}</span>

      {/* ══ Hero photo placeholder ══ */}
      {gp.heroImg?.vis !== false && (
      <div style={{ paddingTop: 80, padding: "80px 20px 0" }}>
        <div
          onClick={heroImg.trigger}
          style={{
            width: "100%", height: 224, maxWidth: 900, margin: "0 auto",
            border: `2px dashed ${C.olive}55`, borderRadius: 12, overflow: "hidden",
            cursor: "pointer", position: "relative", background: `${C.olive}06`,
          }}
        >
          {heroImg.url
            ? <img src={heroImg.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            : (
              <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <span style={{ fontSize: 28 }}>📷</span>
                <span style={{ fontFamily: FONTS.body, fontSize: 13, color: C.olive, opacity: .42, letterSpacing: ".16em", textTransform: "uppercase" }}>
                  Aggiungi foto location
                </span>
              </div>
            )
          }
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(61,90,62,.42)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity .2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0}
          >
            <span style={{ color: "#fff", fontFamily: FONTS.body, fontSize: 13, letterSpacing: ".14em", textTransform: "uppercase" }}>
              {heroImg.url ? "🔄 Cambia foto" : "📷 Carica foto"}
            </span>
          </div>
        </div>
      </div>
      )}

      {/* ══ Title block ══ */}
      <div style={{ textAlign: "center", padding: "52px 20px 8px" }}>
        <h1 style={{
          fontFamily: FONTS.serif, fontSize: "clamp(28px,5vw,48px)",
          fontWeight: 400, fontStyle: "italic", color: C.olive, marginBottom: 12,
        }}>
          Il Programma
        </h1>
        <p style={{ fontFamily: FONTS.body, fontStyle: "italic", fontSize: 18, color: C.rose, letterSpacing: ".08em" }}>
          Sabato 2 Ottobre 2026
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center", marginTop: 22 }}>
          <div style={{ height: 1, width: 54, background: C.gold, opacity: .45 }} />
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.gold, opacity: .6 }} />
          <div style={{ height: 1, width: 54, background: C.gold, opacity: .45 }} />
        </div>
      </div>

      {/* ══ Timeline ══ */}
      <div style={{ position: "relative", maxWidth: 900, margin: "0 auto", padding: "240px 20px 80px" }}>

        {/* Ramo centrale */}
        {gp.vineLine?.vis !== false && (
          <>
            {/* Immagine decorativa — desktop only (nascosta su mobile via CSS) */}
            {vineLineUrl && (
              <img
                src={vineLineUrl}
                alt=""
                className="prog-vine-img"
                style={{
                  position: "absolute", top: "-180px", left: "50%",
                  transform: "translateX(calc(-50% - 85px))",
                  height: "75%", width: "auto", objectFit: "contain",
                  zIndex: 0, pointerEvents: "none",
                }}
                onError={vineLineCustomUrl ? undefined : () => setVineLineBaseErr(true)}
              />
            )}

            {/* Linea CSS + bacche — fallback desktop (no immagine) e sempre su mobile */}
            {!vineLineUrl && (
              <>
                <div
                  className="prog-vline"
                  style={{
                    position: "absolute", top: 0, bottom: 0,
                    left: "50%", transform: "translateX(-50%)",
                    width: 2, background: `${C.olive}38`, zIndex: 0,
                  }}
                />
                {berryPositions.map((pct, j) => (
                  <div
                    key={j}
                    className="prog-vine-deco"
                    style={{
                      position: "absolute", left: "50%", top: `${pct}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: 0, pointerEvents: "none",
                    }}
                  >
                    <VineBerry color={C.olive} />
                  </div>
                ))}
              </>
            )}

            {/* Linea CSS mobile — mostrata solo su mobile quando l'immagine è nascosta */}
            {vineLineUrl && (
              <div
                className="prog-vline"
                style={{
                  position: "absolute", top: 0, bottom: 0,
                  left: "50%", transform: "translateX(-50%)",
                  width: 2, background: `${C.olive}38`, zIndex: 0,
                  display: "none",   /* visibile solo via media query mobile */
                }}
              />
            )}
          </>
        )}

        {/* Event rows */}
        {events.map((event, i) => {
          const isLeft = i % 2 === 0;

          return (
            <div key={i}>
              <div
                className="prog-row"
                ref={el => { rowRefs.current[i] = el; }}
              >
                {/* ── Left column (desktop only, even events) ── */}
                <div className="prog-left-col" style={{ zIndex: 1 }}>
                  {isLeft && (
                    <EventCard event={event} isRight={false} C={C} anim={animLeft(i)} customUrl={progCustomUrl(event.icona)} />
                  )}
                </div>

                {/* ── Center dot ── */}
                <div className="prog-center-col">
                  <div
                    className="prog-dot-inner"
                    style={{
                      width: 20, height: 20, borderRadius: "50%",
                      border: `2px solid ${C.olive}`, background: C.cream,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.gold }} />
                  </div>
                </div>

                {/* ── Right column (odd on desktop, all on mobile) ── */}
                <div className="prog-right-col" style={{ zIndex: 1 }}>
                  {/* Desktop: odd events */}
                  {!isLeft && (
                    <EventCard event={event} isRight={true} C={C} anim={animRight(i)} customUrl={progCustomUrl(event.icona)} />
                  )}
                  {/* Mobile only: even events that are normally on the left */}
                  {isLeft && (
                    <div className="prog-mobile-only">
                      <EventCard event={event} isRight={true} C={C} anim={animRight(i)} customUrl={progCustomUrl(event.icona)} />
                    </div>
                  )}
                </div>
              </div>

              {/* ── Polaroid slot between event 4 (Discorsi) and 5 (Torta) ── */}
              {i === 3 && (
                <div style={{ display: "flex", justifyContent: "center", margin: "-16px 0 56px", position: "relative", zIndex: 1 }}>
                  <div
                    onClick={polaroidImg.trigger}
                    style={{
                      width: 320, background: "#fff",
                      boxShadow: "0 8px 32px rgba(0,0,0,.11), 0 2px 8px rgba(0,0,0,.07)",
                      borderRadius: 3, padding: "14px 14px 46px",
                      cursor: "pointer", position: "relative",
                      transition: "transform .35s, box-shadow .35s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "rotate(-1.5deg) translateY(-5px)";
                      e.currentTarget.style.boxShadow = "0 20px 52px rgba(0,0,0,.16), 0 4px 12px rgba(0,0,0,.09)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,.11), 0 2px 8px rgba(0,0,0,.07)";
                    }}
                  >
                    {polaroidImg.url
                      ? <img src={polaroidImg.url} alt="" style={{ width: "100%", height: 220, objectFit: "cover", display: "block", borderRadius: 1 }} />
                      : (
                        <div style={{ width: "100%", height: 220, background: C.cream, borderRadius: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <span style={{ fontSize: 26 }}>📷</span>
                          <span style={{ fontFamily: FONTS.body, fontSize: 11, color: C.olive, opacity: .38, letterSpacing: ".14em", textTransform: "uppercase" }}>Clicca per caricare</span>
                        </div>
                      )
                    }
                    <p style={{ textAlign: "center", marginTop: 10, fontFamily: FONTS.script, fontSize: 17, color: C.dark, opacity: .52 }}>
                      📷 Momento speciale
                    </p>
                    {/* Upload overlay */}
                    <div
                      style={{ position: "absolute", inset: 0, borderRadius: 3, background: "rgba(61,90,62,.38)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity .2s" }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0}
                    >
                      <span style={{ color: "#fff", fontFamily: FONTS.body, fontSize: 13, letterSpacing: ".12em", textTransform: "uppercase" }}>
                        {polaroidImg.url ? "🔄 Cambia foto" : "📷 Carica foto"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
