import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ref, onValue, update, set } from "firebase/database";
import { db, CONFIGURED } from "../firebase";

/* ── Default palette ─────────────────────────────────────── */
const DEFAULT_PALETTE = {
  cream: "#F5F0E8", olive: "#3D5A3E", gold: "#C9A84C",
  rose:  "#D4849A", dark:  "#1C1C1C", card: "#FAF7F0",
};

/* ── Default graphics visibility ─────────────────────────── */
const DEFAULT_GRAPHICS = {
  home: {
    olSx:      { vis: true }, olDx:       { vis: true },
    grape:     { vis: true }, wineHero:   { vis: true },
    cake:      { vis: true }, cocktail:   { vis: true },
    rings:     { vis: true }, moon:       { vis: true },
    dividers:  { vis: true }, couplePhoto:{ vis: true },
    churchCard:{ vis: true }, wineCard:   { vis: true }, rsvpCard: { vis: true },
    countdownSection: { vis: true }, infoSection: { vis: true },
  },
  programma: {
    chiesa: { vis: true }, cocktail: { vis: true },
    piatto: { vis: true }, cuore:    { vis: true },
    torta:  { vis: true }, note:     { vis: true },
    disco:  { vis: true }, luna:     { vis: true },
    vineLine:    { vis: true },
    heroImg:     { vis: true },
    polaroidImg: { vis: true },
  },
  faq: {
    frecce:       { vis: true },
    decorazioni:  { vis: true },
    sidePhoto:    { vis: true },
  },
  rsvp: {
    calici:      { vis: true },
    decorazioni: { vis: true },
    heroCircle:  { vis: true },
  },
  regalo: {
    olSx:     { vis: true },
    olDx:     { vis: true },
    rings:    { vis: true },
    dividers: { vis: true },
  },
};

/* ── Menu visibility ─────────────────────────────────────── */
const DEFAULT_MENU_VIS = {
  "Home": true, "Programma": true, "RSVP": true,
  "FAQ": true,  "Non posso aspettare": true, "Il Regalo più grande": true, "Admin": false,
};

/* ── Site-wide defaults ──────────────────────────────────── */
const SITE_DEFAULTS = {
  nomi:               "Maria Cristina & Flavio",
  data:               "2 Ottobre 2026",
  scadenzaRsvp:       "30 luglio 2026",
  oraCerimonia:       "15:00",
  luogoCerimonia:     "Chiesa di Santa Francesca Romana",
  indirizzoCerimonia: "Piazza di Santa Francesca Romana, Roma",
  mapsCerimonia:      "https://maps.google.com/?q=Chiesa+Santa+Francesca+Romana+Roma",
  luogoRicevimento:   "Casale Campovecchio",
  indirizzoRicevimento:"Via di Campo Vecchio 16, Grottaferrata",
  mapsRicevimento:    "https://maps.google.com/?q=Via+di+Campo+Vecchio+16+Grottaferrata",
  webhookUrl:         "",
  ordineMenu: ["Home", "Programma", "RSVP", "FAQ", "Non posso aspettare", "Il Regalo più grande"],
  menuVisibility: DEFAULT_MENU_VIS,
  programmaEventi: [
    { ora: "15:00", titolo: "Cerimonia",          desc: "Chiesa di Santa Francesca Romana", icona: "chiesa"   },
    { ora: "16:00", titolo: "Aperitivo & Foto",   desc: "Casale Campovecchio",              icona: "cocktail" },
    { ora: "19:00", titolo: "Cena",               desc: "Sala del ricevimento",             icona: "piatto"   },
    { ora: "19:15", titolo: "Discorsi",           desc: "Parole dal cuore",                 icona: "cuore"    },
    { ora: "21:20", titolo: "Taglio della Torta", desc: "Il momento più dolce",             icona: "torta"    },
    { ora: "21:40", titolo: "Primo Ballo",        desc: "La pista è aperta",                icona: "note"     },
    { ora: "21:45", titolo: "Si Festeggia!",      desc: "Che la festa abbia inizio",        icona: "disco"    },
    { ora: "01:00", titolo: "Buonanotte",         desc: "A domani ✨",                      icona: "luna"     },
  ],
  faqItems: [
    { q: "C'è un dress code?",
      r: "Sì, elegante. Vi chiediamo gentilmente di evitare il bianco e i colori che potrebbero confondersi con quello della sposa." },
    { q: "Posso portare i bambini?",
      r: "I bambini sono benvenutissimi! Fateci sapere nell'RSVP così possiamo organizzarci al meglio." },
    { q: "Come raggiungo il Casale Campovecchio?",
      r: "In auto: segui le indicazioni per Grottaferrata, Via di Campo Vecchio 16. Parcheggio gratuito disponibile. Organizzeremo un servizio navetta da Roma — dettagli a seguire." },
    { q: "Entro quando devo confermare la presenza?",
      r: "Ti chiediamo di confermare entro il {scadenzaRsvp}. Prima rispondi, meglio è!" },
    { q: "C'è un parcheggio?",
      r: "Sì, ampio parcheggio gratuito direttamente in loco." },
    { q: "Ci sarà un servizio navetta?",
      r: "Stiamo organizzando un servizio navetta da Roma. Troverai tutti i dettagli aggiornati in questa pagina." },
    { q: "Posso fare richieste per il menu?",
      r: "Assolutamente sì! Puoi indicare intolleranze e preferenze alimentari direttamente nel form RSVP." },
  ],
  regaloFrase:       "Il vostro regalo più grande è la vostra presenza al nostro fianco. Se desiderate farci un pensiero, potete contribuire al nostro viaggio di nozze.",
  regaloIban:        "IT00 X000 0000 0000 0000 0000 000",
  regaloIntestatario:"Maria Cristina e Flavio",
  palette:  DEFAULT_PALETTE,
  graphics: DEFAULT_GRAPHICS,
  media:    {},
};

