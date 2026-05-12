import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════
   SVG ILLUSTRAZIONI — fedeli all'invito originale
   ═══════════════════════════════════════════════════════════ */
const OliveB = ({ flip, scale = 1, color = "#C9A84C" }) => (
  <svg width={128 * scale} height={138 * scale} viewBox="0 0 128 138" fill="none"
    style={{ transform: flip ? "scaleX(-1)" : "none", display: "block" }}>
    <path d="M64 3 C61 18 54 36 49 54 C44 70 42 88 40 108 C39 118 37 128 35 136" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
    <path d="M64 3 C50 7 36 10 20 15" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M64 3 C76 7 90 9 106 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M56 33 C44 30 32 28 20 30" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
    <path d="M56 33 C66 28 78 24 90 22" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
    <path d="M49 60 C38 58 28 58 18 60" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    <path d="M49 60 C58 56 68 52 78 50" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    {[[-10,12,14,10],[8,23,10,10],[-6,96,10,10],[12,108,14,10],[-8,17,28,9.5],[5,30,25,9.5],[10,81,20,9.5],[-5,93,25,9.5],[-12,15,58,9],[3,28,55,9],[8,70,49,9],[-6,80,54,9]].map(([r,cx,cy,rx],i)=>(
      <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={i<4?3.2:3} stroke={color} strokeWidth="1.1" fill="none" transform={`rotate(${r} ${cx} ${cy})`}/>
    ))}
    <line x1="38" y1="110" x2="30" y2="114" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    <ellipse cx="28" cy="121" rx="5" ry="8" stroke={color} strokeWidth="1.3" fill={color} fillOpacity=".85"/>
    <line x1="41" y1="118" x2="43" y2="123" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    <ellipse cx="44" cy="130" rx="5" ry="8" stroke={color} strokeWidth="1.3" fill={color} fillOpacity=".85"/>
    <line x1="36" y1="107" x2="27" y2="111" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    <ellipse cx="24" cy="117" rx="4.5" ry="7" stroke={color} strokeWidth="1.3" fill={color} fillOpacity=".85"/>
  </svg>
);

const Grape = ({ color = "#3D5A3E", gc = "#9B72CF" }) => (
  <svg width="68" height="104" viewBox="0 0 68 104" fill="none">
    <path d="M34 4 C34 4 24 10 20 17 C16 24 18 30 24 30 C24 30 20 36 22 40 C24 44 30 44 34 42 C38 44 44 44 46 40 C48 36 44 30 44 30 C50 30 52 24 48 17 C44 10 34 4 34 4Z" stroke={color} strokeWidth="1.2" fill="none"/>
    <path d="M34 4 L34 42" stroke={color} strokeWidth="0.8" fill="none" strokeLinecap="round"/>
    <path d="M34 12 C30 14 26 18 24 22" stroke={color} strokeWidth="0.7" fill="none" strokeLinecap="round"/>
    <path d="M34 12 C38 14 42 18 44 22" stroke={color} strokeWidth="0.7" fill="none" strokeLinecap="round"/>
    <line x1="34" y1="42" x2="34" y2="48" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    {[[22,56],[34,54],[46,56],[16,69],[28,67],[40,67],[52,69],[22,81],[34,80],[46,81],[28,93],[40,93],[34,104]].map(([cx,cy],i)=>(
      <circle key={i} cx={cx} cy={cy} r={i===12?6:7} stroke={gc} strokeWidth="1.1" fill="none"/>
    ))}
  </svg>
);

const BotDiv = ({ color = "#3D5A3E" }) => (
  <svg width="560" height="64" viewBox="0 0 560 64" fill="none" style={{ maxWidth: "100%" }}>
    <path d="M8 40 C10 30 20 28 24 33 C28 38 22 46 16 43 C12 41 12 34 16 32" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <path d="M24 36 C55 20 95 50 135 32 C175 14 215 48 255 34 C295 20 335 50 375 32 C415 14 455 48 495 38 C515 33 535 28 554 24" stroke={color} strokeWidth="1.35" fill="none" strokeLinecap="round"/>
    {[[68,30,68,42,68,28,4.5],[158,18,160,30,158,16,4.5],[255,22,255,12,255,32,5],[355,18,353,30,355,16,4.5],[455,30,457,20,455,32,4.5]].map(([x1,y1,x2,y2,cx,cy,r],i)=>(
      <g key={i}><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1" strokeLinecap="round"/><circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth="1.1" fill="none"/></g>
    ))}
    {[[108,40],[205,44],[304,36],[405,38]].map(([x,y],i)=>(
      <g key={i}>
        <path d={`M${x} ${y} C${x-4} ${y-10} ${x+2} ${y-20} ${x+9} ${y-16} C${x+13} ${y-12} ${x+9} ${y} ${x} ${y}Z`} stroke={color} strokeWidth="1" fill="none"/>
        <path d={`M${x} ${y} C${x+5} ${y-10} ${x+11} ${y-18} ${x+15} ${y-14} C${x+17} ${y-10} ${x+11} ${y+2} ${x} ${y}Z`} stroke={color} strokeWidth="1" fill="none"/>
      </g>
    ))}
    <path d="M508 35 C520 25 536 20 552 24" stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <line x1="528" y1="24" x2="524" y2="17" stroke={color} strokeWidth="1" strokeLinecap="round"/>
    <ellipse cx="522" cy="12" rx="5" ry="7.5" stroke={color} strokeWidth="1.1" fill={color} fillOpacity=".72"/>
    <line x1="540" y1="20" x2="538" y2="12" stroke={color} strokeWidth="1" strokeLinecap="round"/>
    <ellipse cx="536" cy="6" rx="5" ry="7.5" stroke={color} strokeWidth="1.1" fill={color} fillOpacity=".72"/>
    <line x1="514" y1="30" x2="510" y2="24" stroke={color} strokeWidth="1" strokeLinecap="round"/>
    <ellipse cx="508" cy="18" rx="4.5" ry="7" stroke={color} strokeWidth="1.1" fill={color} fillOpacity=".72"/>
  </svg>
);

