import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  COLORS, FONTS,
  OliveB, Grape, BotDiv, Wine, Cake, Rings, Moon, Cocktail, Church, HeartSVG,
} from "../designSystem";
import PhotoSlot, { ImgSlot } from "../components/PhotoSlot";
import { useSite } from "../context/SiteContext";

/* Base path for static images in public/media/ (works in dev AND on GH Pages) */
const B = import.meta.env.BASE_URL;
const homeBase = (key) => `${B}media/graphic_home_${key}.png`;

export default function Home() {
  const { siteData } = useSite();

  /* Palette — merge defaults with any admin overrides */
  const C = { ...COLORS, ...(siteData.palette ?? {}) };

  /* Graphics visibility from context */
  const g = siteData.graphics?.home ?? {};

  /* Media from Firebase (or localStorage fallback) via context */
  const media = siteData.media ?? {};
  const coupleUrl = media.home_couple || localStorage.getItem("media_home_couple") || null;
  const heroBgUrl = media.home_herobg || localStorage.getItem("media_home_herobg") || null;
  const pageBgUrl = media.home_pagebg || localStorage.getItem("media_home_pagebg") || null;

  /* SVG replacement images via context */
  const gfx = key => ({ url: media[`graphic_home_${key}`] || localStorage.getItem(`graphic_home_${key}`) || null });

  /* Countdown */
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const target = new Date("2026-10-02T15:00:00");
    const tick = () => {
      const d = target - new Date();
      if (d <= 0) return setT({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setT({
        days:    Math.floor(d / 86400000),
        hours:   Math.floor((d % 86400000) / 3600000),
        minutes: Math.floor((d % 3600000)  / 60000),
        seconds: Math.floor((d % 60000)    / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 640);
  useEffect(() => {
    const fn = () => setIsDesktop(window.innerWidth >= 640);
    window.addEventListener("resize", fn, { passive: true });
    return () => window.removeEventListener("resize", fn);
  }, []);

  const SepDiv = () => g.dividers?.vis !== false
    ? <div style={{ width: "clamp(270px, 44vw, 437px)", margin: "0 auto", padding: "0 16px", boxSizing: "border-box" }}>
        <ImgSlot
          customUrl={gfx("dividers").url}
          base={homeBase("dividers")}
          svg={<BotDiv color={C.olive} />}
          imgStyle={{ width: "100%", display: "block" }}
        />
      </div>
    : null;

  return (
    <div style={{
      background: pageBgUrl ? `url(${pageBgUrl}) center/cover fixed` : C.cream,
      minHeight: "100vh", fontFamily: FONTS.body, color: C.dark, overflowX: "hidden",
    }}>

      {/* ══ HERO ══ */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "120px 20px 80px", position: "relative",
        overflow: "hidden", textAlign: "center",
        background: heroBgUrl ? `url(${heroBgUrl}) center/cover` : C.cream,
      }}>
        {heroBgUrl && <div style={{ position: "absolute", inset: 0, background: C.cream + "CC" }} />}
        <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>

          {/* ── Rami ulivo agli angoli ── */}
          <div style={{ position: "absolute", top: 0, left: 0, opacity: .88, pointerEvents: "none" }}>
            <PhotoSlot up={gfx("olSx")} vis={g.olSx?.vis !== false} edit={false}
              size={isDesktop ? 372 : 140} base={homeBase("olSx")} svg={<OliveB scale={.86} color={C.gold} />} />
          </div>
          <div style={{ position: "absolute", top: 0, right: 0, opacity: .88, pointerEvents: "none", transform: "scaleX(-1)" }}>
            <PhotoSlot up={gfx("olDx")} vis={g.olDx?.vis !== false} edit={false}
              size={isDesktop ? 372 : 140} base={homeBase("olDx")} svg={<OliveB flip scale={.86} color={C.gold} />} />
          </div>

          {/* ── Cocktail — sinistra, alta (mobile: ridotto) ── */}
          <div style={{ position: "absolute", top: isDesktop ? "21%" : "38%", left: 8, opacity: .56, transform: "rotate(-14deg)", pointerEvents: "none" }}>
            <PhotoSlot up={gfx("cocktail")} vis={g.cocktail?.vis !== false} edit={false}
              size={isDesktop ? 156 : 72} base={homeBase("cocktail")} svg={<Cocktail color={C.rose} />} />
          </div>

          {/* ── Vino — destra, alta (mobile: ridotto e spostato) ── */}
          <div style={{ position: "absolute", top: isDesktop ? "17%" : "35%", right: 10, opacity: .60, transform: "rotate(11deg)", pointerEvents: "none" }}>
            <PhotoSlot up={gfx("wineHero")} vis={g.wineHero?.vis !== false} edit={false}
              size={isDesktop ? 149 : 68} base={homeBase("wineHero")} svg={<Wine color={C.dark} wc={C.rose} />} />
          </div>

          {/* ── Anelli — destra, centro ── */}
          <div style={{ position: "absolute", top: isDesktop ? "44%" : "52%", right: isDesktop ? 85 : 8, opacity: .68, transform: "rotate(-7deg)", pointerEvents: "none" }}>
            <PhotoSlot up={gfx("rings")} vis={g.rings?.vis !== false} edit={false}
              size={isDesktop ? 216 : 72} base={homeBase("rings")} svg={<Rings color={C.gold} />} />
          </div>

          {/* ── Torta — sinistra, bassa ── */}
          <div style={{ position: "absolute", top: isDesktop ? "62%" : "60%", left: isDesktop ? 59 : 4, opacity: .55, transform: "rotate(9deg)", pointerEvents: "none" }}>
            <PhotoSlot up={gfx("cake")} vis={g.cake?.vis !== false} edit={false}
              size={isDesktop ? 243 : 72} base={homeBase("cake")} svg={<Cake color={C.gold} />} />
          </div>

          {/* ── Grappolo — destra, bassa ── */}
          <div style={{ position: "absolute", top: isDesktop ? "65%" : "68%", right: isDesktop ? 24 : 4, opacity: .62, transform: "rotate(5deg)", pointerEvents: "none" }}>
            <PhotoSlot up={gfx("grape")} vis={g.grape?.vis !== false} edit={false}
              size={isDesktop ? 197 : 68} base={homeBase("grape")} svg={<Grape color={C.olive} gc="#9B72CF" />} />
          </div>

          {/* Names */}
          <p className="a0" style={{ fontFamily: FONTS.body, fontStyle: "italic", fontSize: 18, letterSpacing: ".22em", color: C.rose, marginBottom: 20 }}>Ci sposiamo! ♡</p>
          <h1 className="a1" style={{ fontFamily: FONTS.script, fontSize: "clamp(44px,9vw,94px)", color: C.olive, lineHeight: 1.1, fontWeight: 700, marginBottom: 4 }}>Maria Cristina</h1>
          <p className="a1" style={{ fontFamily: FONTS.body, fontStyle: "italic", fontSize: 22, color: C.olive, marginBottom: 4 }}>e</p>
          <h1 className="a1" style={{ fontFamily: FONTS.script, fontSize: "clamp(44px,9vw,94px)", color: C.olive, lineHeight: 1.1, fontWeight: 700, marginBottom: 24 }}>Flavio</h1>

          <div className="a2" style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 38, justifyContent: "center" }}>
            <div style={{ height: 1, width: 46, background: C.gold, opacity: .55 }} />
            <p style={{ fontFamily: FONTS.body, fontSize: 17, letterSpacing: ".2em", color: C.dark, opacity: .7 }}>2 OTTOBRE 2026 · ROMA</p>
            <div style={{ height: 1, width: 46, background: C.gold, opacity: .55 }} />
          </div>

          {/* Couple photo */}
          {g.couplePhoto?.vis !== false && (
            <div className="a2" style={{
              width: "100%", maxWidth: 272, aspectRatio: "3/4",
              border: coupleUrl ? "none" : `2px dashed ${C.olive}55`,
              borderRadius: 10, overflow: "hidden", marginBottom: 38,
              background: coupleUrl ? "transparent" : `${C.olive}06`,
            }}>
              {coupleUrl
                ? <img src={coupleUrl} alt="Sposi" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                : (
                  <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <span style={{ fontSize: 30 }}>📷</span>
                    <span style={{ fontFamily: FONTS.body, fontSize: 12, color: C.olive, opacity: .42, letterSpacing: ".18em", textTransform: "uppercase" }}>
                      Foto sposi
                    </span>
                  </div>
                )
              }
            </div>
          )}

          <a href="#info" className="wc-cta a3"
            style={{ fontFamily: FONTS.body, fontSize: 14, letterSpacing: ".18em", textTransform: "uppercase", color: C.olive, border: `1.2px solid ${C.olive}`, padding: "12px 34px", borderRadius: 2, textDecoration: "none", display: "inline-block", background: "transparent" }}>
            Conferma la tua presenza →
          </a>
        </div>
      </section>

      {/* ── Separator ── */}
      <div style={{ display: "flex", justifyContent: "center", padding: "4px 16px", opacity: .8 }}><SepDiv /></div>

      {/* ── Countdown ── */}
      {g.countdownSection?.vis !== false && (
        <section style={{ padding: "68px 20px", textAlign: "center", background: C.cream, position: "relative" }}>
          {/* ── Luna — angolo in alto a destra (solo desktop) ── */}
          {isDesktop && (
            <div style={{ position: "absolute", top: 22, right: 30, opacity: .58, transform: "rotate(-13deg)", pointerEvents: "none" }}>
              <PhotoSlot up={gfx("moon")} vis={g.moon?.vis !== false} edit={false}
                size={170} base={homeBase("moon")} svg={<Moon color={C.gold} />} />
            </div>
          )}
          <p style={{ fontFamily: FONTS.body, fontStyle: "italic", fontSize: 20, color: C.rose, marginBottom: 46, letterSpacing: ".1em" }}>Mancano ancora…</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "clamp(14px,4vw,62px)", flexWrap: "wrap", alignItems: "flex-start" }}>
            {[{ v: t.days, l: "Giorni" }, { v: t.hours, l: "Ore" }, { v: t.minutes, l: "Minuti" }, { v: t.seconds, l: "Secondi" }].map(({ v, l }, i) => (
              <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 64, position: "relative" }}>
                {i > 0 && <span className="fp" style={{ position: "absolute", left: -18, top: 8, fontFamily: FONTS.serif, fontSize: 36, color: C.gold, lineHeight: 1 }}>:</span>}
                <span style={{ fontFamily: FONTS.serif, fontSize: "clamp(44px,7vw,76px)", fontWeight: 700, color: C.olive, lineHeight: 1 }}>{String(v || 0).padStart(2, "0")}</span>
                <span style={{ fontFamily: FONTS.body, fontSize: 10, letterSpacing: ".28em", textTransform: "uppercase", color: C.dark, opacity: .42, marginTop: 7 }}>{l}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Separator ── */}
      <div style={{ display: "flex", justifyContent: "center", padding: "4px 16px", opacity: .8 }}><SepDiv /></div>

      {/* ── Info cards ── */}
      {g.infoSection?.vis !== false && (
        <section id="info" style={{ padding: "68px 20px", maxWidth: 1060, margin: "0 auto" }}>
          <h2 style={{ fontFamily: FONTS.serif, fontSize: "clamp(24px,4vw,40px)", color: C.olive, textAlign: "center", marginBottom: 50, fontWeight: 400, fontStyle: "italic" }}>
            Dove &amp; Quando
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 22 }}>

            {/* Card Cerimonia */}
            <div className="wc-card" style={{ background: C.card, border: `1px solid ${C.olive}1A`, borderRadius: 10, padding: "38px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 13, boxShadow: "0 4px 18px rgba(0,0,0,.05)" }}>
              <PhotoSlot up={gfx("churchCard")} vis={g.churchCard?.vis !== false} edit={false} size={105} base={homeBase("churchCard")} svg={<Church color={C.olive} />} />
              <h3 style={{ fontFamily: FONTS.serif, fontSize: 20, color: C.olive, fontWeight: 400, fontStyle: "italic" }}>Cerimonia</h3>
              <div style={{ height: 1, width: 38, background: C.gold, opacity: .5 }} />
              <div style={{ fontFamily: FONTS.body, fontSize: 15, lineHeight: 1.8, color: C.dark }}>
                <strong style={{ fontWeight: 400, color: C.olive }}>{siteData.luogoCerimonia}</strong><br />
                <span style={{ fontSize: 13, opacity: .55 }}>{siteData.indirizzoCerimonia}</span><br />
                <span style={{ fontFamily: FONTS.serif, fontStyle: "italic", color: C.olive, fontSize: 16 }}>Ore {siteData.oraCerimonia}</span>
              </div>
              <a href={siteData.mapsCerimonia} target="_blank" rel="noopener noreferrer" className="wc-nl"
                style={{ fontFamily: FONTS.body, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: C.olive, textDecoration: "none", borderBottom: `1px solid ${C.olive}44`, paddingBottom: 2 }}>
                Apri in Maps →
              </a>
            </div>

            {/* Card Ricevimento */}
            <div className="wc-card" style={{ background: C.card, border: `1px solid ${C.olive}1A`, borderRadius: 10, padding: "38px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 13, boxShadow: "0 4px 18px rgba(0,0,0,.05)" }}>
              <PhotoSlot up={gfx("wineCard")} vis={g.wineCard?.vis !== false} edit={false} size={105} base={homeBase("wineCard")} svg={<Wine color={C.gold} wc={C.rose} />} />
              <h3 style={{ fontFamily: FONTS.serif, fontSize: 20, color: C.olive, fontWeight: 400, fontStyle: "italic" }}>Ricevimento</h3>
              <div style={{ height: 1, width: 38, background: C.gold, opacity: .5 }} />
              <div style={{ fontFamily: FONTS.body, fontSize: 15, lineHeight: 1.8, color: C.dark }}>
                <strong style={{ fontWeight: 400, color: C.olive }}>{siteData.luogoRicevimento}</strong><br />
                <span style={{ fontSize: 13, opacity: .55 }}>{siteData.indirizzoRicevimento}</span><br />
                <span style={{ fontFamily: FONTS.serif, fontStyle: "italic", color: C.olive, fontSize: 16 }}>A seguire la cerimonia</span>
              </div>
              <a href={siteData.mapsRicevimento} target="_blank" rel="noopener noreferrer" className="wc-nl"
                style={{ fontFamily: FONTS.body, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: C.olive, textDecoration: "none", borderBottom: `1px solid ${C.olive}44`, paddingBottom: 2 }}>
                Apri in Maps →
              </a>
            </div>

            {/* Card RSVP */}
            <div className="wc-card" style={{ background: C.card, border: `1px solid ${C.olive}1A`, borderRadius: 10, padding: "38px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 13, boxShadow: "0 4px 18px rgba(0,0,0,.05)" }}>
              <PhotoSlot up={gfx("rsvpCard")} vis={g.rsvpCard?.vis !== false} edit={false} size={105} base={homeBase("rsvpCard")} svg={<HeartSVG color={C.olive} />} />
              <h3 style={{ fontFamily: FONTS.serif, fontSize: 20, color: C.olive, fontWeight: 400, fontStyle: "italic" }}>RSVP</h3>
              <div style={{ height: 1, width: 38, background: C.gold, opacity: .5 }} />
              <div style={{ fontFamily: FONTS.body, fontSize: 15, lineHeight: 1.8, color: C.dark }}>
                Ci farebbe immensamente piacere<br />averti con noi!<br />
                <span style={{ fontFamily: FONTS.serif, fontStyle: "italic", color: C.olive, fontSize: 16 }}>
                  Conferma entro il {siteData.scadenzaRsvp}
                </span>
              </div>
              <Link to="/rsvp" className="wc-nl"
                style={{ fontFamily: FONTS.body, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", color: C.olive, textDecoration: "none", borderBottom: `1px solid ${C.olive}44`, paddingBottom: 2 }}>
                Rispondi qui →
              </Link>
            </div>

          </div>
        </section>
      )}

      {/* ── Separator ── */}
      <div style={{ display: "flex", justifyContent: "center", padding: "4px 16px 38px", opacity: .65 }}><SepDiv /></div>
    </div>
  );
}
