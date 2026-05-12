export default function PhotoSlot({ up, vis, edit, size = 58, svg }) {
  if (!vis) return null;
  const content = up.url
    ? <img src={up.url} alt="" style={{ width: size, height: size, objectFit: "contain" }} />
    : svg;
  if (!edit) {
    return (
      <div style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        {content}
      </div>
    );
  }
  return (
    <div
      onClick={up.trigger}
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
