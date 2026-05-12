import { createContext, useContext } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

/* ── Default palette (mirrors designSystem.js COLORS) ────── */
const DEFAULT_PALETTE = {
  cream: "#F5F0E8", olive: "#3D5A3E", gold: "#C9A84C",
  rose:  "#D4849A", dark:  "#1C1C1C", card: "#FAF7F0",
};

/* ── Default graphics visibility per page ─────────────────── */
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
};

/* ── Menu visibility (all visible by default) ─────────────── */
const DEFAULT_MENU_VIS = {
  "Home": true, "Programma": true, "RSVP": true,
  "FAQ": true,  "Non posso aspettare": true, "Admin": false,
};

/* ── Site-wide defaults ───────────────────────────────────── */
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
  ordineMenu: ["Home", "Programma", "RSVP", "FAQ", "Non posso aspettare"],
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
  palette:  DEFAULT_PALETTE,
  graphics: DEFAULT_GRAPHICS,
};

export { SITE_DEFAULTS };

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [siteData, setSiteData] = useLocalStorage("wc_site_data", SITE_DEFAULTS);

  const updateSite = (key, value) =>
    setSiteData(prev => ({ ...prev, [key]: value }));

  /** Update a single graphics visibility entry */
  const updateGraphic = (page, key, patch) =>
    setSiteData(prev => ({
      ...prev,
      graphics: {
        ...prev.graphics,
        [page]: {
          ...prev.graphics?.[page],
          [key]: { ...(prev.graphics?.[page]?.[key] ?? { vis: true }), ...patch },
        },
      },
    }));

  return (
    <SiteContext.Provider value={{ siteData, setSiteData, updateSite, updateGraphic }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside SiteProvider");
  return ctx;
}