const Wine   = ({ color = "#1C1C1C", wc = "#C85A6E" }) => (
  <svg width="48" height="70" viewBox="0 0 52 76" fill="none">
    <path d="M7 6 C7 6 5 28 17 38 C20 41 26 43 26 43 C26 43 32 41 35 38 C47 28 45 6 45 6Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13 30 C15 37 20 42 26 43 C32 42 37 37 39 30Z" fill={wc} opacity=".72"/>
    <line x1="26" y1="43" x2="26" y2="63" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M14 63 C14 63 18 67 26 67 C34 67 38 63 38 63" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
    <line x1="7" y1="6" x2="45" y2="6" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

const Cake   = ({ color = "#C9A84C" }) => (
  <svg width="80" height="90" viewBox="0 0 84 94" fill="none">
    <path d="M42 7 C42 7 38 2 33 4 C28 6 28 13 35 18 C37 20 42 22 42 22 C42 22 47 20 49 18 C56 13 56 6 51 4 C46 2 42 7 42 7Z" stroke={color} strokeWidth="1.2" fill="none"/>
    <line x1="42" y1="22" x2="42" y2="28" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    <rect x="28" y="28" width="28" height="16" rx="1" stroke={color} strokeWidth="1.2" fill="none"/>
    <path d="M28 40 C30 36 32 38 34 36 C36 34 38 37 40 36 C42 35 44 37 46 36 C48 35 50 37 52 36 C54 35 56 38 56 40" stroke={color} strokeWidth=".9" fill="none" strokeLinecap="round"/>
    <rect x="16" y="44" width="52" height="22" rx="1" stroke={color} strokeWidth="1.2" fill="none"/>
    <path d="M16 62 C19 56 22 59 26 57 C30 55 33 58 37 57 C41 56 44 58 48 57 C52 56 55 58 58 57 C62 56 65 59 68 62" stroke={color} strokeWidth=".9" fill="none" strokeLinecap="round"/>
    <rect x="4" y="66" width="76" height="24" rx="1" stroke={color} strokeWidth="1.3" fill="none"/>
    <path d="M4 84 C8 78 12 81 16 79 C20 77 24 80 28 79 C32 78 36 80 42 80 C48 80 52 78 56 79 C60 80 64 77 68 79 C72 81 76 78 80 84" stroke={color} strokeWidth=".9" fill="none" strokeLinecap="round"/>
  </svg>
);

const Rings  = ({ color = "#C9A84C" }) => (
  <svg width="68" height="40" viewBox="0 0 72 42" fill="none">
    <circle cx="23" cy="21" r="16" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="49" cy="21" r="16" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M49 5 L53 9 L49 13 L45 9Z" stroke={color} strokeWidth="1.1" fill="none"/>
    <line x1="57" y1="3" x2="59" y2="1" stroke={color} strokeWidth=".9" strokeLinecap="round"/>
    <line x1="61" y1="7" x2="64" y2="6" stroke={color} strokeWidth=".9" strokeLinecap="round"/>
    <line x1="59" y1="11" x2="62" y2="13" stroke={color} strokeWidth=".9" strokeLinecap="round"/>
  </svg>
);

const Moon   = ({ color = "#C9A84C" }) => (
  <svg width="54" height="68" viewBox="0 0 58 72" fill="none">
    <path d="M48 10 C32 10 17 22 17 38 C17 54 32 66 48 66 C36 60 28 50 28 38 C28 26 36 16 48 10Z" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M30 35 C31 38 32 40 30 43" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round"/>
    <path d="M26 46 C28 48 32 48 34 46" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round"/>
    <path d="M25 31 C27 29 30 31 28 33" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round"/>
    <path d="M52 8 L53 5 L54 8 L57 9 L54 10 L53 13 L52 10 L49 9Z" fill={color} opacity=".8"/>
    <path d="M8 32 L9 29 L10 32 L13 33 L10 34 L9 37 L8 34 L5 33Z" fill={color} opacity=".5"/>
    <circle cx="4" cy="50" r="2" fill={color} opacity=".4"/>
  </svg>
);

const Cocktail = ({ color = "#D4849A" }) => (
  <svg width="48" height="72" viewBox="0 0 52 80" fill="none">
    <path d="M4 8 C8 26 18 38 26 42 C34 38 44 26 48 8Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 20 C12 28 18 36 26 42 C34 36 40 28 42 20Z" fill={color} opacity=".22"/>
    <line x1="26" y1="42" x2="26" y2="62" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M14 62 C14 62 18 66 26 66 C34 66 38 62 38 62" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
    <line x1="4" y1="8" x2="48" y2="8" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    <line x1="38" y1="8" x2="48" y2="-3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="18" cy="24" r="2.5" stroke={color} strokeWidth=".9" fill="none"/>
    <circle cx="24" cy="30" r="2"   stroke={color} strokeWidth=".9" fill="none"/>
  </svg>
);

const Church = ({ color = "#3D5A3E" }) => (
  <svg width="56" height="64" viewBox="0 0 58 66" fill="none">
    <rect x="9" y="24" width="40" height="38" stroke={color} strokeWidth="1.3" fill="none"/>
    <path d="M9 24 L29 8 L49 24" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="29" y1="2" x2="29" y2="8" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    <line x1="25" y1="5" x2="33" y2="5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    <rect x="21" y="40" width="16" height="22" stroke={color} strokeWidth="1.1" fill="none"/>
    <circle cx="14" cy="32" r="4" stroke={color} strokeWidth="1" fill="none"/>
    <circle cx="44" cy="32" r="4" stroke={color} strokeWidth="1" fill="none"/>
  </svg>
);

const HeartSVG = ({ color = "#D4849A" }) => (
  <svg width="56" height="52" viewBox="0 0 58 54" fill="none">
    <path d="M29 50 C29 50 4 35 4 19 C4 11 9 6 17 6 C21.5 6 26 8.5 29 13 C32 8.5 36.5 6 41 6 C49 6 54 11 54 19 C54 35 29 50 29 50Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
    <path d="M17 19 C19 24 23 28 29 28.5 C35 28 39 24 41 19" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════════
   UTILITY HOOKS & COMPONENTS
   ═══════════════════════════════════════════════════════════ */
function useUpload() {
  const [url, setUrl] = useState(null);
  const ref = useRef();
  const trigger = () => ref.current && ref.current.click();
  const onChange = e => { const f = e.target.files?.[0]; if (f) setUrl(URL.createObjectURL(f)); e.target.value = ""; };
  const clear = () => setUrl(null);
  const inp = <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={onChange} />;
  return { url, trigger, clear, inp, has: !!url };
}

function Toggle({ on, onChange, color = "#3D5A3E" }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 32, height: 18, borderRadius: 9, border: "none",
      background: on ? color : "#bbb",
      position: "relative", cursor: "pointer", flexShrink: 0, padding: 0,
      transition: "background .25s",
    }}>
      <span style={{
        position: "absolute", top: 3, left: on ? 17 : 3,
        width: 12, height: 12, borderRadius: "50%", background: "#fff",
        transition: "left .25s",
      }} />
    </button>
  );
}

