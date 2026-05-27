import { useState, useRef, useEffect, useCallback } from "react";
import {
  OliveB, Grape, BotDiv, Wine, Cake, Rings, Moon, Cocktail, Church, HeartSVG,
} from "../designSystem.jsx";
import { useSite } from "../context/SiteContext";
import { SITE_DEFAULTS } from "../context/SiteContext";
import { db, auth, CONFIGURED } from "../firebase";
import { ref, onValue } from "firebase/database";
import { signInAnonymously, signOut } from "firebase/auth";
import { uploadMedia, deleteMedia, isGithubConfigured } from "../services/githubApi";

/* ═══════════════════════════════════════════════════════════
   ADMIN DESIGN TOKENS  (no wedding fonts/colors)
   ═══════════════════════════════════════════════════════════ */
const A = {
  bg:          "#F5F5F5",
  card:        "#FFFFFF",
  border:      "#E5E7EB",
  accent:      "#3D5A3E",
  accentLight: "#EEF3EE",
  accentDim:   "#3D5A3E22",
  text:        "#111827",
  muted:       "#6B7280",
  danger:      "#D4849A",
  dangerLight: "#FDF2F4",
  success:     "#22C55E",
  warn:        "#F59E0B",
  ff:          "Inter, system-ui, -apple-system, sans-serif",
  sidebar:     220,
  header:      52,
  r:           6,
};

const ADMIN_CREDS = { user: "admin", pwd: "matrimonio2026" };

/* ═══════════════════════════════════════════════════════════
   SHARED MICRO-COMPONENTS
   ═══════════════════════════════════════════════════════════ */
const card   = (extra = {}) => ({ background: A.card, border: `1px solid ${A.border}`, borderRadius: A.r, padding: 20, ...extra });
const label  = (extra = {}) => ({ fontFamily: A.ff, fontSize: 11, fontWeight: 600, letterSpacing: ".07em", textTransform: "uppercase", color: A.muted, marginBottom: 5, display: "block", ...extra });
const inp    = (extra = {}) => ({ width: "100%", fontFamily: A.ff, fontSize: 14, color: A.text, background: "#FAFAFA", border: `1px solid ${A.border}`, borderRadius: 4, padding: "8px 10px", outline: "none", boxSizing: "border-box", ...extra });
const btn    = (v = "primary", extra = {}) => ({
  fontFamily: A.ff, fontSize: 12, fontWeight: 600, letterSpacing: ".04em",
  padding: "7px 16px", borderRadius: 4, cursor: "pointer",
  background: v === "primary" ? A.accent : v === "danger" ? A.danger : v === "ghost" ? "transparent" : A.card,
  color:      v === "primary" ? "#fff"   : v === "danger" ? "#fff"   : v === "ghost" ? A.muted        : A.text,
  border:     v === "outline" || v === "ghost" ? `1px solid ${A.border}` : "none",
  ...extra,
});

function AToggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 36, height: 20, borderRadius: 10, border: "none",
      background: on ? A.accent : "#D1D5DB",
      position: "relative", cursor: "pointer", flexShrink: 0, padding: 0,
      transition: "background .2s",
    }}>
      <span style={{
        position: "absolute", top: 3, left: on ? 19 : 3,
        width: 14, height: 14, borderRadius: "50%", background: "#fff",
        transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)",
      }} />
    </button>
  );
}

function ABadge({ color = A.accent, children }) {
  return (
    <span style={{ fontFamily: A.ff, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12, background: color + "1A", color }}>
      {children}
    </span>
  );
}