export { SITE_DEFAULTS };

/* ── Deep merge: overlay Firebase data onto defaults ─────── */
function deepMerge(defaults, overrides) {
  if (!overrides || typeof overrides !== "object") return defaults;
  const out = { ...defaults };
  for (const k of Object.keys(overrides)) {
    if (
      overrides[k] !== null &&
      typeof overrides[k] === "object" &&
      !Array.isArray(overrides[k]) &&
      typeof defaults[k] === "object" &&
      defaults[k] !== null &&
      !Array.isArray(defaults[k])
    ) {
      out[k] = deepMerge(defaults[k], overrides[k]);
    } else {
      out[k] = overrides[k];
    }
  }
  return out;
}

/* ── localStorage fallback helpers ──────────────────────── */
const LS_KEY = "wc_site_data";
function lsLoad() {
  try { const s = localStorage.getItem(LS_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
}
function lsSave(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch {}
}

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [siteData, setSiteDataRaw] = useState(() => {
    const cached = lsLoad();
    return cached ? deepMerge(SITE_DEFAULTS, cached) : { ...SITE_DEFAULTS };
  });
  const [firebaseReady, setFirebaseReady] = useState(!CONFIGURED);

  /* ── Subscribe to Firebase on mount ─────────────────────── */
  useEffect(() => {
    if (!CONFIGURED) return;
    const unsubscribe = onValue(ref(db, "siteData"), (snap) => {
      const remote = snap.val();
      const merged = remote ? deepMerge(SITE_DEFAULTS, remote) : { ...SITE_DEFAULTS };
      setSiteDataRaw(merged);
      lsSave(merged);
      setFirebaseReady(true);
    }, (err) => {
      console.warn("Firebase read error, using cache:", err.message);
      setFirebaseReady(true);
    });
    return unsubscribe;
  }, []);

  /* ── Write helpers ───────────────────────────────────────── */
  const updateSite = useCallback((key, value) => {
    setSiteDataRaw(prev => {
      const next = { ...prev, [key]: value };
      lsSave(next);
      if (CONFIGURED) update(ref(db, "siteData"), { [key]: value });
      return next;
    });
  }, []);

  const updateGraphic = useCallback((page, key, patch) => {
    setSiteDataRaw(prev => {
      const next = {
        ...prev,
        graphics: {
          ...prev.graphics,
          [page]: {
            ...prev.graphics?.[page],
            [key]: { ...(prev.graphics?.[page]?.[key] ?? { vis: true }), ...patch },
          },
        },
      };
      lsSave(next);
      if (CONFIGURED) {
        update(ref(db, `siteData/graphics/${page}`), {
          [key]: { ...(prev.graphics?.[page]?.[key] ?? { vis: true }), ...patch },
        });
      }
      return next;
    });
  }, []);

  const updateMedia = useCallback((storageKey, url) => {
    setSiteDataRaw(prev => {
      const next = { ...prev, media: { ...prev.media, [storageKey]: url } };
      lsSave(next);
      if (CONFIGURED) update(ref(db, "siteData/media"), { [storageKey]: url });
      return next;
    });
  }, []);

  const setSiteData = useCallback((updater) => {
    setSiteDataRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      lsSave(next);
      if (CONFIGURED) set(ref(db, "siteData"), next);
      return next;
    });
  }, []);

  return (
    <SiteContext.Provider value={{
      siteData, setSiteData, updateSite, updateGraphic, updateMedia, firebaseReady,
    }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside SiteProvider");
  return ctx;
}