/* Icon slot — mostra SVG o immagine custom, in editMode click per sostituire */
function ISlot({ up, vis, edit, size = 58, svg }) {
  if (!vis) return null;
  const content = up.url
    ? <img src={up.url} alt="" style={{ width: size, height: size, objectFit: "contain" }} />
    : svg;
  if (!edit) return <div style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{content}</div>;
  return (
    <div onClick={up.trigger} style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center", position: "relative", cursor: "pointer" }}>
      {content}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 6,
        background: "rgba(61,90,62,.62)", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 16, opacity: 0, transition: "opacity .2s",
      }}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0}>🔄</div>
    </div>
  );
}

/* Row in editor panel */
function EpRow({ label, vis, onVis, up, C }) {
  const dim = { opacity: vis ? 1 : .4, textDecoration: vis ? "none" : "line-through" };
  const btnStyle = (bc, hc) => ({
    fontFamily: "'Cormorant Garamond',serif", fontSize: 10, letterSpacing: ".1em",
    textTransform: "uppercase", padding: "3px 8px", borderRadius: 2,
    cursor: "pointer", border: `1px solid ${bc}`, color: bc, background: "transparent",
    whiteSpace: "nowrap", transition: "background .2s,color .2s",
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0", borderBottom: `1px solid ${C.olive}11` }}>
      <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: C.olive, flex: 1, letterSpacing: ".06em", ...dim }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
        {vis && (
          <>
            <button style={btnStyle(C.olive)} onClick={up.trigger}
              onMouseEnter={e => { e.currentTarget.style.background = C.olive; e.currentTarget.style.color = C.cream; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.olive; }}>
              {up.has ? "✓" : "↑"}
            </button>
            {up.has && <button style={btnStyle(C.rose)} onClick={up.clear}
              onMouseEnter={e => { e.currentTarget.style.background = C.rose; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.rose; }}>
              orig
            </button>}
          </>
        )}
        <Toggle on={vis} onChange={onVis} color={C.olive} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════ */
export default function App() {
  /* Google Fonts */
  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Dancing+Script:wght@400;700&display=swap";
    document.head.appendChild(l);
    return () => { try { document.head.removeChild(l); } catch (_) {} };
  }, []);

  /* Palette */
  const [pal, setPal] = useState({ cream: "#F5F0E8", olive: "#3D5A3E", gold: "#C9A84C", rose: "#D4849A", dark: "#1C1C1C", card: "#FAF7F0" });
  const sc = (k, v) => setPal(p => ({ ...p, [k]: v }));
  const C = pal;

  /* Visibility */
  const DEF_VIS = { olSx: true, olDx: true, grape: true, wineHero: true, cake: true, cocktail: true, rings: true, moon: true, dividers: true, couplePhoto: true, churchCard: true, wineCard: true, rsvpCard: true, countdownSection: true, infoSection: true };
  const [vis, setVis] = useState(DEF_VIS);
  const sv = (k, v) => setVis(p => ({ ...p, [k]: v }));

  /* Uploads */
  const couple = useUpload(), heroBg = useUpload(), pageBg = useUpload(), divImg = useUpload();
  const uOlSx = useUpload(), uOlDx = useUpload(), uGrape = useUpload(), uWineH = useUpload();
  const uCake = useUpload(), uCocktail = useUpload(), uRings = useUpload(), uMoon = useUpload();
  const uChurch = useUpload(), uWineCard = useUpload(), uRsvp = useUpload();

  /* Countdown */
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const target = new Date("2026-10-02T15:00:00");
    const tick = () => {
      const d = target - new Date();
      if (d <= 0) return setT({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setT({ days: Math.floor(d / 86400000), hours: Math.floor((d % 86400000) / 3600000), minutes: Math.floor((d % 3600000) / 60000), seconds: Math.floor((d % 60000) / 1000) });
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  /* Navbar */
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const [edit, setEdit] = useState(false);

  const SepDiv = () => !vis.dividers ? null : divImg.url
    ? <img src={divImg.url} alt="" style={{ maxWidth: "100%", maxHeight: 60, margin: "0 auto", display: "block" }} />
    : <BotDiv color={C.olive} />;

  const colorFields = [
    { k: "cream", l: "Sfondo crema" }, { k: "olive", l: "Verde oliva" },
    { k: "gold", l: "Oro" }, { k: "rose", l: "Rosa" },
    { k: "dark", l: "Testo" }, { k: "card", l: "Sfondo card" },
  ];

  const NAV = ["Home", "Programma", "RSVP", "FAQ", "Non posso aspettare"];

  /* ── Stili globali via <style> ────────────────────────── */
  const gStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Dancing+Script:wght@400;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    html{scroll-behavior:smooth}
    @keyframes wfu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fp{0%,100%{opacity:.55}50%{opacity:1}}
    .a0{animation:wfu .9s ease .1s both}.a1{animation:wfu .9s ease .3s both}
    .a2{animation:wfu .9s ease .55s both}.a3{animation:wfu .9s ease .8s both}
    .fp{animation:fp 2.6s ease infinite}
    .wc-card{transition:transform .35s,box-shadow .35s}
    .wc-card:hover{transform:translateY(-5px);box-shadow:0 16px 44px rgba(0,0,0,.12)!important}
    .wc-nl{position:relative;text-decoration:none}
    .wc-nl::after{content:'';position:absolute;bottom:-2px;left:0;width:0;height:1px;background:${C.olive};transition:width .3s}
    .wc-nl:hover::after{width:100%}
    .wc-cta{transition:background .3s,color .3s,box-shadow .3s}
    .wc-cta:hover{background:${C.olive}!important;color:${C.cream}!important;box-shadow:0 8px 24px rgba(61,90,62,.28)!important}
    @media(max-width:700px){.wc-dn{display:none!important}}
    @media(min-width:701px){.wc-hb{display:none!important}}
  `;

  return (
    <div style={{ background: pageBg.url ? `url(${pageBg.url}) center/cover fixed` : C.cream, minHeight: "100vh", fontFamily: "'Cormorant Garamond',Georgia,serif", color: C.dark, overflowX: "hidden" }}>
      <style>{gStyles}</style>

      {/* Hidden file inputs */}
      {[couple, heroBg, pageBg, divImg, uOlSx, uOlDx, uGrape, uWineH, uCake, uCocktail, uRings, uMoon, uChurch, uWineCard, uRsvp].map((u, i) => <span key={i}>{u.inp}</span>)}

      {/* ════════ PANNELLO EDITOR ════════ */}
      {edit && (
        <div style={{
          position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 500,
          width: 272, background: C.cream + "F6", backdropFilter: "blur(12px)",
          borderLeft: `1px solid ${C.olive}22`, overflowY: "auto",
          boxShadow: "-4px 0 24px rgba(0,0,0,.12)",
        }}>
          {/* Header sticky */}
          <div style={{ padding: "16px 16px 10px", borderBottom: `1px solid ${C.olive}14`, position: "sticky", top: 0, background: C.cream + "F8", zIndex: 10 }}>
            <p style={{ fontFamily: "'Dancing Script',cursive", fontSize: 22, color: C.olive, marginBottom: 2 }}>✏️ Personalizza</p>
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 11, color: C.olive, opacity: .5, letterSpacing: ".08em" }}>
              Toggle 🔘 · Carica ↑ · Ripristina orig
            </p>
          </div>

          <div style={{ padding: "0 16px 16px" }}>
            {/* Sfondi */}
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 11, fontStyle: "italic", color: C.olive, opacity: .6, letterSpacing: ".12em", textTransform: "uppercase", marginTop: 14, marginBottom: 4 }}>Sfondi</p>
            {[{ l: "Sfondo pagina", u: pageBg }, { l: "Sfondo hero", u: heroBg }].map(({ l, u }) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0", borderBottom: `1px solid ${C.olive}11` }}>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: C.olive, flex: 1, letterSpacing: ".06em" }}>{l}</span>
                <button onClick={u.trigger} style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 2, cursor: "pointer", border: `1px solid ${C.olive}`, color: C.olive, background: "transparent" }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.olive; e.currentTarget.style.color = C.cream; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.olive; }}>
                  {u.has ? "✓ cambia" : "↑ carica"}
                </button>
                {u.has && <button onClick={u.clear} style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 2, cursor: "pointer", border: `1px solid ${C.rose}`, color: C.rose, background: "transparent" }}
                  onMouseEnter={e => { e.currentTarget.style.background = C.rose; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.rose; }}>
                  rimuovi
                </button>}
              </div>
            ))}

            {/* Foto sposi */}
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 11, fontStyle: "italic", color: C.olive, opacity: .6, letterSpacing: ".12em", textTransform: "uppercase", marginTop: 14, marginBottom: 4 }}>Foto sposi</p>
            <EpRow label="Foto degli sposi" vis={vis.couplePhoto} onVis={v => sv("couplePhoto", v)} up={couple} C={C} />

            {/* Separatori */}
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 11, fontStyle: "italic", color: C.olive, opacity: .6, letterSpacing: ".12em", textTransform: "uppercase", marginTop: 14, marginBottom: 4 }}>Separatori botanici</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0", borderBottom: `1px solid ${C.olive}11` }}>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: C.olive, flex: 1, opacity: vis.dividers ? 1 : .4, textDecoration: vis.dividers ? "none" : "line-through" }}>Separatori</span>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {vis.dividers && <>
                  <button onClick={divImg.trigger} style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 2, cursor: "pointer", border: `1px solid ${C.olive}`, color: C.olive, background: "transparent" }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.olive; e.currentTarget.style.color = C.cream; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.olive; }}>
                    {divImg.has ? "✓" : "↑"}
                  </button>
                  {divImg.has && <button onClick={divImg.clear} style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 2, cursor: "pointer", border: `1px solid ${C.rose}`, color: C.rose, background: "transparent" }}
                    onMouseEnter={e => { e.currentTarget.style.background = C.rose; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.rose; }}>
                    orig
                  </button>}
                </>}
                <Toggle on={vis.dividers} onChange={v => sv("dividers", v)} color={C.olive} />
              </div>
            </div>

            {/* Illustrazioni Hero */}
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 11, fontStyle: "italic", color: C.olive, opacity: .6, letterSpacing: ".12em", textTransform: "uppercase", marginTop: 14, marginBottom: 4 }}>Illustrazioni Hero</p>
            {[
              { l: "🌿 Ramo ulivo sx", k: "olSx", u: uOlSx },
              { l: "🌿 Ramo ulivo dx", k: "olDx", u: uOlDx },
              { l: "🍇 Grappolo uva", k: "grape", u: uGrape },
              { l: "🍷 Calice vino", k: "wineHero", u: uWineH },
              { l: "🎂 Torta nuziale", k: "cake", u: uCake },
              { l: "🍹 Cocktail", k: "cocktail", u: uCocktail },
              { l: "💍 Fedi nuziali", k: "rings", u: uRings },
              { l: "🌙 Luna crescente", k: "moon", u: uMoon },
            ].map(({ l, k, u }) => (
              <EpRow key={k} label={l} vis={vis[k]} onVis={v => sv(k, v)} up={u} C={C} />
            ))}

            {/* Sezioni */}
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 11, fontStyle: "italic", color: C.olive, opacity: .6, letterSpacing: ".12em", textTransform: "uppercase", marginTop: 14, marginBottom: 4 }}>Sezioni</p>
            {[{ l: "Conto alla rovescia", k: "countdownSection" }, { l: "Card Info & RSVP", k: "infoSection" }].map(({ l, k }) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0", borderBottom: `1px solid ${C.olive}11` }}>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: C.olive, flex: 1, opacity: vis[k] ? 1 : .4, textDecoration: vis[k] ? "none" : "line-through" }}>{l}</span>
                <Toggle on={vis[k]} onChange={v => sv(k, v)} color={C.olive} />
              </div>
            ))}

            {/* Icone card */}
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 11, fontStyle: "italic", color: C.olive, opacity: .6, letterSpacing: ".12em", textTransform: "uppercase", marginTop: 14, marginBottom: 4 }}>Icone card info</p>
            {[
              { l: "⛪ Icona Cerimonia", k: "churchCard", u: uChurch },
              { l: "🥂 Icona Ricevimento", k: "wineCard", u: uWineCard },
              { l: "💌 Icona RSVP", k: "rsvpCard", u: uRsvp },
            ].map(({ l, k, u }) => (
              <EpRow key={k} label={l} vis={vis[k]} onVis={v => sv(k, v)} up={u} C={C} />
            ))}

            {/* Colori */}
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 11, fontStyle: "italic", color: C.olive, opacity: .6, letterSpacing: ".12em", textTransform: "uppercase", marginTop: 14, marginBottom: 4 }}>Palette colori</p>
            {colorFields.map(({ k, l }) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 0", borderBottom: `1px solid ${C.olive}11` }}>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: C.olive, flex: 1 }}>{l}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 3, background: C[k], border: `1px solid ${C.olive}44` }} />
                  <input type="color" value={C[k]} onChange={e => sc(k, e.target.value)}
                    style={{ width: 24, height: 24, border: "none", padding: 0, borderRadius: 3, cursor: "pointer" }} />
                </div>
              </div>
            ))}

            {/* Reset + Chiudi */}
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => { setVis(DEF_VIS); setPal({ cream: "#F5F0E8", olive: "#3D5A3E", gold: "#C9A84C", rose: "#D4849A", dark: "#1C1C1C", card: "#FAF7F0" }); }}
                style={{ width: "100%", padding: "8px 0", fontFamily: "'Cormorant Garamond',serif", fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", background: "transparent", color: C.olive, border: `1px solid ${C.olive}44`, borderRadius: 2, cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = C.olive + "18"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                ↺ Reset tutto
              </button>
              <button onClick={() => setEdit(false)}
                style={{ width: "100%", padding: "9px 0", fontFamily: "'Cormorant Garamond',serif", fontSize: 13, letterSpacing: ".14em", textTransform: "uppercase", background: C.olive, color: C.cream, border: "none", borderRadius: 2, cursor: "pointer" }}>
                ✓ Chiudi editor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottone Personalizza */}
      <button onClick={() => setEdit(e => !e)} style={{
        position: "fixed", bottom: 20, right: edit ? 280 : 20, zIndex: 600,
        background: edit ? C.olive : C.cream, color: edit ? C.cream : C.olive,
        border: `1.5px solid ${C.olive}`, fontFamily: "'Cormorant Garamond',serif",
        fontSize: 13, letterSpacing: ".14em", textTransform: "uppercase",
        padding: "9px 18px", borderRadius: 24, cursor: "pointer",
        boxShadow: "0 4px 16px rgba(0,0,0,.15)", transition: "all .3s",
      }}>
        {edit ? "✓ Fine" : "✏️ Personalizza"}
      </button>

      {/* ════════ NAVBAR ════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? C.cream + "F2" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.olive}22` : "none",
        transition: "all .4s ease", padding: "18px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <button className="wc-hb" onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", flexDirection: "column", gap: 5 }}>
          {[0, 1, 2].map(i => <span key={i} style={{ display: "block", width: 26, height: 1.5, background: C.olive, borderRadius: 1 }} />)}
        </button>
        <div style={{ fontFamily: "'Dancing Script',cursive", fontSize: 30, color: C.olive, letterSpacing: ".05em", textAlign: "center", flex: 1 }}>MC &amp; F</div>
        <div className="wc-dn" style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {NAV.map(l => <a key={l} href="#" className="wc-nl" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, color: C.olive, textDecoration: "none", letterSpacing: ".17em", textTransform: "uppercase" }}>{l}</a>)}
        </div>
        <div style={{ width: 200 }} className="wc-dn" />
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, background: C.cream + "F8", zIndex: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 36 }}>
          <button onClick={() => setMenuOpen(false)} style={{ position: "absolute", top: 22, right: 32, background: "none", border: "none", fontSize: 36, cursor: "pointer", color: C.olive, lineHeight: 1 }}>×</button>
          {NAV.map(l => <a key={l} href="#" onClick={() => setMenuOpen(false)} style={{ fontFamily: "'Dancing Script',cursive", fontSize: 32, color: C.olive, textDecoration: "none" }}>{l}</a>)}
        </div>
      )}

      {/* ════════ HERO ════════ */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "120px 20px 80px", position: "relative",
        overflow: "hidden", textAlign: "center",
        background: heroBg.url ? `url(${heroBg.url}) center/cover` : C.cream,
      }}>
        {heroBg.url && <div style={{ position: "absolute", inset: 0, background: C.cream + "CC" }} />}
        <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Decorazioni angoli */}
          <div style={{ position: "absolute", top: 0, left: 0, opacity: .9 }}>
            {vis.olSx && (uOlSx.url
              ? <img src={uOlSx.url} alt="" style={{ width: 110, height: 120, objectFit: "contain", cursor: edit ? "pointer" : "default" }} onClick={edit ? uOlSx.trigger : undefined} />
              : <div onClick={edit ? uOlSx.trigger : undefined} style={{ cursor: edit ? "pointer" : "default" }}><OliveB scale={.86} color={C.gold} /></div>
            )}
          </div>
          <div style={{ position: "absolute", top: 0, right: 0, opacity: .9 }}>
            {vis.olDx && (uOlDx.url
              ? <img src={uOlDx.url} alt="" style={{ width: 110, height: 120, objectFit: "contain", transform: "scaleX(-1)", cursor: edit ? "pointer" : "default" }} onClick={edit ? uOlDx.trigger : undefined} />
              : <div onClick={edit ? uOlDx.trigger : undefined} style={{ cursor: edit ? "pointer" : "default" }}><OliveB flip scale={.86} color={C.gold} /></div>
            )}
          </div>
          <div style={{ position: "absolute", top: 72, right: 44, opacity: .88 }}>
            <ISlot up={uGrape} vis={vis.grape} edit={edit} size={68} svg={<Grape color={C.olive} gc="#9B72CF" />} />
          </div>
          <div style={{ position: "absolute", top: 66, right: 4, opacity: .75 }}>
            <ISlot up={uWineH} vis={vis.wineHero} edit={edit} size={50} svg={<Wine color={C.dark} wc={C.rose} />} />
          </div>
          <div style={{ position: "absolute", left: 4, top: "38%", opacity: .7 }}>
            <ISlot up={uCake} vis={vis.cake} edit={edit} size={80} svg={<Cake color={C.gold} />} />
          </div>
          <div style={{ position: "absolute", right: 4, top: "52%", opacity: .7 }}>
            <ISlot up={uCocktail} vis={vis.cocktail} edit={edit} size={50} svg={<Cocktail color={C.rose} />} />
          </div>
          <div style={{ position: "absolute", right: 8, top: "33%", opacity: .78 }}>
            <ISlot up={uRings} vis={vis.rings} edit={edit} size={68} svg={<Rings color={C.gold} />} />
          </div>
          <div style={{ position: "absolute", bottom: 50, right: 6, opacity: .82 }}>
            <ISlot up={uMoon} vis={vis.moon} edit={edit} size={54} svg={<Moon color={C.gold} />} />
          </div>

          <p className="a0" style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 18, letterSpacing: ".22em", color: C.rose, marginBottom: 20 }}>Ci sposiamo! ♡</p>
          <h1 className="a1" style={{ fontFamily: "'Dancing Script',cursive", fontSize: "clamp(44px,9vw,94px)", color: C.olive, lineHeight: 1.1, fontWeight: 700, marginBottom: 4 }}>Maria Cristina</h1>
          <p className="a1" style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 22, color: C.olive, marginBottom: 4 }}>e</p>
          <h1 className="a1" style={{ fontFamily: "'Dancing Script',cursive", fontSize: "clamp(44px,9vw,94px)", color: C.olive, lineHeight: 1.1, fontWeight: 700, marginBottom: 24 }}>Flavio</h1>

          <div className="a2" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 38, justifyContent: "center" }}>
            <div style={{ height: 1, width: 46, background: C.gold, opacity: .55 }} />
            <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, letterSpacing: ".2em", color: C.dark, opacity: .7 }}>2 OTTOBRE 2026 · ROMA</p>
            <div style={{ height: 1, width: 46, background: C.gold, opacity: .55 }} />
          </div>

          {vis.couplePhoto && (
            <div className="a2" onClick={edit ? couple.trigger : undefined}
              style={{ width: "100%", maxWidth: 272, aspectRatio: "3/4", border: couple.url ? "none" : `2px dashed ${C.olive}55`, borderRadius: 10, overflow: "hidden", marginBottom: 38, background: couple.url ? "transparent" : `${C.olive}06`, cursor: edit ? "pointer" : "default", position: "relative" }}>
              {couple.url
                ? <img src={couple.url} alt="Sposi" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <span style={{ fontSize: 30 }}>📷</span>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: C.olive, opacity: .42, letterSpacing: ".18em", textTransform: "uppercase" }}>{edit ? "Clicca per caricare" : "Foto sposi"}</span>
                </div>
              }
              {edit && <div style={{ position: "absolute", inset: 0, background: "rgba(61,90,62,.5)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, opacity: 0, transition: "opacity .2s" }}
                onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                <span style={{ fontSize: 22 }}>🔄</span>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 11, color: "#F5F0E8", letterSpacing: ".14em", textTransform: "uppercase" }}>Cambia foto</span>
                {couple.has && <button onClick={e => { e.stopPropagation(); couple.clear(); }} style={{ background: "rgba(255,255,255,.2)", border: "1px solid rgba(255,255,255,.5)", color: "#fff", fontSize: 10, padding: "2px 8px", borderRadius: 2, cursor: "pointer", fontFamily: "'Cormorant Garamond',serif", marginTop: 4 }}>Rimuovi</button>}
              </div>}
            </div>
          )}

          <a href="#info" className="wc-cta a3" style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, letterSpacing: ".18em", textTransform: "uppercase", color: C.olive, border: `1.2px solid ${C.olive}`, padding: "12px 34px", borderRadius: 2, textDecoration: "none", display: "inline-block", background: "transparent" }}>
            Conferma la tua presenza →
          </a>
        </div>
      </section>

      {/* Separatori + Countdown + Cards */}
      <div style={{ display: "flex", justifyContent: "center", padding: "4px 16px", opacity: .8 }}><SepDiv /></div>

      {vis.countdownSection && (
        <section style={{ padding: "68px 20px", textAlign: "center", background: C.cream }}>
          <p style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", fontSize: 20, color: C.rose, marginBottom: 46, letterSpacing: ".1em" }}>Mancano ancora…</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "clamp(14px,4vw,62px)", flexWrap: "wrap", alignItems: "flex-start" }}>
            {[{ v: t.days, l: "Giorni" }, { v: t.hours, l: "Ore" }, { v: t.minutes, l: "Minuti" }, { v: t.seconds, l: "Secondi" }].map(({ v, l }, i) => (
              <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 64, position: "relative" }}>
                {i > 0 && <span className="fp" style={{ position: "absolute", left: -18, top: 8, fontFamily: "'Playfair Display',serif", fontSize: 36, color: C.gold, lineHeight: 1 }}>:</span>}
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(44px,7vw,76px)", fontWeight: 700, color: C.olive, lineHeight: 1 }}>{String(v || 0).padStart(2, "0")}</span>
                <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 10, letterSpacing: ".28em", textTransform: "uppercase", color: C.dark, opacity: .42, marginTop: 7 }}>{l}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div style={{ display: "flex", justifyContent: "center", padding: "4px 16px", opacity: .8 }}><SepDiv /></div>

      {vis.infoSection && (
        <section id="info" style={{ padding: "68px 20px", maxWidth: 1060, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(24px,4vw,40px)", color: C.olive, textAlign: "center", marginBottom: 50, fontWeight: 400, fontStyle: "italic" }}>Dove &amp; Quando</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 22 }}>
            {/* Card Cerimonia */}
            <div className="wc-card" style={{ background: C.card, border: `1px solid ${C.olive}1A`, borderRadius: 10, padding: "38px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 13, boxShadow: `0 4px 18px rgba(0,0,0,.05)` }}>
              <ISlot up={uChurch} vis={vis.churchCard} edit={edit} size={56} svg={<Church color={C.olive} />} />
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: C.olive, fontWeight: 400, fontStyle: "italic" }}>Cerimonia</h3>
              <div style={{ height: 1, width: 38, background: C.gold, opacity: .5 }} />
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, lineHeight: 1.8, color: C.dark }}>
                <strong style={{ fontWeight: 400, color: C.olive }}>Chiesa di Santa Francesca Romana</strong><br />
                <span style={{ fontSize: 13, opacity: .55 }}>Piazza di Santa Francesca Romana, Roma</span><br />
                <span style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", color: C.olive, fontSize: 16 }}>Ore 15:00</span>
              </div>
              <a href="https://maps.google.com/?q=Chiesa+Santa+Francesca+Romana+Roma" target="_blank" rel="noopener noreferrer" className="wc-nl"
                style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: C.olive, textDecoration: "none", borderBottom: `1px solid ${C.olive}44`, paddingBottom: 2 }}>
                Apri in Maps →
              </a>
            </div>
            {/* Card Ricevimento */}
            <div className="wc-card" style={{ background: C.card, border: `1px solid ${C.olive}1A`, borderRadius: 10, padding: "38px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 13, boxShadow: `0 4px 18px rgba(0,0,0,.05)` }}>
              <ISlot up={uWineCard} vis={vis.wineCard} edit={edit} size={56} svg={<Wine color={C.gold} wc={C.rose} />} />
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: C.olive, fontWeight: 400, fontStyle: "italic" }}>Ricevimento</h3>
              <div style={{ height: 1, width: 38, background: C.gold, opacity: .5 }} />
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, lineHeight: 1.8, color: C.dark }}>
                <strong style={{ fontWeight: 400, color: C.olive }}>Casale Campovecchio</strong><br />
                <span style={{ fontSize: 13, opacity: .55 }}>Via di Campo Vecchio 16, Grottaferrata</span><br />
                <span style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", color: C.olive, fontSize: 16 }}>A seguire la cerimonia</span>
              </div>
              <a href="https://maps.google.com/?q=Via+di+Campo+Vecchio+16+Grottaferrata" target="_blank" rel="noopener noreferrer" className="wc-nl"
                style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: C.olive, textDecoration: "none", borderBottom: `1px solid ${C.olive}44`, paddingBottom: 2 }}>
                Apri in Maps →
              </a>
            </div>
            {/* Card RSVP */}
            <div className="wc-card" style={{ background: C.card, border: `1px solid ${C.rose}28`, borderRadius: 10, padding: "38px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 13, boxShadow: `0 4px 18px rgba(212,132,154,.06)` }}>
              <ISlot up={uRsvp} vis={vis.rsvpCard} edit={edit} size={56} svg={<HeartSVG color={C.rose} />} />
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: C.rose, fontWeight: 400, fontStyle: "italic" }}>RSVP</h3>
              <div style={{ height: 1, width: 38, background: C.rose, opacity: .4 }} />
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, lineHeight: 1.8, color: C.dark }}>
                Ci farebbe immensamente piacere<br />averti con noi!<br />
                {/* TODO: sostituire [data] con scadenza reale */}
                <span style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", color: C.rose, fontSize: 16 }}>Conferma entro il [data]</span>
              </div>
              {/* TODO: collegare href a Google Form / Typeform */}
              <a href="#" className="wc-nl"
                style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: C.rose, textDecoration: "none", borderBottom: `1px solid ${C.rose}44`, paddingBottom: 2 }}>
                Rispondi qui →
              </a>
            </div>
          </div>
        </section>
      )}

      <div style={{ display: "flex", justifyContent: "center", padding: "4px 16px 38px", opacity: .65 }}><SepDiv /></div>

      {/* ════════ FOOTER ════════ */}
      <footer style={{ padding: "52px 20px 90px", textAlign: "center", borderTop: `1px solid ${C.olive}18`, background: C.cream }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14, opacity: .82 }}>
          <ISlot up={uMoon} vis={vis.moon} edit={edit} size={54} svg={<Moon color={C.gold} />} />
        </div>
        <p style={{ fontFamily: "'Dancing Script',cursive", fontSize: "clamp(20px,3.5vw,30px)", color: C.olive, lineHeight: 1.4 }}>Con amore, Maria Cristina &amp; Flavio 🤍</p>
        <div style={{ display: "flex", justifyContent: "center", margin: "13px 0", opacity: .55 }}>
          <Rings color={C.gold} />
        </div>
        <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 11, color: C.dark, opacity: .35, letterSpacing: ".24em", textTransform: "uppercase" }}>2 Ottobre 2026 · Roma</p>
      </footer>
    </div>
  );
}
