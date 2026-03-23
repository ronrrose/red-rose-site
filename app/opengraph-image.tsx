import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Red Rose Technologies — IT, AI & Automation for Local Businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #e63946, #c1121f)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              color: "white",
              fontWeight: 800,
            }}
          >
            RR
          </div>
          <div
            style={{
              fontSize: "48px",
              fontWeight: 800,
              color: "white",
              textAlign: "center",
              lineHeight: 1.2,
            }}
          >
            Red Rose Technologies
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#94a3b8",
              textAlign: "center",
              maxWidth: "800px",
              lineHeight: 1.5,
            }}
          >
            IT, AI & Automation for Local Businesses
          </div>
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "16px",
            }}
          >
            {["HIPAA Compliant", "Google AI Certified", "24/7 Monitoring"].map(
              (item) => (
                <div
                  key={item}
                  style={{
                    padding: "8px 20px",
                    borderRadius: "999px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#cbd5e1",
                    fontSize: "14px",
                  }}
                >
                  {item}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
