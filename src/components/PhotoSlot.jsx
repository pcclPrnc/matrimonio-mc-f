import { useState } from "react";

/**
 * ImgSlot — stessa logica di PhotoSlot ma per immagini non quadrate
 * (es. divisori orizzontali, rami verticali).
 * Fallback chain: customUrl → base (file in public/media/) → svg
 *
 * Props:
 *   customUrl — URL da admin upload (Firebase/localStorage)
 *   base      — percorso file statico in public/media/
 *   svg       — componente SVG di fallback
 *   imgStyle  — stile da applicare all'<img>
 */
export function ImgSlot({ customUrl, base, svg, imgStyle }) {
  const [baseErr, setBaseErr] = useState(false);
  const url = customUrl || (!baseErr ? base : null);
  if (url) {
    return (
      <img
        src={url} alt=""
        style={imgStyle}
        onError={customUrl ? undefined : () => setBaseErr(true)}
      />
    );
  }
  return svg ?? null;
}

/**
 * PhotoSlot — renders the first available source in this order:
 *   1. up.url  — admin-uploaded image (Firebase / localStorage)
 *   2. base    — static file in public/media/ (e.g. "/media/graphic_home_olSx.png")
 *   3. svg     — original SVG component fallback
 *
 * Drop a PNG in public/media/ with the right name and it appears automatically.
 * Admin upload always takes priority over the static base image.
 */
export default function PhotoSlot({ up, vis, edit, size = 58, svg, base }) {
  const [baseErr, setBaseErr] = useState(false);
  if (!vis) return null;

  let content;
  if (up?.url) {
    content = (
      <img src={up.url} alt=""
        style={{ width: size, height: size, objectFit: "contain" }} />
    );
  } else if (base && !baseErr) {
    content = (
      <img src={base} alt=""
        style={{ width: size, height: size, objectFit: "contain" }}
        onError={() => setBaseErr(true)} />
    );
  } else {
    content = svg;
  }

  if (!edit) {
    return (
      <div style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        {content}
      </div>
    );
  }
  return (
    <div
      onClick={up?.trigger}
      style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center", position: "relative", cursor: "pointer" }}
    >
      {content}
      <div
        style={{
          position: "absolute", inset: 0, borderRadius: 6,
          background: "rgba(61,90,62,.62)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 16, opacity: 0, transition: "opacity .2s",
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = 1}
        onMouseLeave={e => e.currentTarget.style.opacity = 0}
      >
        🔄
      </div>
    </div>
  );
}
