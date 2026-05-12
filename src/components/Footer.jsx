import { COLORS, FONTS, Moon, Rings } from "../designSystem";
import { useSite } from "../context/SiteContext";

export default function Footer() {
  const { siteData } = useSite();
  const C = COLORS;

  return (
    <footer style={{
      padding: "52px 20px 90px",
      textAlign: "center",
      borderTop: `1px solid ${C.olive}18`,
      background: C.cream,
    }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14, opacity: .82 }}>
        <Moon color={C.gold} />
      </div>
      <p style={{ fontFamily: FONTS.script, fontSize: "clamp(20px,3.5vw,30px)", color: C.olive, lineHeight: 1.4 }}>
        Con amore, {siteData.nomi} 🤍
      </p>
      <div style={{ display: "flex", justifyContent: "center", margin: "13px 0", opacity: .55 }}>
        <Rings color={C.gold} />
      </div>
      <p style={{ fontFamily: FONTS.body, fontSize: 11, color: C.dark, opacity: .35, letterSpacing: ".24em", textTransform: "uppercase" }}>
        {siteData.data} · Roma
      </p>
    </footer>
  );
}
