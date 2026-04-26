import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", masterPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser(formData);
      login(res.data.user, res.data.token);
      navigate("/vault");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      background: "#060612",
      backgroundImage: `
        radial-gradient(ellipse at 20% 30%, rgba(83,74,183,0.25) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 70%, rgba(29,158,117,0.15) 0%, transparent 50%)
      `
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 72, height: 72, borderRadius: 20, marginBottom: 16,
            background: "linear-gradient(135deg, #1a1040 0%, #2a1a60 100%)",
            border: "1px solid #534AB7",
            boxShadow: "0 0 32px rgba(83,74,183,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
          }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect x="7" y="16" width="22" height="17" rx="4" fill="#1a1040" stroke="#7F77DD" strokeWidth="1.5"/>
              <path d="M11 16V12a7 7 0 0114 0v4" stroke="#7F77DD" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="18" cy="25" r="2.5" fill="#534AB7"/>
              <line x1="18" y1="27.5" x2="18" y2="30" stroke="#534AB7" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: "bold", letterSpacing: "0.2em", color: "#ffffff", marginBottom: 6 }}>CIPHERVAULT</h1>
          <p style={{ fontSize: 11, letterSpacing: "0.15em", color: "#534AB7" }}>MILITARY-GRADE PASSWORD SECURITY</p>
        </div>

        {/* Card */}
        <div style={{
          borderRadius: 20,
          padding: "32px 28px",
          background: "linear-gradient(145deg, #0d0d20 0%, #0a0a18 100%)",
          border: "1px solid rgba(83,74,183,0.3)",
          boxShadow: "0 0 60px rgba(83,74,183,0.1), 0 24px 48px rgba(0,0,0,0.5)"
        }}>

          {/* Status */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 14px", borderRadius: 8, marginBottom: 24,
            background: "rgba(29,158,117,0.08)",
            border: "1px solid rgba(29,158,117,0.25)"
          }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#1D9E75", boxShadow: "0 0 8px #1D9E75" }}></div>
            <span style={{ fontSize: 11, color: "#1D9E75", letterSpacing: "0.08em" }}>
              SYSTEM SECURE · AES-256 · ZERO-KNOWLEDGE ARCHITECTURE
            </span>
          </div>

          <p style={{ fontSize: 12, color: "#4a4a7a", letterSpacing: "0.08em", marginBottom: 24 }}>
            &gt; authenticate to unlock your vault
          </p>

          {error && (
            <div style={{
              marginBottom: 16, padding: "10px 14px", borderRadius: 8,
              background: "rgba(162,45,45,0.1)", border: "1px solid rgba(162,45,45,0.4)",
              color: "#F09595", fontSize: 12, letterSpacing: "0.04em"
            }}>⚠ {error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 10, color: "#7F77DD", letterSpacing: "0.12em", marginBottom: 8 }}>
                &gt; EMAIL_ADDRESS
              </label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required
                placeholder="user@domain.com"
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 10,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(83,74,183,0.25)",
                  color: "#e2e8f0", fontSize: 13, fontFamily: "Courier New, monospace", outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={e => { e.target.style.borderColor = "#534AB7"; e.target.style.boxShadow = "0 0 16px rgba(83,74,183,0.2)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(83,74,183,0.25)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 10, color: "#7F77DD", letterSpacing: "0.12em", marginBottom: 8 }}>
                &gt; MASTER_PASSWORD
              </label>
              <input type="password" name="masterPassword" value={formData.masterPassword} onChange={handleChange} required
                placeholder="••••••••••••••"
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 10,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(83,74,183,0.25)",
                  color: "#e2e8f0", fontSize: 13, fontFamily: "Courier New, monospace", outline: "none"
                }}
                onFocus={e => { e.target.style.borderColor = "#534AB7"; e.target.style.boxShadow = "0 0 16px rgba(83,74,183,0.2)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(83,74,183,0.25)"; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <button type="submit" disabled={loading}
              style={{
                width: "100%", padding: "12px", borderRadius: 10,
                background: loading ? "rgba(83,74,183,0.3)" : "linear-gradient(135deg, #534AB7 0%, #7F77DD 100%)",
                color: loading ? "#4a4a6a" : "#ffffff",
                border: "1px solid rgba(83,74,183,0.5)",
                fontSize: 13, fontWeight: "bold", letterSpacing: "0.12em",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "Courier New, monospace",
                boxShadow: loading ? "none" : "0 0 24px rgba(83,74,183,0.4)"
              }}>
              {loading ? "> authenticating..." : "> unlock vault"}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: "center" }}>
            <span style={{ fontSize: 12, color: "#3a3a5a" }}>no account? </span>
            <Link to="/register" style={{ fontSize: 12, color: "#7F77DD", letterSpacing: "0.06em", textDecoration: "none" }}>
              register_here →
            </Link>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "#2a2a4a", letterSpacing: "0.06em" }}>
          protected by military-grade AES-256 encryption
        </p>
      </div>
    </div>
  );
}

export default Login;