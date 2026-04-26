import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: "", email: "", masterPassword: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getStrength = (pw) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strengthLabel = ["", "very weak", "weak", "moderate", "strong", "very strong"];
  const strengthColor = ["", "#E24B4A", "#E24B4A", "#BA7517", "#1D9E75", "#1D9E75"];
  const strength = getStrength(formData.masterPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.masterPassword !== formData.confirm) {
      return setError("Passwords do not match.");
    }
    if (strength < 3) {
      return setError("Master password is too weak. Use 8+ chars, numbers and symbols.");
    }
    setLoading(true);
    try {
      const res = await registerUser({
        username: formData.username,
        email: formData.email,
        masterPassword: formData.masterPassword
      });
      login(res.data.user, res.data.token);
      navigate("/vault");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: "#0a0a0f" }}>
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: "#1a1a2e", border: "1px solid #534AB7" }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="6" y="14" width="20" height="16" rx="3" stroke="#7F77DD" strokeWidth="1.5"/>
              <path d="M10 14V10a6 6 0 0112 0v4" stroke="#7F77DD" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="16" cy="22" r="2" fill="#534AB7"/>
              <line x1="16" y1="24" x2="16" y2="27" stroke="#534AB7" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-widest" style={{ color: "#e2e8f0" }}>CIPHERVAULT</h1>
          <p className="text-xs tracking-widest mt-1" style={{ color: "#534AB7" }}>CREATE SECURE ACCOUNT</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: "#0d0d1a", border: "1px solid #1e1e3a" }}>

          <p className="text-xs tracking-widest mb-6" style={{ color: "#4a4a6a" }}>
            &gt; initialize new vault
          </p>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg text-xs tracking-wide" style={{ background: "#1a0a0a", border: "1px solid #A32D2D", color: "#F09595" }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xs tracking-widest mb-2" style={{ color: "#534AB7" }}>&gt; USERNAME</label>
              <input
                type="text" name="username" value={formData.username}
                onChange={handleChange} required placeholder="your_username"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                style={{ background: "#0a0a0f", border: "1px solid #1e1e3a", color: "#e2e8f0", fontFamily: "Courier New, monospace" }}
                onFocus={e => e.target.style.borderColor = "#534AB7"}
                onBlur={e => e.target.style.borderColor = "#1e1e3a"}
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs tracking-widest mb-2" style={{ color: "#534AB7" }}>&gt; EMAIL_ADDRESS</label>
              <input
                type="email" name="email" value={formData.email}
                onChange={handleChange} required placeholder="user@domain.com"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                style={{ background: "#0a0a0f", border: "1px solid #1e1e3a", color: "#e2e8f0", fontFamily: "Courier New, monospace" }}
                onFocus={e => e.target.style.borderColor = "#534AB7"}
                onBlur={e => e.target.style.borderColor = "#1e1e3a"}
              />
            </div>

            <div className="mb-2">
              <label className="block text-xs tracking-widest mb-2" style={{ color: "#534AB7" }}>&gt; MASTER_PASSWORD</label>
              <input
                type="password" name="masterPassword" value={formData.masterPassword}
                onChange={handleChange} required placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                style={{ background: "#0a0a0f", border: "1px solid #1e1e3a", color: "#e2e8f0", fontFamily: "Courier New, monospace" }}
                onFocus={e => e.target.style.borderColor = "#534AB7"}
                onBlur={e => e.target.style.borderColor = "#1e1e3a"}
              />
            </div>

            {/* Strength meter */}
            {formData.masterPassword && (
              <div className="mb-4">
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all"
                      style={{ background: i <= strength ? strengthColor[strength] : "#1e1e3a" }}
                    />
                  ))}
                </div>
                <p className="text-xs" style={{ color: strengthColor[strength] }}>
                  strength: {strengthLabel[strength]}
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-xs tracking-widest mb-2" style={{ color: "#534AB7" }}>&gt; CONFIRM_PASSWORD</label>
              <input
                type="password" name="confirm" value={formData.confirm}
                onChange={handleChange} required placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                style={{ background: "#0a0a0f", border: "1px solid #1e1e3a", color: "#e2e8f0", fontFamily: "Courier New, monospace" }}
                onFocus={e => e.target.style.borderColor = "#534AB7"}
                onBlur={e => e.target.style.borderColor = "#1e1e3a"}
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-bold tracking-widest transition-all"
              style={{
                background: loading ? "#1a1a2e" : "#534AB7",
                color: loading ? "#4a4a6a" : "#ffffff",
                border: "1px solid #534AB7",
                fontFamily: "Courier New, monospace",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "> initializing vault..." : "> create vault"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-xs" style={{ color: "#4a4a6a" }}>already have vault? </span>
            <Link to="/login" className="text-xs tracking-widest" style={{ color: "#534AB7" }}>
              login_here →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Register;