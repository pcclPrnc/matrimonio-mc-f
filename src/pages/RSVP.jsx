import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { COLORS, FONTS } from "../designSystem.jsx";
import { useSite } from "../context/SiteContext";
import { db, CONFIGURED } from "../firebase";
import { ref, push } from "firebase/database";

/* ═══════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════ */
const MAX_PERSONE = 6; // ospite + max 5 accompagnatori

const ALLERGIE_LIST = [
  { key: "glutine",     label: "Senza Glutine",     emoji: "🌾" },
  { key: "lattosio",   label: "Senza Lattosio",    emoji: "🥛" },
  { key: "fruttaSecca",label: "Senza Frutta secca", emoji: "🥜" },
  { key: "vegetariano",label: "Vegetariano",        emoji: "🥗" },
  { key: "vegano",     label: "Vegano",             emoji: "🌱" },
];

const EMPTY_PERSONA = () => ({ nome: "", note: "", allergie: [] });

const INITIAL_FORM = {
  nome: "", cognome: "", presenza: null,
  nPersone: 1, persone: [EMPTY_PERSONA()],
  messaggio: "",
};

/* ═══════════════════════════════════════════════════════════
   SVG — Calici che si toccano
   ═══════════════════════════════════════════════════════════ */
function ChampagneToast({ color = "#C9A84C", rose = "#D4849A" }) {
  return (
    <svg width="140" height="110" viewBox="0 0 140 110" fill="none">
      {/* Left coupe */}
      <path d="M28 22 C32 38 36 50 42 58 C44 61 48 64 52 65 L44 72" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <line x1="36" y1="72" x2="52" y2="72" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="22" y1="22" x2="46" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M24 22 C24 22 22 36 30 50 C34 56 42 62 52 65" fill={rose} opacity=".18"/>

      {/* Right coupe (mirrored) */}
      <path d="M112 22 C108 38 104 50 98 58 C96 61 92 64 88 65 L96 72" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <line x1="88" y1="72" x2="104" y2="72" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="94" y1="22" x2="118" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M116 22 C116 22 118 36 110 50 C106 56 98 62 88 65" fill={rose} opacity=".18"/>

      {/* Glasses meeting at top */}
      <path d="M46 22 C55 14 70 10 70 10 C70 10 85 14 94 22" stroke={color} strokeWidth="1.3" fill="none" strokeLinecap="round"/>

      {/* Sparkles */}
      <path d="M70 4 L71 1 L72 4 L75 5 L72 6 L71 9 L70 6 L67 5Z" fill={color} opacity=".75"/>
      <path d="M50 6 L50.7 4 L51.4 6 L53.5 6.5 L51.4 7 L50.7 9 L50 7 L47.9 6.5Z" fill={color} opacity=".5"/>
      <path d="M90 6 L90.7 4 L91.4 6 L93.5 6.5 L91.4 7 L90.7 9 L90 7 L87.9 6.5Z" fill={color} opacity=".5"/>
      <circle cx="38" cy="14" r="2" fill={color} opacity=".35"/>
      <circle cx="102" cy="14" r="2" fill={color} opacity=".35"/>
      <circle cx="62" cy="2" r="1.5" fill={rose} opacity=".5"/>
      <circle cx="78" cy="2" r="1.5" fill={rose} opacity=".5"/>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   PROGRESS BAR
   ═══════════════════════════════════════════════════════════ */
function ProgressBar({ step, presenza, C }) {
  const steps = [
    { n: 1, label: "Chi sei" },
    { n: 2, label: "Menu" },
    { n: 3, label: "Messaggio" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 0, marginBottom: 44 }}>
      {steps.map((s, i) => {
        const active  = step === s.n;
        const done    = step > s.n;
        const skipped = s.n === 2 && presenza === false;
        return (
          <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: active || (done && !skipped) ? C.olive : "transparent",
                border: `2px solid ${skipped ? C.gold + "44" : C.olive}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .35s",
              }}>
                {done && !skipped
                  ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7 L6 10 L11 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  : <span style={{
                      fontFamily: FONTS.serif, fontSize: 13,
                      color: active ? "#fff" : skipped ? C.gold + "55" : C.olive,
                    }}>{s.n}</span>
                }
              </div>
              <span style={{
                fontFamily: FONTS.body, fontSize: 10, letterSpacing: ".1em",
                textTransform: "uppercase",
                color: active ? C.olive : skipped ? C.gold : C.dark,
                opacity: active ? 1 : skipped ? 0.3 : 0.45,
                whiteSpace: "nowrap",
              }}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                height: 1, width: 64, flexShrink: 0,
                background: C.olive,
                opacity: done && !(s.n === 1 && presenza === false && step === 3) ? 0.55 : 0.18,
                margin: "0 0 27px", alignSelf: "flex-start", marginTop: 17,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CIRCLE PHOTO SLOT
   ═══════════════════════════════════════════════════════════ */
function CirclePhoto({ up, C }) {
  if (!up.url) return null;
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
      <div style={{
        width: 180, height: 180, borderRadius: "50%", flexShrink: 0,
        overflow: "hidden", position: "relative",
      }}>
        <img src={up.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CUSTOM CHECKBOX
   ═══════════════════════════════════════════════════════════ */
function CustomCheckbox({ checked, onChange, label, emoji, C }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "7px 0", userSelect: "none" }}>
      <div onClick={() => onChange(!checked)} style={{
        width: 20, height: 20, borderRadius: 3, flexShrink: 0,
        border: `1.5px solid ${checked ? C.olive : C.olive + "4A"}`,
        background: checked ? C.olive : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .2s",
      }}>
        {checked && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6 L5 9 L10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <span style={{ fontFamily: FONTS.body, fontSize: 15, color: C.dark }}>{emoji} {label}</span>
    </label>
  );
}

/* ═══════════════════════════════════════════════════════════
   FIELD WRAPPER
   ═══════════════════════════════════════════════════════════ */
function Field({ label, required, error, C, children, fieldRef }) {
  return (
    <div ref={fieldRef} style={{ marginBottom: 22 }}>
      <label style={{
        display: "block", fontFamily: FONTS.body, fontSize: 12,
        letterSpacing: ".12em", textTransform: "uppercase",
        color: C.olive, marginBottom: 7, opacity: .8,
      }}>
        {label}{required && <span style={{ color: C.rose }}> *</span>}
      </label>
      {children}
      {error && (
        <p style={{ fontFamily: FONTS.body, fontStyle: "italic", fontSize: 12.5, color: C.rose, marginTop: 5 }}>
          {error}
        </p>
      )}
    </div>
  );
}

/* shared input/textarea base style */
const inputBase = (C, hasError) => ({
  width: "100%", padding: "12px 16px",
  fontFamily: FONTS.body, fontSize: 16, color: C.dark,
  background: C.card, borderRadius: 6,
  border: `1px solid ${hasError ? C.rose : C.olive + "44"}`,
  outline: "none",
  boxSizing: "border-box",
});

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
export default function RSVP() {
  const { siteData, updateMedia } = useSite();
  const C = COLORS;

  /* Form state — restored from sessionStorage on mount.
     Spread INITIAL_FORM first so any missing field (e.g. from a stale
     cached draft) falls back to the default instead of crashing. */
  const [formData, setFormData] = useState(() => {
    try {
      const saved = sessionStorage.getItem("rsvp_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_FORM,
          ...parsed,
          // ensure persone is always a valid array with complete objects
          persone: Array.isArray(parsed.persone) && parsed.persone.length > 0
            ? parsed.persone.map(p => ({ ...EMPTY_PERSONA(), ...p,
                allergie: Array.isArray(p?.allergie) ? p.allergie : [] }))
            : [EMPTY_PERSONA()],
        };
      }
    } catch {}
    return { ...INITIAL_FORM };
  });

  const [step, setStep]           = useState(1);
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sendError, setSendError] = useState("");

  /* Prevents double-write to localStorage when user retries after webhook failure */
  const localSavedRef = useRef(false);

  /* Hero circle photo — read-only, set via Admin panel */
  const heroPhotoUrl = siteData.media?.rsvp_hero || localStorage.getItem("media_rsvp_hero") || null;
  const heroPhotoUp = { url: heroPhotoUrl };

  /* Refs for scroll-to-error */
  const nomeRef     = useRef(null);
  const cognomeRef  = useRef(null);
  const presenzaRef = useRef(null);

  /* Persist draft to sessionStorage */
  useEffect(() => {
    sessionStorage.setItem("rsvp_draft", JSON.stringify(formData));
  }, [formData]);

  /* ── Form helpers ── */
  const set = (key, val) => setFormData(p => ({ ...p, [key]: val }));

  const setNPersone = (delta) => {
    setFormData(prev => {
      const newN = Math.max(1, Math.min(MAX_PERSONE, prev.nPersone + delta));
      const newPersone = Array.from({ length: newN }, (_, i) =>
        prev.persone[i] ?? EMPTY_PERSONA()
      );
      return { ...prev, nPersone: newN, persone: newPersone };
    });
  };

  const setPersona = (idx, key, val) => {
    setFormData(prev => {
      const updated = prev.persone.map((p, i) =>
        i === idx ? { ...p, [key]: val } : p
      );
      return { ...prev, persone: updated };
    });
  };

  const toggleAllergia = (idx, key) => {
    setFormData(prev => {
      const p = prev.persone[idx];
      const arr = p.allergie.includes(key)
        ? p.allergie.filter(k => k !== key)
        : [...p.allergie, key];
      return {
        ...prev,
        persone: prev.persone.map((pe, i) => i === idx ? { ...pe, allergie: arr } : pe),
      };
    });
  };

  /* ── Validation & navigation ── */
  const nextStep = () => {
    if (step === 1) {
      const errs = {};
      if (!formData.nome.trim())     errs.nome     = "Il nome è obbligatorio";
      if (!formData.cognome.trim())  errs.cognome  = "Il cognome è obbligatorio";
      if (formData.presenza === null) errs.presenza = "Seleziona se sarai presente";
      setErrors(errs);
      if (Object.keys(errs).length > 0) {
        const errRef = errs.nome ? nomeRef : errs.cognome ? cognomeRef : presenzaRef;
        errRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      setStep(formData.presenza === false ? 3 : 2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const prevStep = () => {
    if (step === 3 && formData.presenza === false) setStep(1);
    else setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setSendError("");

    const entry = {
      timestamp: new Date().toISOString(),
      nome:      formData.nome,
      cognome:   formData.cognome,
      presenza:  formData.presenza,
      nPersone:  formData.presenza ? formData.nPersone : 0,
      persone:   formData.presenza ? formData.persone  : [],
      messaggio: formData.messaggio,
    };

    /* ── Google Sheets webhook ── */
    const webhookUrl = (siteData.webhookUrl || localStorage.getItem("admin_webhook") || "").trim();

    if (webhookUrl) {
      try {
        /* Use text/plain to avoid CORS preflight (Apps Script limitation).
           The body is still valid JSON — Apps Script reads it with JSON.parse(). */
        await fetch(webhookUrl, {
          method:  "POST",
          mode:    "no-cors",          // opaque response — no preflight triggered
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body:    JSON.stringify(entry),
        });
        /* no-cors: response is opaque so we can't check res.ok.
           If fetch() didn't throw, the request was dispatched. */
      } catch {
        /* Network error — save locally so data isn't lost, then surface error. */
        if (!localSavedRef.current) {
          try {
            const prev = JSON.parse(localStorage.getItem("rsvp_risposte") || "[]");
            localStorage.setItem("rsvp_risposte", JSON.stringify([...prev, entry]));
            localSavedRef.current = true;
          } catch {}
        }
        setLoading(false);
        setSendError(
          "Invio non riuscito — controlla la connessione e riprova. " +
          "La tua risposta è stata comunque salvata localmente."
        );
        return;
      }
    }

    /* ── Save to Firebase and localStorage ── */
    if (CONFIGURED) {
      try { await push(ref(db, "rsvpResponses"), entry); } catch {}
    }
    try {
      const prev = JSON.parse(localStorage.getItem("rsvp_risposte") || "[]");
      localStorage.setItem("rsvp_risposte", JSON.stringify([...prev, entry]));
      sessionStorage.removeItem("rsvp_draft");
    } catch {}

    setLoading(false);
    setSubmitted(true);
  };

  /* ── Compact nav button style ── */
  const navBtn = (primary) => ({
    fontFamily: FONTS.body, fontSize: 13, letterSpacing: ".16em",
    textTransform: "uppercase", padding: "11px 28px", borderRadius: 2,
    cursor: "pointer", transition: "all .25s", border: `1.2px solid ${C.olive}`,
    background: primary ? C.olive : "transparent",
    color:      primary ? C.cream : C.olive,
  });

  /* ═══════ CONFIRMATION SCREEN ═══════ */
  if (submitted) {
    return (
      <div style={{
        background: C.cream, minHeight: "100vh", display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "40px 24px", fontFamily: FONTS.body, color: C.dark,
        animation: "wfu .8s ease both",
      }}>
        <ChampagneToast color={C.gold} rose={C.rose} />
        <h1 style={{
          fontFamily: FONTS.script, fontSize: "clamp(2.4rem,6vw,4rem)",
          color: C.olive, marginTop: 24, marginBottom: 14, textAlign: "center",
        }}>
          Grazie, {formData.nome}! 🎉
        </h1>
        <p style={{
          fontFamily: FONTS.body, fontStyle: "italic",
          fontSize: "clamp(1rem,2.5vw,1.25rem)", color: C.dark,
          opacity: .75, textAlign: "center", maxWidth: 440, lineHeight: 1.75,
        }}>
          {formData.presenza
            ? "Non vediamo l'ora di festeggiare con te il 2 ottobre!"
            : "Ci mancherai! Grazie per averci fatto sapere. 🤍"
          }
        </p>
        <div style={{ height: 1, width: 80, background: C.gold, opacity: .4, margin: "28px 0" }} />
        <Link to="/" style={{
          fontFamily: FONTS.body, fontSize: 12, letterSpacing: ".18em",
          textTransform: "uppercase", color: C.olive, textDecoration: "none",
          borderBottom: `1px solid ${C.olive}44`, paddingBottom: 2,
        }}>
          ← Torna alla home
        </Link>
      </div>
    );
  }

  /* ═══════ MAIN RENDER ═══════ */
  return (
    <div style={{ background: C.cream, minHeight: "100vh", fontFamily: FONTS.body, color: C.dark, paddingBottom: 80 }}>
      <style>{`
        .rsvp-input:focus, .rsvp-textarea:focus {
          border-color: #3D5A3E !important;
          box-shadow: 0 0 0 2px rgba(61,90,62,.12);
        }
        .rsvp-navbtn:hover { opacity: .82; }
        .rsvp-presence-card { transition: all .25s; cursor: pointer; }
        .rsvp-presence-card:hover { transform: translateY(-2px); }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 110, paddingBottom: 48, textAlign: "center", padding: "110px 24px 48px" }}>
        <CirclePhoto up={heroPhotoUp} C={C} />
        <h1 style={{
          fontFamily: FONTS.script, fontSize: "clamp(2.4rem,6vw,4.2rem)",
          color: C.olive, lineHeight: 1.1, marginBottom: 12,
        }}>
          Conferma la tua Presenza
        </h1>
        <p style={{
          fontFamily: FONTS.body, fontStyle: "italic",
          fontSize: "clamp(1rem,2.2vw,1.2rem)", color: C.rose, letterSpacing: ".05em",
        }}>
          Rispondi entro il {siteData.scadenzaRsvp}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginTop: 28 }}>
          <div style={{ height: 1, width: 50, background: C.gold, opacity: .4 }} />
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <circle cx="5" cy="5" r="3" fill={C.gold} opacity=".6"/>
          </svg>
          <div style={{ height: 1, width: 50, background: C.gold, opacity: .4 }} />
        </div>
      </section>

      {/* ── FORM ── */}
      <section style={{ maxWidth: 620, margin: "0 auto", padding: "0 24px" }}>
        <ProgressBar step={step} presenza={formData.presenza} C={C} />

        {/* ════ STEP 1 ════ */}
        {step === 1 && (
          <div>
            <Field label="Nome" required error={errors.nome} C={C} fieldRef={nomeRef}>
              <input
                className="rsvp-input"
                value={formData.nome}
                onChange={e => { set("nome", e.target.value); setErrors(p => ({ ...p, nome: null })); }}
                placeholder="Maria Cristina"
                style={inputBase(C, !!errors.nome)}
              />
            </Field>

            <Field label="Cognome" required error={errors.cognome} C={C} fieldRef={cognomeRef}>
              <input
                className="rsvp-input"
                value={formData.cognome}
                onChange={e => { set("cognome", e.target.value); setErrors(p => ({ ...p, cognome: null })); }}
                placeholder="Rossi"
                style={inputBase(C, !!errors.cognome)}
              />
            </Field>

            {/* SI / NO cards */}
            <div ref={presenzaRef} style={{ marginBottom: 22 }}>
              <p style={{
                fontFamily: FONTS.body, fontSize: 12, letterSpacing: ".12em",
                textTransform: "uppercase", color: C.olive, marginBottom: 12, opacity: .8,
              }}>
                Sarai con noi? <span style={{ color: C.rose }}> *</span>
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {/* YES */}
                <div className="rsvp-presence-card" onClick={() => { set("presenza", true); setErrors(p => ({ ...p, presenza: null })); }}
                  style={{
                    borderRadius: 10, padding: "24px 16px", textAlign: "center",
                    border: `1.5px solid ${formData.presenza === true ? C.olive : C.olive + "2A"}`,
                    background: formData.presenza === true ? C.olive + "12" : C.card,
                    boxShadow: formData.presenza === true ? `0 4px 18px ${C.olive}18` : "none",
                  }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>✓</div>
                  <p style={{
                    fontFamily: FONTS.serif, fontSize: 16, color: formData.presenza === true ? C.olive : C.dark,
                    fontWeight: 400, lineHeight: 1.3,
                  }}>
                    Sarò presente!
                  </p>
                </div>
                {/* NO */}
                <div className="rsvp-presence-card" onClick={() => { set("presenza", false); setErrors(p => ({ ...p, presenza: null })); }}
                  style={{
                    borderRadius: 10, padding: "24px 16px", textAlign: "center",
                    border: `1.5px solid ${formData.presenza === false ? C.rose : C.olive + "2A"}`,
                    background: formData.presenza === false ? C.rose + "10" : C.card,
                    boxShadow: formData.presenza === false ? `0 4px 18px ${C.rose}16` : "none",
                  }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>✗</div>
                  <p style={{
                    fontFamily: FONTS.serif, fontSize: 16, color: formData.presenza === false ? C.rose : C.dark,
                    fontWeight: 400, lineHeight: 1.3,
                  }}>
                    Non potrò esserci
                  </p>
                </div>
              </div>
              {errors.presenza && (
                <p style={{ fontFamily: FONTS.body, fontStyle: "italic", fontSize: 12.5, color: C.rose, marginTop: 8 }}>
                  {errors.presenza}
                </p>
              )}
            </div>

            {/* Stepper persone — solo se presenza = SI */}
            {formData.presenza === true && (
              <div style={{ marginBottom: 22 }}>
                <p style={{
                  fontFamily: FONTS.body, fontSize: 12, letterSpacing: ".12em",
                  textTransform: "uppercase", color: C.olive, marginBottom: 12, opacity: .8,
                }}>
                  Numero di Persone
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <button type="button" onClick={() => setNPersone(-1)} disabled={formData.nPersone <= 1}
                    style={{
                      width: 38, height: 38, borderRadius: "50%", border: `1.5px solid ${C.olive}`,
                      background: "transparent", cursor: formData.nPersone <= 1 ? "not-allowed" : "pointer",
                      fontSize: 20, color: C.olive, display: "flex", alignItems: "center",
                      justifyContent: "center", opacity: formData.nPersone <= 1 ? .3 : 1,
                      transition: "opacity .2s",
                    }}>−</button>
                  <div style={{ textAlign: "center", minWidth: 60 }}>
                    <span style={{ fontFamily: FONTS.serif, fontSize: 36, color: C.olive, fontWeight: 700, lineHeight: 1 }}>
                      {formData.nPersone}
                    </span>
                    <p style={{ fontFamily: FONTS.body, fontSize: 11, color: C.dark, opacity: .45, marginTop: 3, letterSpacing: ".1em", textTransform: "uppercase" }}>
                      {formData.nPersone === 1 ? "Solo tu" : `tu + ${formData.nPersone - 1}`}
                    </p>
                  </div>
                  <button type="button" onClick={() => setNPersone(+1)} disabled={formData.nPersone >= MAX_PERSONE}
                    style={{
                      width: 38, height: 38, borderRadius: "50%", border: `1.5px solid ${C.olive}`,
                      background: "transparent", cursor: formData.nPersone >= MAX_PERSONE ? "not-allowed" : "pointer",
                      fontSize: 20, color: C.olive, display: "flex", alignItems: "center",
                      justifyContent: "center", opacity: formData.nPersone >= MAX_PERSONE ? .3 : 1,
                      transition: "opacity .2s",
                    }}>+</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ STEP 2 ════ */}
        {step === 2 && (
          <div>
            {(formData.persone ?? [EMPTY_PERSONA()]).map((persona, idx) => {
              const isMain = idx === 0;
              const nomeDisplay = isMain
                ? `${formData.nome} ${formData.cognome}`.trim()
                : persona.nome || `Accompagnatore ${idx}`;
              return (
                <div key={idx} style={{
                  marginBottom: 40, paddingBottom: 32,
                  borderBottom: idx < formData.persone.length - 1 ? `1px solid ${C.olive}18` : "none",
                }}>
                  {/* Intestazione persona */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.olive + "18", border: `1px solid ${C.olive}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontFamily: FONTS.serif, fontSize: 13, color: C.olive }}>{idx + 1}</span>
                    </div>
                    <h3 style={{ fontFamily: FONTS.serif, fontSize: 19, fontWeight: 400, color: C.olive, fontStyle: "italic" }}>
                      {isMain ? "Il tuo menu" : `Menu di ${nomeDisplay}`}
                    </h3>
                  </div>

                  {/* Nome accompagnatore */}
                  {!isMain && (
                    <Field label="Nome accompagnatore" C={C}>
                      <input
                        className="rsvp-input"
                        value={persona.nome}
                        onChange={e => setPersona(idx, "nome", e.target.value)}
                        placeholder="Nome e Cognome"
                        style={inputBase(C, false)}
                      />
                    </Field>
                  )}

                  {/* Note menu */}
                  <Field label="Note sul menu o preferenze" C={C}>
                    <textarea
                      className="rsvp-textarea"
                      value={persona.note}
                      onChange={e => setPersona(idx, "note", e.target.value)}
                      placeholder="Es: preferisco il pesce, senza cipolla..."
                      rows={3}
                      style={{ ...inputBase(C, false), resize: "vertical", lineHeight: 1.65 }}
                    />
                  </Field>

                  {/* Allergie */}
                  <div>
                    <p style={{ fontFamily: FONTS.body, fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", color: C.olive, marginBottom: 10, opacity: .8 }}>
                      Allergie &amp; Intolleranze
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                      {ALLERGIE_LIST.map(({ key, label, emoji }) => (
                        <CustomCheckbox
                          key={key}
                          checked={(persona.allergie ?? []).includes(key)}
                          onChange={() => toggleAllergia(idx, key)}
                          label={label} emoji={emoji} C={C}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ════ STEP 3 ════ */}
        {step === 3 && (
          <div>
            <p style={{ fontFamily: FONTS.body, fontStyle: "italic", fontSize: 17, color: C.dark, opacity: .65, lineHeight: 1.75, marginBottom: 24, textAlign: "center" }}>
              Un pensiero per Maria Cristina e Flavio
            </p>
            <Field label="Il tuo messaggio" C={C}>
              <textarea
                className="rsvp-textarea"
                value={formData.messaggio}
                onChange={e => set("messaggio", e.target.value)}
                placeholder="Un pensiero, un augurio, una richiesta musicale..."
                rows={7}
                style={{ ...inputBase(C, false), resize: "vertical", lineHeight: 1.8, fontSize: 17 }}
              />
            </Field>
          </div>
        )}

        {/* ── Separatore elegante tra form e nav ── */}
        <div style={{ height: 1, background: C.gold, opacity: .2, margin: "32px 0 28px" }} />

        {/* ── Errore invio webhook ── */}
        {sendError && (
          <div style={{
            marginBottom: 18, padding: "12px 16px", borderRadius: 6,
            background: "#FDF2F4", border: `1px solid ${C.rose}44`,
            display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
            <div>
              <p style={{ fontFamily: FONTS.body, fontSize: 13.5, color: C.rose, lineHeight: 1.6, margin: 0 }}>
                {sendError}
              </p>
              <button
                onClick={() => setSendError("")}
                style={{ fontFamily: FONTS.body, fontSize: 11, color: C.rose, background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 4, letterSpacing: ".06em", textTransform: "uppercase", opacity: .7 }}>
                Chiudi
              </button>
            </div>
          </div>
        )}

        {/* ── Navigazione ── */}
        <div style={{ display: "flex", justifyContent: step > 1 ? "space-between" : "flex-end", alignItems: "center" }}>
          {step > 1 && (
            <button type="button" className="rsvp-navbtn" onClick={prevStep} style={navBtn(false)}>
              ← Indietro
            </button>
          )}

          {step < 3
            ? <button type="button" className="rsvp-navbtn" onClick={nextStep} style={navBtn(true)}>
                Avanti →
              </button>
            : <button
                type="button"
                className="rsvp-navbtn"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  ...navBtn(true),
                  opacity: loading ? .65 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}>
                {loading
                  ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ display: "inline-block", width: 12, height: 12, border: `2px solid ${C.cream}`, borderTopColor: "transparent", borderRadius: "50%", animation: "rsvp-spin 0.7s linear infinite" }} />
                      Invio in corso…
                    </span>
                  : "Invia la tua risposta →"
                }
              </button>
          }
        </div>

        {/* ── Spinner keyframe ── */}
        <style>{`@keyframes rsvp-spin { to { transform: rotate(360deg); } }`}</style>
      </section>
    </div>
  );
}
