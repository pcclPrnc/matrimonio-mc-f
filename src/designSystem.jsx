import { useState, useRef } from "react";

/* ── Palette & Font constants ──────────────────────────── */
export const COLORS = {
  cream: "#F5F0E8",
  olive: "#3D5A3E",
  gold:  "#C9A84C",
  rose:  "#D4849A",
  dark:  "#1C1C1C",
  card:  "#FAF7F0",
};

export const FONTS = {
  serif:  "'Playfair Display', serif",
  body:   "'Cormorant Garamond', serif",
  script: "'Dancing Script', cursive",
};

/* ── SVG Illustrations ─────────────────────────────────── */
export const OliveB = ({ flip, scale = 1, color = "#C9A84C" }) => (
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

export const Grape = ({ color = "#3D5A3E", gc = "#9B72CF" }) => (
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

export const BotDiv = ({ color = "#3D5A3E" }) => (
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

export const Wine = ({ color = "#1C1C1C", wc = "#C85A6E" }) => (
  <svg width="48" height="70" viewBox="0 0 52 76" fill="none">
    <path d="M7 6 C7 6 5 28 17 38 C20 41 26 43 26 43 C26 43 32 41 35 38 C47 28 45 6 45 6Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13 30 C15 37 20 42 26 43 C32 42 37 37 39 30Z" fill={wc} opacity=".72"/>
    <line x1="26" y1="43" x2="26" y2="63" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M14 63 C14 63 18 67 26 67 C34 67 38 63 38 63" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
    <line x1="7" y1="6" x2="45" y2="6" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

export const Cake = ({ color = "#C9A84C" }) => (
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

export const Rings = ({ color = "#C9A84C" }) => (
  <svg width="68" height="40" viewBox="0 0 72 42" fill="none">
    <circle cx="23" cy="21" r="16" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="49" cy="21" r="16" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M49 5 L53 9 L49 13 L45 9Z" stroke={color} strokeWidth="1.1" fill="none"/>
    <line x1="57" y1="3" x2="59" y2="1" stroke={color} strokeWidth=".9" strokeLinecap="round"/>
    <line x1="61" y1="7" x2="64" y2="6" stroke={color} strokeWidth=".9" strokeLinecap="round"/>
    <line x1="59" y1="11" x2="62" y2="13" stroke={color} strokeWidth=".9" strokeLinecap="round"/>
  </svg>
);

export const Moon = ({ color = "#C9A84C" }) => (
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

export const Cocktail = ({ color = "#D4849A" }) => (
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

export const Church = ({ color = "#3D5A3E" }) => (
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

export const HeartSVG = ({ color = "#D4849A" }) => (
  <svg width="56" height="52" viewBox="0 0 58 54" fill="none">
    <path d="M29 50 C29 50 4 35 4 19 C4 11 9 6 17 6 C21.5 6 26 8.5 29 13 C32 8.5 36.5 6 41 6 C49 6 54 11 54 19 C54 35 29 50 29 50Z" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round"/>
    <path d="M17 19 C19 24 23 28 29 28.5 C35 28 39 24 41 19" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round"/>
  </svg>
);

/* ── useUpload hook ─────────────────────────────────────── */
export function useUpload() {
  const [url, setUrl] = useState(null);
  const ref = useRef();
  const trigger = () => ref.current && ref.current.click();
  const onChange = e => {
    const f = e.target.files?.[0];
    if (f) setUrl(URL.createObjectURL(f));
    e.target.value = "";
  };
  const clear = () => setUrl(null);
  const inp = (
    <input
      ref={ref}
      type="file"
      accept="image/*"
      style={{ display: "none" }}
      onChange={onChange}
    />
  );
  return { url, trigger, clear, inp, has: !!url };
}
