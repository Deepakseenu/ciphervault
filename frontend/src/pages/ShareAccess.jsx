import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { accessShareLink } from "../services/api";

function ShareAccess() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  useEffect(() => { fetchSharedData(); }, []);

  const fetchSharedData = async () => {
    try {
      const res = await accessShareLink(token);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired share link");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const glowStyle = {
    minHeight: "100vh",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 16,
    fontFamily: "Courier New, monospace",
    background: "#060612",
    backgroundImage: `radial-gradient(ellipse at 50% 40%, rgba(83,74,183,0.2) 0%, transparent 60%)`
  };

  if (loading) return (
    <div style={{ ...glowStyle, flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 24 }}>🔐</div>
      <div style={{ color: "#534AB7", fontSize: 13, letterSpacing: "0.1em" }}>
        &gt; decrypting shared data...
      </div>
    </div>
  );

  if (error) return (
    <div style={{ ...glowStyle, flexDirection: "column", gap: 16 }}>
      <div style={{
        background: "linear-gradient(145deg, #0e0e22, #0a0a18)",
        border: "1px solid rgba(226,75,74,0.3)",
        borderRadius: 16, padding: 32, maxWidth: 400, width: "100%", textAlign: "center"
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
        <h2 style={{ fontSize: 14, color: "#E24B4A", letterSpacing: "0.1em", marginBottom: 10 }}>
          ACCESS DENIED
        </h2>
        <p style={{ fontSize: 12, color: "#4a4a7a", lineHeight: 1.6 }}>{error}</p>
        <div style={{ marginTop: 16, fontSize: 11, color: "#3a3a5a" }}>
          This link may have expired or already been used
        </div>
      </div>
    </div>
  );

  return (
    <div style={glowStyle}>
      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 60, height: 60, borderRadius: 16, marginBottom: 12,
            background: "linear-gradient(135deg, #1a1040, #2a1a60)",
            border: "1px solid #534AB7",
            boxShadow: "0 0 24px rgba(83,74,183,0.3)"
          }}>
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <rect x="7" y="16" width="22" height="17" rx="4" fill="#1a1040" stroke="#7F77DD" strokeWidth="1.5"/>
              <path d="M11 16V12a7 7 0 0114 0v4" stroke="#7F77DD" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="18" cy="25" r="2.5" fill="#534AB7"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: "bold", color: "#e2e8f0", letterSpacing: "0.15em", marginBottom: 4 }}>
            CIPHERVAULT
          </h1>
          <p style={{ fontSize: 11, color: "#534AB7", letterSpacing: "0.1em" }}>SECURE SHARE ACCESS</p>
        </div>

        {/* Warning */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 14px", borderRadius: 8, marginBottom: 20,
          background: "rgba(239,159,39,0.08)", border: "1px solid rgba(239,159,39,0.3)"
        }}>
          <span style={{ fontSize: 14 }}>⚠️</span>
          <span style={{ fontSize: 11, color: "#EF9F27", letterSpacing: "0.06em" }}>
            ONE-TIME ACCESS — this link has now been permanently invalidated
          </span>
        </div>

        {/* Shared data card */}
        <div style={{
          background: "linear-gradient(145deg, #0e0e22, #0a0a18)",
          border: "1px solid rgba(83,74,183,0.3)",
          borderRadius: 16, padding: 24,
          boxShadow: "0 0 40px rgba(83,74,183,0.15)"
        }}>
          <p style={{ fontSize: 11, color: "#4a4a7a", letterSpacing: "0.08em", marginBottom: 20 }}>
            &gt; shared credential data
          </p>

          {[
            { label: "SITE_NAME", value: data.data.siteName, key: "site" },
            { label: "SITE_URL", value: data.data.siteUrl || "—", key: "url" },
            { label: "USERNAME", value: data.data.username, key: "user" },
            { label: "PASSWORD", value: data.data.password, key: "pass" },
          ].map(field => (
            <div key={field.key} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 10, color: "#7F77DD", letterSpacing: "0.12em", marginBottom: 6 }}>
                &gt; {field.label}
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  flex: 1, padding: "10px 14px", borderRadius: 8,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(83,74,183,0.2)",
                  color: "#e2e8f0", fontSize: 13,
                  fontFamily: "Courier New, monospace",
                  wordBreak: "break-all"
                }}>
                  {field.value}
                </div>
                <button onClick={() => copyToClipboard(field.value, field.key)} style={{
                  padding: "10px 12px", borderRadius: 8, flexShrink: 0,
                  border: `1px solid ${copied === field.key ? "rgba(29,158,117,0.4)" : "rgba(83,74,183,0.3)"}`,
                  background: copied === field.key ? "rgba(29,158,117,0.1)" : "transparent",
                  color: copied === field.key ? "#1D9E75" : "#7F77DD",
                  fontSize: 11, cursor: "pointer", fontFamily: "Courier New, monospace"
                }}>
                  {copied === field.key ? "✓" : "copy"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: "#2a2a4a", letterSpacing: "0.06em" }}>
          powered by CipherVault — military-grade AES-256 encryption
        </p>
      </div>
    </div>
  );
}

export default ShareAccess;