function AdminSectionCard({ title, children }) {
  return (
    <div style={card({ marginBottom: 24 })}>
      <h2 style={{ fontFamily: A.ff, fontSize: 16, fontWeight: 700, color: A.text, marginBottom: 18, paddingBottom: 12, borderBottom: `1px solid ${A.border}` }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function AField({ label: lbl, children, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={label()}>{lbl}</label>
      {children}
      {hint && <p style={{ fontFamily: A.ff, fontSize: 11, color: A.muted, marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

function AInput({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type} value={value ?? ""} onChange={onChange}
      placeholder={placeholder}
      style={inp()}
      onFocus={e => e.target.style.borderColor = A.accent}
      onBlur={e => e.target.style.borderColor = A.border}
    />
  );
}

function ATextarea({ value, onChange, rows = 3 }) {
  return (
    <textarea value={value ?? ""} onChange={onChange} rows={rows}
      style={{ ...inp(), resize: "vertical", lineHeight: 1.55 }}
      onFocus={e => e.target.style.borderColor = A.accent}
      onBlur={e => e.target.style.borderColor = A.border}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   DRAG-AND-DROP LIST (HTML5 API, no libraries)
   ═══════════════════════════════════════════════════════════ */
function DraggableList({ items, onReorder, renderRow }) {
  const [dragIdx, setDragIdx]  = useState(null);
  const [overIdx, setOverIdx]  = useState(null);

  const onDrop = (e, i) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) { setDragIdx(null); setOverIdx(null); return; }
    const arr = [...items];
    const [moved] = arr.splice(dragIdx, 1);
    arr.splice(i, 0, moved);
    onReorder(arr);
    setDragIdx(null); setOverIdx(null);
  };

  return (
    <div>
      {items.map((item, i) => (
        <div
          key={i}
          draggable
          onDragStart={() => setDragIdx(i)}
          onDragOver={e => { e.preventDefault(); setOverIdx(i); }}
          onDrop={e => onDrop(e, i)}
          onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
          style={{
            opacity: dragIdx === i ? 0.35 : 1,
            borderTop: overIdx === i && dragIdx !== i ? `2px solid ${A.accent}` : "2px solid transparent",
            transition: "opacity .15s",
          }}
        >
          {renderRow(item, i)}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PHOTO UPLOAD SLOT (Firebase Storage or base64 fallback)
   Optional visibility toggle via siteData.graphics
   ═══════════════════════════════════════════════════════════ */
function PhotoSlotAdmin({ label: lbl, storageKey, page, itemKey, siteData, updateGraphic }) {
  const { updateMedia } = useSite();
  const [uploading, setUploading] = useState(false);
  const url = siteData?.media?.[storageKey] || null;
  const fileRef = useRef();

  const handleFile = async e => {
    const file = e.target.files?.[0]; if (!file) return;
    e.target.value = "";
    setUploading(true);
    try {
      if (isGithubConfigured()) {
        const dlUrl = await uploadMedia(storageKey, file);
        updateMedia(storageKey, dlUrl);
      } else {
        /* Fallback: base64 in localStorage when GitHub not configured */
        await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = ev => {
            try { localStorage.setItem(`media_${storageKey}`, ev.target.result); } catch { alert("Storage pieno: immagine troppo grande."); }
            updateMedia(storageKey, ev.target.result);
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
    } catch (err) {
      alert("Errore upload: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const remove = async () => {
    if (isGithubConfigured()) {
      try { await deleteMedia(storageKey); } catch {}
    } else {
      localStorage.removeItem(`media_${storageKey}`);
    }
    updateMedia(storageKey, null);
  };

  /* Optional visibility toggle */
  const hasVis = page && itemKey && siteData && updateGraphic;
  const visEntry = hasVis ? (siteData.graphics?.[page]?.[itemKey] ?? { vis: true }) : null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${A.border}` }}>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      <div style={{ width: 60, height: 60, borderRadius: 4, overflow: "hidden", background: "#F3F4F6", border: `1px solid ${A.border}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {url ? <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 22, opacity: .4 }}>📷</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: A.ff, fontSize: 13, fontWeight: 500, color: hasVis && visEntry?.vis === false ? A.muted : A.text, marginBottom: 2, textDecoration: hasVis && visEntry?.vis === false ? "line-through" : "none" }}>{lbl}</p>
        {uploading && <p style={{ fontFamily: A.ff, fontSize: 11, color: A.warn }}>⏳ Caricamento…</p>}
        {!uploading && url && <p style={{ fontFamily: A.ff, fontSize: 11, color: A.success }}>✓ Immagine caricata</p>}
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={btn("outline", { fontSize: 11 })}>{url ? "Cambia" : "Carica"}</button>
        {url && <button onClick={remove} style={btn("danger", { fontSize: 11 })}>Rimuovi</button>}
        {hasVis && (
          <AToggle
            on={visEntry?.vis !== false}
            onChange={v => updateGraphic(page, itemKey, { vis: v })}
          />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SVG VISIBILITY ROW
   ═══════════════════════════════════════════════════════════ */
function SvgVisRow({ label: lbl, page, itemKey, previewEl, siteData, updateGraphic }) {
  const { updateMedia } = useSite();
  const entry = siteData.graphics?.[page]?.[itemKey] ?? { vis: true };
  const svgKey = `graphic_${page}_${itemKey}`;
  const customUrl = siteData.media?.[svgKey] || null;
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleFile = async e => {
    const file = e.target.files?.[0]; if (!file) return;
    e.target.value = "";
    setUploading(true);
    try {
      if (isGithubConfigured()) {
        const url = await uploadMedia(svgKey, file);
        updateMedia(svgKey, url);
      } else {
        await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = ev => {
            try { localStorage.setItem(svgKey, ev.target.result); } catch { alert("Storage pieno."); }
            updateMedia(svgKey, ev.target.result);
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
      updateGraphic(page, itemKey, { hasCustom: true });
    } catch (err) { alert("Errore upload: " + err.message); }
    finally { setUploading(false); }
  };

  const restore = async () => {
    if (isGithubConfigured()) {
      try { await deleteMedia(svgKey); } catch {}
    } else { localStorage.removeItem(svgKey); }
    updateMedia(svgKey, null);
    updateGraphic(page, itemKey, { hasCustom: false });
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${A.border}` }}>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      {/* Preview */}
      <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 4, background: "#F5F0E8", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {customUrl
          ? <img src={customUrl} alt="" style={{ width: 44, height: 44, objectFit: "cover" }} />
          : <div style={{ transform: "scale(0.42)", transformOrigin: "center", display: "flex", alignItems: "center", justifyContent: "center" }}>{previewEl}</div>
        }
      </div>
      <span style={{ flex: 1, fontFamily: A.ff, fontSize: 13, color: entry.vis ? A.text : A.muted, textDecoration: entry.vis ? "none" : "line-through" }}>{lbl}</span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button onClick={() => fileRef.current?.click()} disabled={uploading} style={btn("outline", { fontSize: 11 })}>{uploading ? "⏳" : "Sostituisci"}</button>
        {customUrl && <button onClick={restore} style={btn("ghost", { fontSize: 11 })}>↺ Orig</button>}
        <AToggle on={entry.vis} onChange={v => updateGraphic(page, itemKey, { vis: v })} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ACCORDION (for Grafici section)
   ═══════════════════════════════════════════════════════════ */
function AccordionBlock({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: `1px solid ${A.border}`, borderRadius: A.r, marginBottom: 10, overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", padding: "12px 16px", fontFamily: A.ff, fontSize: 13, fontWeight: 600, color: A.text, background: open ? A.accentLight : "#FAFAFA", border: "none", cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>▸ {title}</span>
        <span style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .2s", opacity: .5 }}>▸</span>
      </button>
      {open && <div style={{ padding: "4px 16px 12px" }}>{children}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ICON MAP for event/section labels
   ═══════════════════════════════════════════════════════════ */
const ICONA_OPTIONS = [
  { k: "chiesa",   e: "⛪", l: "Cerimonia" },
  { k: "cocktail", e: "🍹", l: "Cocktail"  },
  { k: "piatto",   e: "🍽️", l: "Cena"     },
  { k: "cuore",    e: "💌", l: "Discorsi"  },
  { k: "torta",    e: "🎂", l: "Torta"     },
  { k: "note",     e: "🎵", l: "Musica"    },
  { k: "disco",    e: "🪩", l: "Festa"     },
  { k: "luna",     e: "🌙", l: "Luna"      },
];
const iconaEmoji = k => ICONA_OPTIONS.find(o => o.k === k)?.e ?? "•";

/* ═══════════════════════════════════════════════════════════
   SECTION 1 — TESTI DEL SITO
   ═══════════════════════════════════════════════════════════ */
function SecTesti({ siteData, updateSite }) {
  const [local, setLocal] = useState({ ...siteData });
  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }));

  const save = () => {
    const keys = ["nomi","data","scadenzaRsvp","oraCerimonia","luogoCerimonia","indirizzoCerimonia","mapsCerimonia","luogoRicevimento","indirizzoRicevimento","mapsRicevimento"];
    keys.forEach(k => updateSite(k, local[k]));
    alert("Salvato! Le modifiche sono visibili immediatamente nel sito.");
  };

  const rows = [
    { k: "nomi",               l: "Nomi sposi" },
    { k: "data",               l: "Data matrimonio" },
    { k: "scadenzaRsvp",       l: "Scadenza RSVP" },
    { k: "oraCerimonia",       l: "Orario cerimonia" },
    { k: "luogoCerimonia",     l: "Luogo cerimonia" },
    { k: "indirizzoCerimonia", l: "Indirizzo cerimonia" },
    { k: "mapsCerimonia",      l: "Link Google Maps cerimonia" },
    { k: "luogoRicevimento",   l: "Luogo ricevimento" },
    { k: "indirizzoRicevimento",l: "Indirizzo ricevimento" },
    { k: "mapsRicevimento",    l: "Link Google Maps ricevimento" },
  ];

  return (
    <AdminSectionCard title="📝 Testi del Sito">
      <p style={{ fontFamily: A.ff, fontSize: 12, color: A.accent, marginBottom: 16, padding: "8px 12px", background: A.accentLight, borderRadius: 4 }}>
        ✓ Le modifiche sono visibili immediatamente nel sito senza riavvio.
      </p>
      {rows.map(({ k, l }) => (
        <AField key={k} label={l}>
          <AInput value={local[k]} onChange={e => set(k, e.target.value)} />
        </AField>
      ))}
      <button onClick={save} style={btn("primary")}>Salva modifiche</button>
    </AdminSectionCard>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 2 — PROGRAMMA (drag-drop + edit + add)
   ═══════════════════════════════════════════════════════════ */
function SecProgramma({ siteData, updateSite }) {
  const [items, setItems]   = useState([...siteData.programmaEventi]);
  const [editIdx, setEditIdx] = useState(null);
  const [editBuf, setEditBuf] = useState({});
  const [addBuf, setAddBuf]   = useState({ ora: "", titolo: "", desc: "", icona: "chiesa" });
  const [saved, setSaved]     = useState(false);

  const save = (arr = items) => {
    updateSite("programmaEventi", arr);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const del = i => { const a = items.filter((_, j) => j !== i); setItems(a); save(a); };

  const startEdit = i => { setEditIdx(i); setEditBuf({ ...items[i] }); };
  const commitEdit = () => {
    const a = items.map((it, i) => i === editIdx ? editBuf : it);
    setItems(a); setEditIdx(null); save(a);
  };

  const addItem = () => {
    if (!addBuf.titolo.trim()) return;
    const a = [...items, { ...addBuf }];
    setItems(a); setAddBuf({ ora: "", titolo: "", desc: "", icona: "chiesa" }); save(a);
  };

  const reorder = arr => { setItems(arr); save(arr); };

  return (
    <AdminSectionCard title="🗓️ Programma">
      {saved && <p style={{ fontFamily: A.ff, fontSize: 12, color: A.success, marginBottom: 12 }}>✓ Salvato</p>}
      <DraggableList
        items={items}
        onReorder={reorder}
        renderRow={(item, i) => (
          <div key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${A.border}` }}>
              <span style={{ cursor: "grab", color: A.muted, fontSize: 16, userSelect: "none" }}>⠿</span>
              <span style={{ fontFamily: A.ff, fontSize: 13, fontWeight: 600, color: A.accent, minWidth: 44 }}>{item.ora}</span>
              <span style={{ fontSize: 18 }}>{iconaEmoji(item.icona)}</span>
              <span style={{ flex: 1, fontFamily: A.ff, fontSize: 13, color: A.text }}>{item.titolo}</span>
              <button onClick={() => startEdit(i)} style={btn("ghost", { fontSize: 11 })}>✏️</button>
              <button onClick={() => del(i)}       style={btn("danger", { fontSize: 11 })}>🗑️</button>
            </div>
            {editIdx === i && (
              <div style={{ background: "#F9FAFB", border: `1px solid ${A.border}`, borderRadius: 4, padding: 14, margin: "6px 0" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10, marginBottom: 10 }}>
                  <AField label="Ora"><AInput value={editBuf.ora}    onChange={e => setEditBuf(p => ({ ...p, ora: e.target.value }))} /></AField>
                  <AField label="Titolo"><AInput value={editBuf.titolo} onChange={e => setEditBuf(p => ({ ...p, titolo: e.target.value }))} /></AField>
                </div>
                <AField label="Descrizione"><AInput value={editBuf.desc} onChange={e => setEditBuf(p => ({ ...p, desc: e.target.value }))} /></AField>
                <AField label="Icona">
                  <select value={editBuf.icona} onChange={e => setEditBuf(p => ({ ...p, icona: e.target.value }))} style={inp({ width: "auto" })}>
                    {ICONA_OPTIONS.map(o => <option key={o.k} value={o.k}>{o.e} {o.l}</option>)}
                  </select>
                </AField>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={commitEdit} style={btn("primary")}>Salva</button>
                  <button onClick={() => setEditIdx(null)} style={btn("ghost")}>Annulla</button>
                </div>
              </div>
            )}
          </div>
        )}
      />
      {/* Add new */}
      <div style={{ marginTop: 20, padding: 14, background: "#F9FAFB", borderRadius: A.r, border: `1px dashed ${A.border}` }}>
        <p style={label({ marginBottom: 10 })}>+ Aggiungi evento</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 10, marginBottom: 10 }}>
          <AField label="Ora"><AInput value={addBuf.ora}    onChange={e => setAddBuf(p => ({ ...p, ora: e.target.value }))} placeholder="15:00" /></AField>
          <AField label="Titolo"><AInput value={addBuf.titolo} onChange={e => setAddBuf(p => ({ ...p, titolo: e.target.value }))} placeholder="Nome evento" /></AField>
        </div>
        <AField label="Descrizione"><AInput value={addBuf.desc} onChange={e => setAddBuf(p => ({ ...p, desc: e.target.value }))} placeholder="Breve descrizione" /></AField>
        <AField label="Icona">
          <select value={addBuf.icona} onChange={e => setAddBuf(p => ({ ...p, icona: e.target.value }))} style={inp({ width: "auto" })}>
            {ICONA_OPTIONS.map(o => <option key={o.k} value={o.k}>{o.e} {o.l}</option>)}
          </select>
        </AField>
        <button onClick={addItem} style={btn("primary")}>Aggiungi</button>
      </div>
    </AdminSectionCard>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 3 — FAQ
   ═══════════════════════════════════════════════════════════ */
function SecFAQ({ siteData, updateSite }) {
  const [items, setItems]   = useState([...siteData.faqItems]);
  const [editIdx, setEditIdx] = useState(null);
  const [editBuf, setEditBuf] = useState({});
  const [addBuf, setAddBuf]   = useState({ q: "", r: "" });
  const [saved, setSaved]     = useState(false);

  const save = (arr = items) => { updateSite("faqItems", arr); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const del  = i => { const a = items.filter((_, j) => j !== i); setItems(a); save(a); };

  const startEdit = i => { setEditIdx(i); setEditBuf({ ...items[i] }); };
  const commitEdit = () => { const a = items.map((it, i) => i === editIdx ? editBuf : it); setItems(a); setEditIdx(null); save(a); };

  const addItem = () => {
    if (!addBuf.q.trim()) return;
    const a = [...items, { ...addBuf }];
    setItems(a); setAddBuf({ q: "", r: "" }); save(a);
  };

  return (
    <AdminSectionCard title="❓ FAQ">
      {saved && <p style={{ fontFamily: A.ff, fontSize: 12, color: A.success, marginBottom: 12 }}>✓ Salvato</p>}
      <DraggableList
        items={items}
        onReorder={arr => { setItems(arr); save(arr); }}
        renderRow={(item, i) => (
          <div key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${A.border}` }}>
              <span style={{ cursor: "grab", color: A.muted, fontSize: 16, userSelect: "none" }}>⠿</span>
              <span style={{ flex: 1, fontFamily: A.ff, fontSize: 13, color: A.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.q}</span>
              <button onClick={() => startEdit(i)} style={btn("ghost", { fontSize: 11 })}>✏️</button>
              <button onClick={() => del(i)}       style={btn("danger", { fontSize: 11 })}>🗑️</button>
            </div>
            {editIdx === i && (
              <div style={{ background: "#F9FAFB", border: `1px solid ${A.border}`, borderRadius: 4, padding: 14, margin: "6px 0" }}>
                <AField label="Domanda"><AInput value={editBuf.q} onChange={e => setEditBuf(p => ({ ...p, q: e.target.value }))} /></AField>
                <AField label="Risposta"><ATextarea value={editBuf.r} onChange={e => setEditBuf(p => ({ ...p, r: e.target.value }))} rows={4} /></AField>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={commitEdit} style={btn("primary")}>Salva</button>
                  <button onClick={() => setEditIdx(null)} style={btn("ghost")}>Annulla</button>
                </div>
              </div>
            )}
          </div>
        )}
      />
      <div style={{ marginTop: 20, padding: 14, background: "#F9FAFB", borderRadius: A.r, border: `1px dashed ${A.border}` }}>
        <p style={label({ marginBottom: 10 })}>+ Aggiungi FAQ</p>
        <AField label="Domanda"><AInput value={addBuf.q} onChange={e => setAddBuf(p => ({ ...p, q: e.target.value }))} placeholder="La domanda…" /></AField>
        <AField label="Risposta"><ATextarea value={addBuf.r} onChange={e => setAddBuf(p => ({ ...p, r: e.target.value }))} /></AField>
        <button onClick={addItem} style={btn("primary")}>Aggiungi</button>
      </div>
    </AdminSectionCard>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 4 — RISPOSTE RSVP
   ═══════════════════════════════════════════════════════════ */
function SecRSVP() {
  const [risposte, setRisposte] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rsvp_risposte") || "[]"); } catch { return []; }
  });

  /* Subscribe to Firebase Realtime DB for RSVP responses */
  useEffect(() => {
    if (!CONFIGURED) return;
    const unsubscribe = onValue(ref(db, "rsvpResponses"), snap => {
      const val = snap.val();
      if (!val) return;
      const arr = Object.values(val).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setRisposte(arr);
    });
    return unsubscribe;
  }, []);

  const refresh = () => {
    if (!CONFIGURED) {
      try { setRisposte(JSON.parse(localStorage.getItem("rsvp_risposte") || "[]")); } catch {}
    }
  };

  const presenti = risposte.filter(r => r.presenza === true).length;
  const assenti  = risposte.filter(r => r.presenza === false).length;

  const exportCSV = () => {
    const hdr = ["Nome","Cognome","Presenza","N° Ospiti","Allergie","Messaggio","Data"];
    const rows = risposte.map(r => [
      r.nome, r.cognome,
      r.presenza ? "Sì" : "No",
      r.nPersone ?? 0,
      (r.persone ?? []).map(p => p.allergie?.join("+")).join("; "),
      (r.messaggio ?? "").replace(/\n/g, " "),
      r.timestamp ? new Date(r.timestamp).toLocaleString("it-IT") : "",
    ]);
    const csv = [hdr, ...rows].map(row => row.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "rsvp_risposte.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => { if (window.confirm("Eliminare tutte le risposte?")) { localStorage.removeItem("rsvp_risposte"); setRisposte([]); } };

  return (
    <AdminSectionCard title="📋 Risposte RSVP">
      <div style={{ background: A.accentLight, border: `1px solid ${A.accent}44`, borderRadius: 4, padding: "8px 12px", marginBottom: 14, fontFamily: A.ff, fontSize: 12, color: A.accent }}>
        {CONFIGURED ? "✓ Firebase attivo — le risposte RSVP sono salvate nel database condiviso." : "🔧 Firebase non configurato — le risposte sono salvate solo in questo browser."}
      </div>
      {/* Counters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <ABadge color={A.success}>✓ {presenti} confermati</ABadge>
        <ABadge color={A.danger}>✗ {assenti} assenti</ABadge>
        <ABadge color={A.muted}>⏳ {risposte.length} totali</ABadge>
      </div>
      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button onClick={exportCSV} style={btn("primary")}>⬇ Esporta CSV</button>
        <button onClick={refresh}   style={btn("outline")}>↻ Aggiorna</button>
        {risposte.length > 0 && <button onClick={clearAll} style={btn("danger")}>🗑 Svuota</button>}
      </div>
      {/* Table */}
      {risposte.length === 0
        ? <p style={{ fontFamily: A.ff, fontSize: 13, color: A.muted, textAlign: "center", padding: 24 }}>Nessuna risposta ricevuta.</p>
        : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: A.ff, fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#F3F4F6" }}>
                  {["Nome","Cognome","Presenza","Ospiti","Allergie","Messaggio","Data"].map(h => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: A.muted, letterSpacing: ".04em", borderBottom: `1px solid ${A.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {risposte.map((r, i) => {
                  const allergie = (r.persone ?? []).flatMap(p => p.allergie ?? []).join(", ");
                  return (
                    <tr key={i} style={{ background: r.presenza ? "#F0FDF4" : "#FDF2F4" }}>
                      <td style={{ padding: "8px 10px", borderBottom: `1px solid ${A.border}` }}>{r.nome}</td>
                      <td style={{ padding: "8px 10px", borderBottom: `1px solid ${A.border}` }}>{r.cognome}</td>
                      <td style={{ padding: "8px 10px", borderBottom: `1px solid ${A.border}` }}>
                        <ABadge color={r.presenza ? A.success : A.danger}>{r.presenza ? "Sì ✓" : "No ✗"}</ABadge>
                      </td>
                      <td style={{ padding: "8px 10px", borderBottom: `1px solid ${A.border}` }}>{r.nPersone ?? 0}</td>
                      <td style={{ padding: "8px 10px", borderBottom: `1px solid ${A.border}`, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{allergie || "—"}</td>
                      <td style={{ padding: "8px 10px", borderBottom: `1px solid ${A.border}`, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.messaggio || "—"}</td>
                      <td style={{ padding: "8px 10px", borderBottom: `1px solid ${A.border}`, whiteSpace: "nowrap", color: A.muted }}>{r.timestamp ? new Date(r.timestamp).toLocaleDateString("it-IT") : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      }
    </AdminSectionCard>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 5 — FOTO, ICONE & GRAFICA
   ═══════════════════════════════════════════════════════════ */
function SecGrafici({ siteData, updateGraphic }) {
  return (
    <AdminSectionCard title="🖼 Foto, Icone & Elementi Grafici">
      {/* ── FOTO PER PAGINA ── */}
      <h3 style={{ fontFamily: A.ff, fontSize: 13, fontWeight: 700, color: A.text, marginBottom: 4 }}>Foto per pagina</h3>
      <p style={{ fontFamily: A.ff, fontSize: 12, color: A.muted, marginBottom: 12 }}>
        Il toggle 🔘 mostra/nasconde la box nel sito. L'immagine rimane salvata anche quando la box è disattivata.
      </p>
      <AccordionBlock title="HOME" defaultOpen>
        <PhotoSlotAdmin label="Foto coppia (hero)"     storageKey="home_couple"
          page="home" itemKey="couplePhoto" siteData={siteData} updateGraphic={updateGraphic} />
        <PhotoSlotAdmin label="Sfondo hero"            storageKey="home_herobg" />
        <PhotoSlotAdmin label="Sfondo intera pagina"   storageKey="home_pagebg" />
      </AccordionBlock>
      <AccordionBlock title="PROGRAMMA">
        <PhotoSlotAdmin label="Foto location (banner)" storageKey="programma_hero"
          page="programma" itemKey="heroImg" siteData={siteData} updateGraphic={updateGraphic} />
        <PhotoSlotAdmin label="Foto momento speciale"  storageKey="programma_polaroid"
          page="programma" itemKey="polaroidImg" siteData={siteData} updateGraphic={updateGraphic} />
      </AccordionBlock>
      <AccordionBlock title="FAQ">
        <PhotoSlotAdmin label="Foto laterale"          storageKey="faq_side"
          page="faq" itemKey="sidePhoto" siteData={siteData} updateGraphic={updateGraphic} />
      </AccordionBlock>
      <AccordionBlock title="RSVP">
        <PhotoSlotAdmin label="Foto hero (cerchio)"    storageKey="rsvp_hero"
          page="rsvp" itemKey="heroCircle" siteData={siteData} updateGraphic={updateGraphic} />
      </AccordionBlock>
      <AccordionBlock title="GIOCO">
        <PhotoSlotAdmin label="Faccia sposo (80×80)"   storageKey="game_groom" />
        <PhotoSlotAdmin label="Faccia sposa (80×80)"   storageKey="game_bride" />
      </AccordionBlock>

      {/* ── SVG VISIBILITY ── */}
      <h3 style={{ fontFamily: A.ff, fontSize: 13, fontWeight: 700, color: A.text, margin: "24px 0 12px" }}>Illustrazioni & Icone SVG</h3>
      <p style={{ fontFamily: A.ff, fontSize: 12, color: A.muted, marginBottom: 14 }}>
        Le modifiche alla visibilità si applicano al ricaricamento della pagina del sito (sessione corrente usa cache locale).
      </p>

      <AccordionBlock title="▸ HOME" defaultOpen>
        {[
          { k: "olSx",       l: "Ramo ulivo sinistro", el: <OliveB scale={2.5} color="#3D5A3E" /> },
          { k: "olDx",       l: "Ramo ulivo destro",   el: <OliveB flip scale={2.5} color="#3D5A3E" /> },
          { k: "grape",      l: "Grappolo uva",        el: <Grape /> },
          { k: "wineHero",   l: "Calice vino (hero)",  el: <Wine /> },
          { k: "cake",       l: "Torta nuziale",       el: <Cake /> },
          { k: "cocktail",   l: "Cocktail",            el: <Cocktail /> },
          { k: "rings",      l: "Anelli (hero)",       el: <Rings /> },
          { k: "moon",       l: "Luna (footer)",       el: <Moon /> },
          { k: "dividers",   l: "Divisori botanici",   el: <BotDiv color="#3D5A3E" /> },
          { k: "churchCard", l: "Icona chiesa (card)", el: <Church /> },
          { k: "wineCard",   l: "Icona calice (card)", el: <Wine /> },
          { k: "rsvpCard",   l: "Icona cuore (card)",  el: <HeartSVG /> },
        ].map(({ k, l, el }) => (
          <SvgVisRow key={k} label={l} page="home" itemKey={k} previewEl={el} siteData={siteData} updateGraphic={updateGraphic} />
        ))}
      </AccordionBlock>

      <AccordionBlock title="▸ PROGRAMMA">
        {[
          { k: "vineLine", l: "Linea verticale centrale", el: (
            <svg width="40" height="80" viewBox="0 0 40 80" fill="none">
              <line x1="20" y1="0" x2="20" y2="80" stroke="#3D5A3E" strokeWidth="2" strokeOpacity="0.38" />
              <circle cx="20" cy="20" r="5" stroke="#3D5A3E" strokeWidth="1.5" fill="#F5F0E8" />
              <circle cx="20" cy="20" r="2" fill="#C9A84C" />
              <circle cx="20" cy="60" r="5" stroke="#3D5A3E" strokeWidth="1.5" fill="#F5F0E8" />
              <circle cx="20" cy="60" r="2" fill="#C9A84C" />
            </svg>
          )},
          { k: "chiesa",   l: "Icona cerimonia",    el: <Church /> },
          { k: "cocktail", l: "Icona aperitivo",    el: <Cocktail /> },
          { k: "piatto",   l: "Icona cena",         el: <span style={{ fontSize: 40 }}>🍽️</span> },
          { k: "cuore",    l: "Icona discorsi",     el: <HeartSVG /> },
          { k: "torta",    l: "Icona torta",        el: <Cake /> },
          { k: "note",     l: "Icona primo ballo",  el: <span style={{ fontSize: 40 }}>🎵</span> },
          { k: "disco",    l: "Icona festa",        el: <span style={{ fontSize: 40 }}>🪩</span> },
          { k: "luna",     l: "Icona buonanotte",   el: <Moon /> },
        ].map(({ k, l, el }) => (
          <SvgVisRow key={k} label={l} page="programma" itemKey={k} previewEl={el} siteData={siteData} updateGraphic={updateGraphic} />
        ))}
      </AccordionBlock>

      <AccordionBlock title="▸ FAQ">
        {[
          { k: "frecce",      l: "Frecce accordion",   el: <span style={{ fontSize: 36, color: "#3D5A3E" }}>▾</span> },
          { k: "decorazioni", l: "Decorazioni header",  el: <span style={{ fontSize: 36 }}>🌿</span> },
        ].map(({ k, l, el }) => (
          <SvgVisRow key={k} label={l} page="faq" itemKey={k} previewEl={el} siteData={siteData} updateGraphic={updateGraphic} />
        ))}
      </AccordionBlock>

      <AccordionBlock title="▸ RSVP">
        {[
          { k: "calici",      l: "Calici conferma",     el: <span style={{ fontSize: 40 }}>🥂</span> },
          { k: "decorazioni", l: "Decorazioni form",    el: <span style={{ fontSize: 40 }}>✨</span> },
        ].map(({ k, l, el }) => (
          <SvgVisRow key={k} label={l} page="rsvp" itemKey={k} previewEl={el} siteData={siteData} updateGraphic={updateGraphic} />
        ))}
      </AccordionBlock>

      <AccordionBlock title="▸ REGALO">
        {[
          { k: "olSx",     l: "Ramo ulivo sinistro",  el: <OliveB scale={2.5} color="#C9A84C" /> },
          { k: "olDx",     l: "Ramo ulivo destro",    el: <OliveB flip scale={2.5} color="#C9A84C" /> },
          { k: "rings",    l: "Anelli (hero)",         el: <Rings color="#C9A84C" /> },
          { k: "dividers", l: "Divisori botanici",     el: <BotDiv color="#3D5A3E" /> },
        ].map(({ k, l, el }) => (
          <SvgVisRow key={k} label={l} page="regalo" itemKey={k} previewEl={el} siteData={siteData} updateGraphic={updateGraphic} />
        ))}
      </AccordionBlock>
    </AdminSectionCard>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 5b — IL REGALO PIÙ GRANDE
   ═══════════════════════════════════════════════════════════ */
function SecRegalo({ siteData, updateSite }) {
  const [frase,        setFrase]        = useState(siteData.regaloFrase        ?? "");
  const [iban,         setIban]         = useState(siteData.regaloIban         ?? "");
  const [intestatario, setIntestatario] = useState(siteData.regaloIntestatario ?? "");
  const [saved,        setSaved]        = useState(false);

  const save = () => {
    updateSite("regaloFrase",        frase);
    updateSite("regaloIban",         iban);
    updateSite("regaloIntestatario", intestatario);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AdminSectionCard title="💝 Il Regalo più grande">
      <p style={{ fontFamily: A.ff, fontSize: 12, color: A.accent, marginBottom: 16, padding: "8px 12px", background: A.accentLight, borderRadius: 4 }}>
        ✓ Le modifiche sono visibili immediatamente nella pagina /regalo.
      </p>
      {saved && <p style={{ fontFamily: A.ff, fontSize: 12, color: A.success, marginBottom: 12 }}>✓ Salvato</p>}
      <AField label="Testo introduttivo" hint="Frase mostrata prima del riquadro IBAN.">
        <ATextarea value={frase} onChange={e => setFrase(e.target.value)} rows={4} />
      </AField>
      <AField label="IBAN" hint={"Inserisci l'IBAN reale (es. IT12 A123 4567 8901 2345 6789 012). Il segnaposto è solo un esempio."}>
        <AInput value={iban} onChange={e => setIban(e.target.value)} placeholder="IT00 X000 0000 0000 0000 0000 000" />
      </AField>
      <AField label="Intestatario">
        <AInput value={intestatario} onChange={e => setIntestatario(e.target.value)} placeholder="Nome Cognome" />
      </AField>
      <button onClick={save} style={btn("primary")}>Salva modifiche</button>
    </AdminSectionCard>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 6 — ORDINE MENU
   ═══════════════════════════════════════════════════════════ */
function SecMenu({ siteData, updateSite }) {
  const [items, setItems]   = useState([...siteData.ordineMenu]);
  const [vis, setVis]       = useState({ ...siteData.menuVisibility });
  const [saved, setSaved]   = useState(false);

  const save = (arr = items, v = vis) => {
    updateSite("ordineMenu", arr);
    updateSite("menuVisibility", v);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const toggleVis = label => {
    const nv = { ...vis, [label]: !vis[label] };
    setVis(nv); save(items, nv);
  };

  return (
    <AdminSectionCard title="🔗 Ordine Menu Navbar">
      {saved && <p style={{ fontFamily: A.ff, fontSize: 12, color: A.success, marginBottom: 12 }}>✓ Salvato</p>}
      <p style={{ fontFamily: A.ff, fontSize: 12, color: A.muted, marginBottom: 14 }}>Trascina per riordinare · Toggle per mostrare/nascondere dalla navbar.</p>
      <DraggableList
        items={items}
        onReorder={arr => { setItems(arr); save(arr); }}
        renderRow={(item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${A.border}` }}>
            <span style={{ cursor: "grab", color: A.muted, fontSize: 16, userSelect: "none" }}>⠿</span>
            <span style={{ flex: 1, fontFamily: A.ff, fontSize: 14, color: vis[item] !== false ? A.text : A.muted, textDecoration: vis[item] !== false ? "none" : "line-through" }}>{item}</span>
            <AToggle on={vis[item] !== false} onChange={() => toggleVis(item)} />
          </div>
        )}
      />
    </AdminSectionCard>
  );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 7 — IMPOSTAZIONI
   ═══════════════════════════════════════════════════════════ */
function SecImpostazioni({ siteData, updateSite }) {
  const [webhook, setWebhook]   = useState(siteData.webhookUrl || "");
  const [webhookSaved, setWebhookSaved] = useState(false);
  const [newPwd, setNewPwd]     = useState("");
  const [pwdMsg, setPwdMsg]     = useState("");
  const [palette, setPalette]   = useState({ ...siteData.palette });
  const [palSaved, setPalSaved] = useState(false);

  /* GitHub credentials (stored in localStorage, admin-device only) */
  const [ghPat,    setGhPat]    = useState(() => localStorage.getItem("github_pat")    || "");
  const [ghOwner,  setGhOwner]  = useState(() => localStorage.getItem("github_owner")  || "");
  const [ghRepo,   setGhRepo]   = useState(() => localStorage.getItem("github_repo")   || "");
  const [ghBranch, setGhBranch] = useState(() => localStorage.getItem("github_branch") || "main");
  const [ghSaved,  setGhSaved]  = useState(false);

  const saveGithub = () => {
    localStorage.setItem("github_pat",    ghPat.trim());
    localStorage.setItem("github_owner",  ghOwner.trim());
    localStorage.setItem("github_repo",   ghRepo.trim());
    localStorage.setItem("github_branch", ghBranch.trim() || "main");
    setGhSaved(true); setTimeout(() => setGhSaved(false), 2000);
  };

  const saveWebhook = () => {
    updateSite("webhookUrl", webhook);
    setWebhookSaved(true); setTimeout(() => setWebhookSaved(false), 2000);
  };

  const changePwd = () => {
    if (newPwd.length < 6) { setPwdMsg("Minimo 6 caratteri"); return; }
    localStorage.setItem("admin_pwd", newPwd);
    setPwdMsg("Password aggiornata!"); setNewPwd("");
    setTimeout(() => setPwdMsg(""), 3000);
  };

  const resetSite = () => {
    const c1 = window.confirm("⚠️ Sei sicuro di voler azzerare TUTTI i dati del sito ai valori predefiniti?");
    if (!c1) return;
    const c2 = window.confirm("Ultima conferma: questa azione è IRREVERSIBILE. Continuare?");
    if (!c2) return;
    localStorage.removeItem("wc_site_data");
    localStorage.removeItem("rsvp_risposte");
    window.location.reload();
  };

  const savePalette = () => { updateSite("palette", palette); setPalSaved(true); setTimeout(() => setPalSaved(false), 2000); };

  const paletteFields = [
    { k: "cream", l: "Sfondo crema" }, { k: "olive", l: "Verde oliva" },
    { k: "gold",  l: "Oro" },          { k: "rose",  l: "Rosa" },
    { k: "dark",  l: "Testo scuro" },  { k: "card",  l: "Sfondo card" },
  ];

  return (
    <>
      {/* GitHub foto upload */}
      <AdminSectionCard title="📁 Upload Foto via GitHub">
        <p style={{ fontFamily: A.ff, fontSize: 12, color: A.muted, marginBottom: 12 }}>
          Le foto vengono caricate direttamente nel repository GitHub e appaiono su tutti i dispositivi senza attendere il deploy.
          Il token viene salvato solo su questo browser.
        </p>
        <div style={{ background: A.accentLight, borderRadius: 4, padding: "8px 12px", marginBottom: 14, fontFamily: A.ff, fontSize: 12, color: A.accent }}>
          {isGithubConfigured() ? "✓ GitHub configurato — upload foto attivo." : "⚠ GitHub non configurato — le foto sono salvate solo in questo browser."}
        </div>
        <AField label="GitHub Personal Access Token" hint="Crea un token con permesso 'Contents: Read & Write' su github.com/settings/tokens">
          <AInput value={ghPat} onChange={e => setGhPat(e.target.value)} type="password" placeholder="ghp_..." />
        </AField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <AField label="Owner (utente/org)">
            <AInput value={ghOwner} onChange={e => setGhOwner(e.target.value)} placeholder="tuo-username" />
          </AField>
          <AField label="Nome repository">
            <AInput value={ghRepo} onChange={e => setGhRepo(e.target.value)} placeholder="wedding-mc-flavio" />
          </AField>
        </div>
        <AField label="Branch">
          <AInput value={ghBranch} onChange={e => setGhBranch(e.target.value)} placeholder="main" />
        </AField>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={saveGithub} style={btn("primary")}>Salva credenziali</button>
          {ghSaved && <span style={{ fontFamily: A.ff, fontSize: 12, color: A.success }}>✓ Salvato</span>}
        </div>
      </AdminSectionCard>

      {/* Google Sheets */}
      <AdminSectionCard title="🔧 Integrazione Google Sheets">
        <p style={{ fontFamily: A.ff, fontSize: 12, color: A.muted, marginBottom: 12 }}>Inserisci l'URL del webhook (Google Apps Script) per inviare le risposte RSVP al foglio di calcolo.</p>
        <AField label="URL Webhook">
          <AInput value={webhook} onChange={e => setWebhook(e.target.value)} placeholder="https://script.google.com/macros/s/..." />
        </AField>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={saveWebhook} style={btn("primary")}>Salva Webhook</button>
          {webhookSaved && <span style={{ fontFamily: A.ff, fontSize: 12, color: A.success }}>✓ Salvato</span>}
        </div>
      </AdminSectionCard>

      {/* Palette colori */}
      <AdminSectionCard title="🎨 Palette Colori Sito">
        <p style={{ fontFamily: A.ff, fontSize: 12, color: A.muted, marginBottom: 14 }}>
          I colori qui impostati vengono salvati nel context. Le pagine li leggeranno a partire dal prossimo deploy o refresh.
        </p>
        {paletteFields.map(({ k, l }) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${A.border}` }}>
            <span style={{ fontFamily: A.ff, fontSize: 13, flex: 1, color: A.text }}>{l}</span>
            <input type="color" value={palette[k] || "#000000"} onChange={e => setPalette(p => ({ ...p, [k]: e.target.value }))}
              style={{ width: 36, height: 36, border: "none", padding: 0, borderRadius: 4, cursor: "pointer" }} />
            <span style={{ fontFamily: A.ff, fontSize: 12, color: A.muted, minWidth: 64 }}>{palette[k]}</span>
          </div>
        ))}
        <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
          <button onClick={savePalette} style={btn("primary")}>Salva Palette</button>
          <button onClick={() => { setPalette({ cream:"#F5F0E8",olive:"#3D5A3E",gold:"#C9A84C",rose:"#D4849A",dark:"#1C1C1C",card:"#FAF7F0" }); }} style={btn("outline")}>Reset Palette</button>
          {palSaved && <span style={{ fontFamily: A.ff, fontSize: 12, color: A.success, alignSelf: "center" }}>✓ Salvata</span>}
        </div>
      </AdminSectionCard>

      {/* Cambio password */}
      <AdminSectionCard title="🔑 Cambio Password Admin">
        <AField label="Nuova Password">
          <AInput value={newPwd} onChange={e => setNewPwd(e.target.value)} type="password" placeholder="Minimo 6 caratteri" />
        </AField>
        <button onClick={changePwd} style={btn("primary")}>Aggiorna Password</button>
        {pwdMsg && <p style={{ fontFamily: A.ff, fontSize: 12, color: pwdMsg.includes("!") ? A.success : A.danger, marginTop: 8 }}>{pwdMsg}</p>}
      </AdminSectionCard>

      {/* Reset sito */}
      <AdminSectionCard title="⚠️ Reset Sito">
        <p style={{ fontFamily: A.ff, fontSize: 13, color: A.muted, marginBottom: 14 }}>Azzera tutti i dati del sito (testi, programma, FAQ, RSVP, media) ai valori predefiniti. Questa azione è irreversibile.</p>
        <button onClick={resetSite} style={btn("danger")}>🗑 Reset completo sito</button>
      </AdminSectionCard>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   LOGIN FORM
   ═══════════════════════════════════════════════════════════ */
function LoginForm({ onLogin }) {
  const [user, setUser] = useState("");
  const [pwd,  setPwd]  = useState("");
  const [err,  setErr]  = useState("");

  const submit = async e => {
    e.preventDefault();
    const storedPwd = localStorage.getItem("admin_pwd") || ADMIN_CREDS.pwd;
    if (user === ADMIN_CREDS.user && pwd === storedPwd) {
      if (CONFIGURED) {
        try { await signInAnonymously(auth); } catch { /* proceed anyway */ }
      }
      sessionStorage.setItem("admin_auth", "1");
      onLogin();
    } else {
      setErr("Credenziali non corrette");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: A.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: A.ff }}>
      <form onSubmit={submit} style={{ background: "#fff", border: `1px solid ${A.border}`, borderRadius: 10, padding: 36, width: "100%", maxWidth: 360, boxShadow: "0 4px 24px rgba(0,0,0,.08)" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: A.text, marginBottom: 6 }}>⚙️ Admin Panel</h1>
        <p style={{ fontSize: 12, color: A.muted, marginBottom: 24 }}>MC &amp; F · Matrimonio 2026</p>
        <AField label="Username">
          <AInput value={user} onChange={e => { setUser(e.target.value); setErr(""); }} placeholder="admin" />
        </AField>
        <AField label="Password">
          <AInput value={pwd}  onChange={e => { setPwd(e.target.value);  setErr(""); }} type="password" placeholder="••••••••" />
        </AField>
        {err && <p style={{ fontSize: 12, color: A.danger, marginBottom: 12 }}>⚠ {err}</p>}
        <button type="submit" style={{ ...btn("primary"), width: "100%", padding: "10px 0" }}>Accedi</button>
      </form>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD LAYOUT
   ═══════════════════════════════════════════════════════════ */
const SECTIONS = [
  { id: "testi",     label: "📝 Testi del sito" },
  { id: "programma", label: "🗓️ Programma" },
  { id: "faq",       label: "❓ FAQ" },
  { id: "regalo",    label: "💝 Il Regalo" },
  { id: "rsvp",      label: "📋 Risposte RSVP" },
  { id: "grafici",   label: "🖼 Foto & Grafica" },
  { id: "menu",      label: "🔗 Ordine menu" },
  { id: "settings",  label: "⚙️ Impostazioni" },
];

function Dashboard({ onLogout }) {
  const { siteData, updateSite, updateGraphic } = useSite();
  const [active, setActive] = useState("testi");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* Re-authenticate anonymously if session was restored from sessionStorage
     (Firebase auth token is lost on page reload even if admin session persists) */
  useEffect(() => {
    if (CONFIGURED) {
      signInAnonymously(auth).catch(() => {});
    }
  }, []);

  const content = {
    testi:     <SecTesti     siteData={siteData} updateSite={updateSite} />,
    programma: <SecProgramma siteData={siteData} updateSite={updateSite} />,
    faq:       <SecFAQ       siteData={siteData} updateSite={updateSite} />,
    regalo:    <SecRegalo    siteData={siteData} updateSite={updateSite} />,
    rsvp:      <SecRSVP />,
    grafici:   <SecGrafici   siteData={siteData} updateGraphic={updateGraphic} />,
    menu:      <SecMenu      siteData={siteData} updateSite={updateSite} />,
    settings:  <SecImpostazioni siteData={siteData} updateSite={updateSite} />,
  };

  return (
    <div style={{ fontFamily: A.ff, background: A.bg, minHeight: "100vh" }}>
      {/* ── HEADER ── */}
      <header style={{ position: "fixed", top: 0, left: 0, right: 0, height: A.header, zIndex: 200, background: A.accent, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", boxShadow: "0 2px 8px rgba(0,0,0,.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", padding: 4, opacity: .75, lineHeight: 1 }}>☰</button>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>⚙️ Admin — MC &amp; F</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontFamily: A.ff, fontSize: 11, padding: "2px 8px", borderRadius: 10,
            background: CONFIGURED ? "#22C55E22" : "#F59E0B22",
            color: CONFIGURED ? "#86EFAC" : "#FCD34D" }}>
            {CONFIGURED ? "● Firebase ON" : "● localStorage"}
          </span>
          <a href="/" target="_blank" style={{ color: "#ffffffAA", fontSize: 12, textDecoration: "none" }}>← Vedi sito</a>
          <button onClick={onLogout} style={btn("ghost", { color: "#fff", borderColor: "#ffffff44", fontSize: 12 })}>Logout</button>
        </div>
      </header>

      {/* ── SIDEBAR ── */}
      <aside style={{
        position: "fixed", top: A.header, left: 0, bottom: 0, zIndex: 100,
        width: sidebarOpen ? A.sidebar : 0,
        overflow: "hidden",
        background: "#fff", borderRight: `1px solid ${A.border}`,
        transition: "width .25s ease",
      }}>
        <div style={{ width: A.sidebar, padding: "12px 0" }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActive(s.id)} style={{
              display: "block", width: "100%", textAlign: "left",
              padding: "10px 20px", border: "none", cursor: "pointer",
              fontFamily: A.ff, fontSize: 13, fontWeight: active === s.id ? 600 : 400,
              background: active === s.id ? A.accentLight : "transparent",
              color:      active === s.id ? A.accent       : A.muted,
              borderLeft: active === s.id ? `3px solid ${A.accent}` : "3px solid transparent",
            }}>
              {s.label}
            </button>
          ))}
        </div>
      </aside>

      {/* ── CONTENT ── */}
      <main style={{
        marginTop: A.header,
        marginLeft: sidebarOpen ? A.sidebar : 0,
        padding: 28,
        transition: "margin-left .25s ease",
        minHeight: `calc(100vh - ${A.header}px)`,
      }}>
        {content[active]}
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN ADMIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("admin_auth") === "1");

  const logout = () => {
    sessionStorage.removeItem("admin_auth");
    if (CONFIGURED) signOut(auth).catch(() => {});
    setAuthed(false);
  };

  if (!authed) return <LoginForm onLogin={() => setAuthed(true)} />;
  return <Dashboard onLogout={logout} />;
}
