import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Axevia — Research Grade Peptides";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0a0a0a",
          color: "#ffffff",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: 22,
              background: "#ffffff",
              color: "#0a0a0a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
              fontWeight: 800,
            }}
          >
            A
          </div>
          <div style={{ fontSize: 40, letterSpacing: 12, fontWeight: 700 }}>AXEVIA</div>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginTop: 48,
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.05,
          }}
        >
          <span>Purity you can&nbsp;</span>
          <span style={{ color: "#2563eb" }}>verify.</span>
        </div>
        <div style={{ marginTop: 28, fontSize: 30, color: "rgba(255,255,255,0.7)" }}>
          High-purity, third-party tested research peptides.
        </div>
        <div style={{ marginTop: 40, fontSize: 20, letterSpacing: 6, color: "rgba(255,255,255,0.5)" }}>
          RESEARCH USE ONLY
        </div>
      </div>
    ),
    { ...size },
  );
}
