import { useState } from "react";
import { COLORS, FONTS, OliveB, BotDiv, Rings } from "../designSystem.jsx";
import PhotoSlot, { ImgSlot } from "../components/PhotoSlot";
import { useSite } from "../context/SiteContext";

const B = import.meta.env.BASE_URL;
const regaloBase = (key) => `${B}media/graphic_regalo_${key}.png`;
const regaloDivBase = `${B}media/graphic_regalo_dividers.png`;

export default function Regalo() {
  const { siteData } = useSite();
  const C = { ...COLORS, ...(siteData.palette ?? {}) };

  const g = siteData.graphics?.regalo ?? {};
  const media = siteData.media ?? {};
  const gfx = (key) => ({ url: media[`graphic_regalo_${key}`] || null });

  const frase       = siteData.regaloFrase       ?? "";
  const iban        = siteData.regaloIban        ?? "";
  const intestatario= siteData.regaloIntestatario ?? "";

  const [copied, setCopied] = useState(false);

  const copyIban = () => {
    navigator.clipboard.writeText(iban).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }).catch(() => {
      /* fallback for older browsers */
      const el = document.createElement("textarea");
      el.value = iban;
      el.style.position = "fixed";
      el.style.opacity  = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <div style={{
      background: C.cream,
      minHeight: "100vh",
      fontFamily: FONTS.body,
      color: C.dark,
      overflowX: "hidden",
    }}>

      {/* ── HERO ── */}
      <section style={{
        paddingTop: 140,
        paddingBottom: 60,
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Corner olive branches */}
        <div style={{ position: "absolute", top: 80, left: 0, opacity: 0.7 }}>
          <PhotoSlot up={gfx("olSx")} vis={g.olSx?.vis !== false} edit={false}
            size={135} base={regaloBase("olSx")} svg={<OliveB scale={0.75} color={C.gold} />} />
        </div>
        <div style={{ position: "absolute", top: 80, right: 0, opacity: 0.7, transform: "scaleX(-1)" }}>
          <PhotoSlot up={gfx("olDx")} vis={g.olDx?.vis !== false} edit={false}
            size={135} base={regaloBase("olDx")} svg={<OliveB flip scale={0.75} color={C.gold} />} />
        </div>

        {/* Rings icon */}
        {g.rings?.vis !== false && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <PhotoSlot up={gfx("rings")} vis={true} edit={false}
              size={96} base={regaloBase("rings")} svg={<Rings color={C.gold} />} />
          </div>
        )}

        <h1 style={{
          fontFamily: FONTS.serif,
          fontSize: "clamp(2rem, 6vw, 3.2rem)",
          fontWeight: 700,
          color: C.olive,
          letterSpacing: ".03em",
          margin: "0 0 10px",
        }}>
          Il Regalo più grande
        </h1>

        <p style={{
          fontFamily: FONTS.script,
          fontSize: "clamp(1.1rem, 3vw, 1.5rem)",
          color: C.gold,
          margin: 0,
        }}>
          Maria Cristina &amp; Flavio
        </p>
      </section>

      {/* ── Divider ── */}
      {g.dividers?.vis !== false && (
        <div style={{ display: "flex", justifyContent: "center", margin: "0 0 48px" }}>
          <ImgSlot
            customUrl={gfx("dividers").url}
            base={regaloDivBase}
            svg={<BotDiv color={C.olive} />}
            imgStyle={{ maxWidth: "100%", display: "block" }}
          />
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <section style={{
        maxWidth: 680,
        margin: "0 auto",
        padding: "0 24px 100px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 40,
      }}>

        {/* Testo introduttivo */}
        {frase && (
          <p style={{
            fontFamily: FONTS.body,
            fontSize: "clamp(1.05rem, 2.5vw, 1.2rem)",
            lineHeight: 1.8,
            color: C.dark,
            textAlign: "center",
            maxWidth: 580,
            margin: 0,
          }}>
            {frase}
          </p>
        )}

        {/* Riquadro IBAN */}
        <div style={{
          width: "100%",
          background: C.card,
          border: `1.5px solid ${C.gold}55`,
          borderRadius: 16,
          padding: "36px 32px",
          boxShadow: `0 4px 32px ${C.gold}18`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}>
          <p style={{
            fontFamily: FONTS.body,
            fontSize: "0.85rem",
            letterSpacing: ".18em",
            textTransform: "uppercase",
            color: C.olive,
            margin: 0,
          }}>
            Coordinate bancarie
          </p>

          {/* IBAN display */}
          <div style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: "clamp(1rem, 3.5vw, 1.35rem)",
            fontWeight: 700,
            letterSpacing: ".18em",
            color: C.dark,
            background: C.cream,
            border: `1px solid ${C.gold}44`,
            borderRadius: 8,
            padding: "14px 24px",
            wordBreak: "break-all",
            textAlign: "center",
            width: "100%",
            boxSizing: "border-box",
          }}>
            {iban}
          </div>

          {/* Intestatario */}
          {intestatario && (
            <p style={{
              fontFamily: FONTS.body,
              fontSize: "1rem",
              color: C.dark + "BB",
              margin: 0,
              textAlign: "center",
            }}>
              Intestato a: <strong style={{ color: C.dark }}>{intestatario}</strong>
            </p>
          )}

          {/* Bottone copia */}
          <button
            onClick={copyIban}
            style={{
              fontFamily: FONTS.body,
              fontSize: "1rem",
              letterSpacing: ".06em",
              padding: "13px 36px",
              borderRadius: 50,
              border: `1.5px solid ${copied ? C.olive : C.gold}`,
              background: copied ? C.olive : "transparent",
              color: copied ? "#fff" : C.gold,
              cursor: "pointer",
              transition: "all .25s ease",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {copied ? "✓ Copiato!" : "Copia IBAN"}
          </button>
        </div>

        {/* Nota conclusiva */}
        <p style={{
          fontFamily: FONTS.script,
          fontSize: "clamp(1.1rem, 3vw, 1.4rem)",
          color: C.rose,
          textAlign: "center",
          margin: 0,
        }}>
          Grazie di cuore ♥
        </p>
      </section>

      {/* ── Bottom divider ── */}
      {g.dividers?.vis !== false && (
        <div style={{ display: "flex", justifyContent: "center", paddingBottom: 60 }}>
          <ImgSlot
            customUrl={gfx("dividers").url}
            base={regaloDivBase}
            svg={<BotDiv color={C.olive} />}
            imgStyle={{ maxWidth: "100%", display: "block" }}
          />
        </div>
      )}
    </div>
  );
}
