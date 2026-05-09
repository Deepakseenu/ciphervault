import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPasswords, addPassword, updatePassword, deletePassword, createShareLink, exportVault } from "../services/api";

function Vault() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [copied, setCopied] = useState("");
  const [formData, setFormData] = useState({ siteName: "", siteUrl: "", username: "", password: "", category: "other", notes: "" });
  const [formError, setFormError] = useState("");
  const [sessionTime, setSessionTime] = useState(900);
  const [shareModal, setShareModal] = useState(null);
  const [shareLink, setShareLink] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchPasswords();
    const timer = setInterval(() => setSessionTime(t => {
      if (t <= 1) { handleLogout(); return 0; }
      return t - 1;
    }), 1000);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => { clearInterval(timer); window.removeEventListener("resize", handleResize); };
  }, []);

  const fetchPasswords = async () => {
    try {
      // Try online first
      const res = await getPasswords();
      setPasswords(res.data);
      // Cache locally for offline
      localStorage.setItem("cv_passwords_cache", JSON.stringify(res.data));
      localStorage.setItem("cv_cache_time", Date.now().toString());
    } catch (err) {
      // Fallback to local cache if offline
      const cached = localStorage.getItem("cv_passwords_cache");
      if (cached) {
        setPasswords(JSON.parse(cached));
        console.log("📦 Loaded from offline cache");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };
  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const getStrength = (pw) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strengthColor = ["", "#E24B4A", "#E24B4A", "#BA7517", "#1D9E75", "#1D9E75"];
  const strengthLabel = ["", "very weak", "weak", "moderate", "strong", "very strong"];

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=";
    let pw = "";
    for (let i = 0; i < 16; i++) pw += chars[Math.floor(Math.random() * chars.length)];
    setFormData(f => ({ ...f, password: pw }));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 2000);
  };

  const toggleVisible = (id) => setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));

  const openAddForm = () => {
    setEditEntry(null);
    setFormData({ siteName: "", siteUrl: "", username: "", password: "", category: "other", notes: "" });
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (entry) => {
    setEditEntry(entry);
    setFormData({ siteName: entry.siteName, siteUrl: entry.siteUrl || "", username: entry.username, password: entry.password, category: entry.category, notes: entry.notes || "" });
    setFormError("");
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.siteName || !formData.username || !formData.password)
      return setFormError("Site name, username and password are required.");
    try {
      if (editEntry) await updatePassword(editEntry._id, formData);
      else await addPassword(formData);
      setShowForm(false);
      fetchPasswords();
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry? This cannot be undone.")) return;
    await deletePassword(id);
    fetchPasswords();
  };

  const handleShare = async (entry) => {
    setShareLink("");
    setShareModal(entry);
    setShareLoading(true);
    try {
      const res = await createShareLink(entry._id);
      setShareLink(res.data.shareUrl);
    } catch (err) {
      setShareLink("Error generating link. Try again.");
    } finally {
      setShareLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await exportVault();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ciphervault-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Export failed. Make sure you are online.");
    }
  };

  const categoryColor = {
    social:   { bg: "rgba(83,74,183,0.12)",  border: "rgba(83,74,183,0.35)",  text: "#7F77DD" },
    banking:  { bg: "rgba(29,158,117,0.12)", border: "rgba(29,158,117,0.35)", text: "#1D9E75" },
    work:     { bg: "rgba(55,138,221,0.12)", border: "rgba(55,138,221,0.35)", text: "#378ADD" },
    shopping: { bg: "rgba(239,159,39,0.12)", border: "rgba(239,159,39,0.35)", text: "#EF9F27" },
    other:    { bg: "rgba(136,135,128,0.12)",border: "rgba(136,135,128,0.3)", text: "#888780" },
  };

  const getInitials = (name) => name.slice(0, 2).toUpperCase();

  const filtered = passwords.filter(p => {
    const matchSearch = p.siteName.toLowerCase().includes(search.toLowerCase()) ||
      p.username.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.category === filter;
    return matchSearch && matchFilter;
  });

  const strongCount = passwords.filter(p => getStrength(p.password) >= 4).length;
  const weakCount = passwords.filter(p => getStrength(p.password) < 3).length;
  const expiredCount = passwords.filter(p => p.needsUpdate).length;

  const glowStyle = {
    minHeight: "100vh",
    fontFamily: "Courier New, monospace",
    background: "#060612",
    backgroundImage: `
      radial-gradient(ellipse at 15% 15%, rgba(83,74,183,0.18) 0%, transparent 45%),
      radial-gradient(ellipse at 85% 85%, rgba(29,158,117,0.1) 0%, transparent 45%)
    `
  };

  const cardStyle = {
    background: "linear-gradient(145deg, #0e0e22 0%, #0a0a18 100%)",
    border: "1px solid rgba(83,74,183,0.2)",
    borderRadius: 12,
    boxShadow: "0 4px 24px rgba(0,0,0,0.4)"
  };

  return (
    <div style={glowStyle}>

      {/* Navbar */}
      <div style={{
        background: "linear-gradient(90deg, #08081a 0%, #0d0d22 100%)",
        borderBottom: "1px solid rgba(83,74,183,0.25)",
        padding: isMobile ? "10px 16px" : "12px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 4px 32px rgba(0,0,0,0.5)",
        position: "sticky", top: 0, zIndex: 40
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
            <rect x="7" y="16" width="22" height="17" rx="4" fill="#1a1040" stroke="#7F77DD" strokeWidth="1.5"/>
            <path d="M11 16V12a7 7 0 0114 0v4" stroke="#7F77DD" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="18" cy="25" r="2.5" fill="#534AB7"/>
          </svg>
          <span style={{ color: "#ffffff", fontSize: isMobile ? 12 : 14, fontWeight: "bold", letterSpacing: "0.15em" }}>
            CIPHERVAULT
          </span>
        </div>

        {/* Desktop nav */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "5px 12px", borderRadius: 8,
              background: sessionTime < 120 ? "rgba(162,45,45,0.12)" : "rgba(29,158,117,0.08)",
              border: `1px solid ${sessionTime < 120 ? "rgba(162,45,45,0.4)" : "rgba(29,158,117,0.3)"}`,
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: "50%",
                background: sessionTime < 120 ? "#E24B4A" : "#1D9E75",
                boxShadow: `0 0 8px ${sessionTime < 120 ? "#E24B4A" : "#1D9E75"}`
              }}></div>
              <span style={{ fontSize: 11, color: sessionTime < 120 ? "#E24B4A" : "#1D9E75", letterSpacing: "0.08em" }}>
                auto-lock {formatTime(sessionTime)}
              </span>
            </div>
            {[
              { label: "activity →", color: "#7F77DD", border: "rgba(83,74,183,0.25)", action: () => navigate("/activity") },
              { label: "analytics →", color: "#1D9E75", border: "rgba(29,158,117,0.25)", action: () => navigate("/analytics") },
              { label: "export →", color: "#EF9F27", border: "rgba(239,159,39,0.25)", action: handleExport },
            ].map((btn, i) => (
              <button key={i} onClick={btn.action} style={{
                fontSize: 11, padding: "5px 14px", borderRadius: 7,
                border: `1px solid ${btn.border}`, background: "transparent",
                color: btn.color, cursor: "pointer", fontFamily: "Courier New, monospace",
                letterSpacing: "0.06em"
              }}>{btn.label}</button>
            ))}
            <span style={{ fontSize: 11, color: "#4a4a7a" }}>{user?.email}</span>
            <button onClick={handleLogout} style={{
              fontSize: 11, padding: "5px 14px", borderRadius: 7,
              border: "1px solid rgba(83,74,183,0.25)", background: "transparent",
              color: "#7F77DD", cursor: "pointer", fontFamily: "Courier New, monospace"
            }}>logout →</button>
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button onClick={() => setMenuOpen(!menuOpen)} style={{
            background: "transparent", border: "1px solid rgba(83,74,183,0.3)",
            borderRadius: 6, padding: "5px 10px", color: "#7F77DD",
            fontSize: 16, cursor: "pointer"
          }}>☰</button>
        )}
      </div>

      {/* Mobile menu dropdown */}
      {isMobile && menuOpen && (
        <div style={{
          background: "#0d0d22", borderBottom: "1px solid rgba(83,74,183,0.2)",
          padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8,
          position: "sticky", top: 45, zIndex: 39
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "6px 12px", borderRadius: 8,
            background: "rgba(29,158,117,0.08)", border: "1px solid rgba(29,158,117,0.3)"
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1D9E75", boxShadow: "0 0 6px #1D9E75" }}></div>
            <span style={{ fontSize: 11, color: "#1D9E75" }}>auto-lock {formatTime(sessionTime)}</span>
          </div>
          <span style={{ fontSize: 11, color: "#4a4a7a" }}>{user?.email}</span>
          {[
            { label: "📋 activity log", color: "#7F77DD", action: () => { navigate("/activity"); setMenuOpen(false); } },
            { label: "📊 analytics", color: "#1D9E75", action: () => { navigate("/analytics"); setMenuOpen(false); } },
            { label: "📤 export vault", color: "#EF9F27", action: () => { handleExport(); setMenuOpen(false); } },
            { label: "🚪 logout", color: "#E24B4A", action: handleLogout },
          ].map((btn, i) => (
            <button key={i} onClick={btn.action} style={{
              fontSize: 12, padding: "8px 14px", borderRadius: 7, textAlign: "left",
              border: "1px solid rgba(83,74,183,0.15)", background: "rgba(83,74,183,0.05)",
              color: btn.color, cursor: "pointer", fontFamily: "Courier New, monospace"
            }}>{btn.label}</button>
          ))}
        </div>
      )}

      <div style={{ maxWidth: 900, margin: "0 auto", padding: isMobile ? "16px 12px" : "28px 20px" }}>

        {/* Stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)",
          gap: isMobile ? 8 : 14, marginBottom: isMobile ? 16 : 24
        }}>
          {[
            { label: "total saved",      value: passwords.length, color: "#e2e8f0", glow: "rgba(83,74,183,0.3)" },
            { label: "strong",           value: strongCount,      color: "#1D9E75", glow: "rgba(29,158,117,0.3)" },
            { label: "weak",             value: weakCount,        color: "#E24B4A", glow: "rgba(226,75,74,0.3)" },
            { label: "needs update",     value: expiredCount,     color: "#EF9F27", glow: "rgba(239,159,39,0.3)" },
          ].map((s, i) => (
            <div key={i} style={{ ...cardStyle, padding: isMobile ? "12px 14px" : "18px 20px" }}>
              <div style={{ fontSize: isMobile ? 22 : 28, fontWeight: "bold", color: s.color, textShadow: `0 0 20px ${s.glow}` }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "#4a4a7a", marginTop: 3, letterSpacing: "0.06em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search + Add */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 8,
            padding: "10px 14px", borderRadius: 10,
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(83,74,183,0.2)"
          }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="5.5" cy="5.5" r="4" stroke="#534AB7" strokeWidth="1.3"/>
              <path d="M9 9l2.5 2.5" stroke="#534AB7" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="search vault..."
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                color: "#e2e8f0", fontSize: 13, fontFamily: "Courier New, monospace"
              }}
            />
          </div>
          <button onClick={openAddForm} style={{
            padding: isMobile ? "10px 14px" : "10px 22px", borderRadius: 10,
            background: "linear-gradient(135deg, #534AB7 0%, #7F77DD 100%)",
            border: "1px solid rgba(83,74,183,0.5)",
            color: "#fff", fontSize: isMobile ? 11 : 12, fontWeight: "bold",
            cursor: "pointer", fontFamily: "Courier New, monospace",
            letterSpacing: "0.06em", boxShadow: "0 0 20px rgba(83,74,183,0.4)",
            whiteSpace: "nowrap"
          }}>{isMobile ? "+ add" : "+ add entry"}</button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
          {["all", "social", "banking", "work", "shopping", "other"].map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{
              fontSize: 11, padding: "3px 12px", borderRadius: 99,
              border: `1px solid ${filter === cat ? "rgba(83,74,183,0.6)" : "rgba(83,74,183,0.15)"}`,
              background: filter === cat ? "rgba(83,74,183,0.15)" : "transparent",
              color: filter === cat ? "#7F77DD" : "#4a4a7a",
              cursor: "pointer", fontFamily: "Courier New, monospace",
              boxShadow: filter === cat ? "0 0 12px rgba(83,74,183,0.2)" : "none"
            }}>{cat}</button>
          ))}
        </div>

        {/* Password list */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#534AB7", fontSize: 13, padding: 60, letterSpacing: "0.1em" }}>
            &gt; decrypting vault...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: "#3a3a6a", fontSize: 13, padding: 60, letterSpacing: "0.08em" }}>
            &gt; no entries found. add one above.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(entry => {
              const strength = getStrength(entry.password);
              const cat = categoryColor[entry.category] || categoryColor.other;
              const isVisible = visiblePasswords[entry._id];
              return (
                <div key={entry._id} style={{
                  ...cardStyle,
                  padding: isMobile ? "12px 14px" : "16px 18px",
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  alignItems: isMobile ? "flex-start" : "center",
                  gap: isMobile ? 10 : 16,
                  border: entry.needsUpdate
                    ? "1px solid rgba(239,159,39,0.3)"
                    : "1px solid rgba(83,74,183,0.2)"
                }}>
                  {/* Top row on mobile */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
                    {/* Icon */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: cat.bg, border: `1px solid ${cat.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: "bold", color: cat.text,
                      boxShadow: `0 0 12px ${cat.bg}`
                    }}>{getInitials(entry.siteName)}</div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: "bold", color: "#e2e8f0" }}>{entry.siteName}</span>
                        <span style={{
                          fontSize: 10, padding: "1px 7px", borderRadius: 99,
                          background: cat.bg, border: `1px solid ${cat.border}`, color: cat.text
                        }}>{entry.category}</span>
                        {entry.needsUpdate && (
                          <span style={{
                            fontSize: 10, padding: "1px 7px", borderRadius: 99,
                            background: "rgba(239,159,39,0.1)", border: "1px solid rgba(239,159,39,0.4)", color: "#EF9F27"
                          }}>⏰ {entry.daysSinceUpdate}d old</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: "#4a4a7a" }}>{entry.username}</div>
                    </div>
                  </div>

                  {/* Password row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                    <span style={{ fontSize: 12, color: "#6a6a9a", letterSpacing: isVisible ? "0.02em" : "0.12em", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {isVisible ? entry.password : "••••••••••"}
                    </span>
                    <button onClick={() => toggleVisible(entry._id)} style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 5, flexShrink: 0,
                      border: "1px solid rgba(83,74,183,0.2)", background: "transparent",
                      color: "#534AB7", cursor: "pointer", fontFamily: "Courier New, monospace"
                    }}>{isVisible ? "hide" : "show"}</button>
                  </div>

                  {/* Strength meter */}
                  <div style={{ display: "flex", alignItems: "center", gap: 3, width: "100%" }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{
                        height: 3, width: 18, borderRadius: 99,
                        background: i <= strength ? strengthColor[strength] : "rgba(255,255,255,0.05)",
                        boxShadow: i <= strength ? `0 0 6px ${strengthColor[strength]}` : "none"
                      }}/>
                    ))}
                    <span style={{ fontSize: 10, color: strengthColor[strength], marginLeft: 4 }}>
                      {strengthLabel[strength]}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: "flex",
                    flexDirection: isMobile ? "row" : "column",
                    gap: 6, flexShrink: 0,
                    width: isMobile ? "100%" : "auto"
                  }}>
                    {[
                      { label: copied === entry._id ? "copied!" : "copy", color: copied === entry._id ? "#1D9E75" : "#7F77DD", border: copied === entry._id ? "rgba(29,158,117,0.4)" : "rgba(83,74,183,0.2)", bg: copied === entry._id ? "rgba(29,158,117,0.1)" : "transparent", action: () => copyToClipboard(entry.password, entry._id) },
                      { label: "edit", color: "#7F77DD", border: "rgba(83,74,183,0.2)", bg: "transparent", action: () => openEditForm(entry) },
                      { label: "share", color: "#EF9F27", border: "rgba(239,159,39,0.3)", bg: "transparent", action: () => handleShare(entry) },
                      { label: "delete", color: "#E24B4A", border: "rgba(162,45,45,0.3)", bg: "transparent", action: () => handleDelete(entry._id) },
                    ].map((btn, i) => (
                      <button key={i} onClick={btn.action} style={{
                        fontSize: 10, padding: "4px 12px", borderRadius: 6,
                        border: `1px solid ${btn.border}`, background: btn.bg,
                        color: btn.color, cursor: "pointer", fontFamily: "Courier New, monospace",
                        flex: isMobile ? 1 : "none"
                      }}>{btn.label}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(6,6,18,0.95)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: isMobile ? "flex-end" : "center",
          justifyContent: "center", padding: isMobile ? 0 : 16
        }}>
          <div style={{
            background: "linear-gradient(145deg, #0e0e22, #0a0a18)",
            border: "1px solid rgba(83,74,183,0.35)",
            borderRadius: isMobile ? "16px 16px 0 0" : 18,
            padding: isMobile ? "24px 20px" : 30,
            width: "100%", maxWidth: isMobile ? "100%" : 460,
            maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 0 60px rgba(83,74,183,0.2)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 13, fontWeight: "bold", color: "#e2e8f0", letterSpacing: "0.1em" }}>
                &gt; {editEntry ? "edit entry" : "new vault entry"}
              </span>
              <button onClick={() => setShowForm(false)} style={{
                background: "transparent", border: "none", color: "#4a4a7a", fontSize: 20, cursor: "pointer"
              }}>×</button>
            </div>

            {formError && (
              <div style={{
                marginBottom: 16, padding: "10px 14px", borderRadius: 8,
                background: "rgba(162,45,45,0.1)", border: "1px solid rgba(162,45,45,0.3)",
                color: "#F09595", fontSize: 12
              }}>⚠ {formError}</div>
            )}

            <form onSubmit={handleFormSubmit}>
              {[
                { label: "SITE_NAME", name: "siteName", placeholder: "Google, Instagram..." },
                { label: "SITE_URL", name: "siteUrl", placeholder: "https://..." },
                { label: "USERNAME / EMAIL", name: "username", placeholder: "your_username" },
              ].map(f => (
                <div key={f.name} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 10, color: "#7F77DD", letterSpacing: "0.12em", marginBottom: 6 }}>
                    &gt; {f.label}
                  </label>
                  <input type="text" name={f.name} value={formData[f.name]} placeholder={f.placeholder}
                    onChange={e => setFormData({ ...formData, [e.target.name]: e.target.value })}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 9,
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(83,74,183,0.2)",
                      color: "#e2e8f0", fontSize: 13, fontFamily: "Courier New, monospace", outline: "none"
                    }}
                    onFocus={e => { e.target.style.borderColor = "#534AB7"; e.target.style.boxShadow = "0 0 16px rgba(83,74,183,0.2)"; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(83,74,183,0.2)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              ))}

              <div style={{ marginBottom: 6 }}>
                <label style={{ display: "block", fontSize: 10, color: "#7F77DD", letterSpacing: "0.12em", marginBottom: 6 }}>
                  &gt; PASSWORD
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="text" value={formData.password} placeholder="enter or generate"
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    style={{
                      flex: 1, padding: "10px 14px", borderRadius: 9,
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(83,74,183,0.2)",
                      color: "#e2e8f0", fontSize: 13, fontFamily: "Courier New, monospace", outline: "none"
                    }}
                  />
                  <button type="button" onClick={generatePassword} style={{
                    padding: "10px 12px", borderRadius: 9,
                    background: "rgba(83,74,183,0.15)", border: "1px solid rgba(83,74,183,0.4)",
                    color: "#7F77DD", fontSize: 11, cursor: "pointer",
                    fontFamily: "Courier New, monospace", whiteSpace: "nowrap"
                  }}>⚡ gen</button>
                </div>
              </div>

              {formData.password && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    {[1,2,3,4,5].map(i => {
                      const s = getStrength(formData.password);
                      return <div key={i} style={{
                        height: 3, flex: 1, borderRadius: 99,
                        background: i <= s ? strengthColor[s] : "rgba(255,255,255,0.05)",
                        boxShadow: i <= s ? `0 0 6px ${strengthColor[s]}` : "none"
                      }}/>;
                    })}
                  </div>
                  <span style={{ fontSize: 10, color: strengthColor[getStrength(formData.password)] }}>
                    strength: {strengthLabel[getStrength(formData.password)]}
                  </span>
                </div>
              )}

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 10, color: "#7F77DD", letterSpacing: "0.12em", marginBottom: 6 }}>
                  &gt; CATEGORY
                </label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 9,
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(83,74,183,0.2)",
                    color: "#e2e8f0", fontSize: 13, fontFamily: "Courier New, monospace", outline: "none"
                  }}>
                  {["social","banking","work","shopping","other"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 10, color: "#7F77DD", letterSpacing: "0.12em", marginBottom: 6 }}>
                  &gt; NOTES (optional)
                </label>
                <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="any notes..." rows={2}
                  style={{
                    width: "100%", padding: "10px 14px", borderRadius: 9,
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(83,74,183,0.2)",
                    color: "#e2e8f0", fontSize: 13, fontFamily: "Courier New, monospace",
                    outline: "none", resize: "none"
                  }}
                />
              </div>

              <button type="submit" style={{
                width: "100%", padding: "12px", borderRadius: 10,
                background: "linear-gradient(135deg, #534AB7 0%, #7F77DD 100%)",
                border: "1px solid rgba(83,74,183,0.5)",
                color: "#fff", fontSize: 13, fontWeight: "bold",
                cursor: "pointer", fontFamily: "Courier New, monospace",
                letterSpacing: "0.1em", boxShadow: "0 0 24px rgba(83,74,183,0.4)"
              }}>
                &gt; {editEntry ? "update entry" : "save entry"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(6,6,18,0.95)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: isMobile ? "flex-end" : "center",
          justifyContent: "center", padding: isMobile ? 0 : 16
        }}>
          <div style={{
            background: "linear-gradient(145deg, #0e0e22, #0a0a18)",
            border: "1px solid rgba(239,159,39,0.3)",
            borderRadius: isMobile ? "16px 16px 0 0" : 16,
            padding: isMobile ? "24px 20px" : 28,
            width: "100%", maxWidth: isMobile ? "100%" : 500,
            boxShadow: "0 0 60px rgba(83,74,183,0.2)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 13, fontWeight: "bold", color: "#e2e8f0", letterSpacing: "0.1em" }}>
                🔗 secure share — {shareModal.siteName}
              </span>
              <button onClick={() => { setShareModal(null); setShareLink(""); }} style={{
                background: "transparent", border: "none", color: "#4a4a7a", fontSize: 20, cursor: "pointer"
              }}>×</button>
            </div>

            <div style={{
              padding: "10px 14px", borderRadius: 8, marginBottom: 20,
              background: "rgba(239,159,39,0.08)", border: "1px solid rgba(239,159,39,0.3)"
            }}>
              <p style={{ fontSize: 11, color: "#EF9F27", lineHeight: 1.6 }}>
                ⚠️ Expires in <strong>24 hours</strong> · Can only be used <strong>ONCE</strong><br/>
                After opening, the link is permanently destroyed.
              </p>
            </div>

            <label style={{ display: "block", fontSize: 10, color: "#7F77DD", letterSpacing: "0.1em", marginBottom: 8 }}>
              &gt; SECURE_SHARE_URL
            </label>

            {shareLoading ? (
              <div style={{
                padding: "14px", borderRadius: 8, textAlign: "center",
                background: "rgba(83,74,183,0.05)", border: "1px solid rgba(83,74,183,0.2)",
                color: "#534AB7", fontSize: 12, letterSpacing: "0.08em"
              }}>&gt; generating cryptographic token...</div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{
                  flex: 1, padding: "10px 14px", borderRadius: 8, fontSize: 11,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(83,74,183,0.2)",
                  color: "#7F77DD", wordBreak: "break-all", fontFamily: "Courier New, monospace", lineHeight: 1.5
                }}>{shareLink}</div>
                <button onClick={() => copyToClipboard(shareLink, "sharelink")} style={{
                  padding: "10px 16px", borderRadius: 8, flexShrink: 0,
                  border: `1px solid ${copied === "sharelink" ? "rgba(29,158,117,0.4)" : "rgba(83,74,183,0.3)"}`,
                  background: copied === "sharelink" ? "rgba(29,158,117,0.1)" : "rgba(83,74,183,0.1)",
                  color: copied === "sharelink" ? "#1D9E75" : "#7F77DD",
                  fontSize: 11, cursor: "pointer", fontFamily: "Courier New, monospace", alignSelf: "flex-start"
                }}>{copied === "sharelink" ? "✓ copied!" : "copy"}</button>
              </div>
            )}

            <div style={{ marginTop: 16, fontSize: 11, color: "#3a3a5a", textAlign: "center" }}>
              recipient opens link → credentials shown → link permanently destroyed 🔐
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Vault;