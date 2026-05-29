import { COLORS, FONTS, Moon, Rings } from "../designSystem";
import { useSite } from "../context/SiteContext";
import PhotoSlot from "./PhotoSlot";

const B = import.meta.env.BASE_URL;

export default function Footer() {
  const { siteData } = useSite();
  const C = COLORS;

  const gf = siteData.graphics?.footer ?? {};
  const media = siteData.media ?? {};
  const gfx = (key) => ({ url: media[`graphic_footer_${key}`] || null });
  const base = (key) => `${B}media/graphic_footer_${key}.png`;

  return (
    <footer style={{
      padding: "52px 20px 90px",
      textAlign: "center",
      borderTop: `1px solid ${C.olive}18`,
      background: C.cream,
    }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14, opacity: .82 }}>
        <PhotoSlot up={gfx("moon")} vis={gf.moon?.vis !== false} edit={false}
          size={48} base={base("moon")} svg={<Moon color={C.gold} />} />
      </div>
      <p style={{ fontFamily: FONTS.script, fontSize: "clamp(20px,3.5vw,30px)", color: C.olive, lineHeight: 1.4 }}>
        Con amore, {siteData.nomi} 🤍
      </p>
      <div style={{ display: "flex", justifyContent: "center", margin: "13px 0", opacity: .55 }}>
        <PhotoSlot up={gfx("rings")} vis={gf.rings?.vis !== false} edit={false}
          size={48} base={base("rings")} svg={<Rings color={C.gold} />} />
      </div>
      <p style={{ fontFamily: FONTS.body, fontSize: 11, color: C.dark, opacity: .35, letterSpacing: ".24em", textTransform: "uppercase" }}>
        {siteData.data} · Roma
      </p>
    </footer>
  );
}
