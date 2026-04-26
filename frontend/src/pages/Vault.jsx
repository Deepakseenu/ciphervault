import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPasswords, addPassword, updatePassword, deletePassword } from "../services/api";

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

  useEffect(() => {
    fetchPasswords();
    const timer = setInterval(() => setSessionTime(t => {
      if (t <= 1) { handleLogout(); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchPasswords = async () => {
    try {
      const res = await getPasswords();
      setPasswords(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };
  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const getStrength = (pw) => {
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
        padding: "12px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 4px 32px rgba(0,0,0,0.5)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
            <rect x="7" y="16" width="22" height="17" rx="4" fill="#1a1040" stroke="#7F77DD" strokeWidth="1.5"/>
            <path d="M11 16V12a7 7 0 0114 0v4" stroke="#7F77DD" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="18" cy="25" r="2.5" fill="#534AB7"/>
          </svg>
          <span style={{ color: "#ffffff", fontSize: 14, fontWeight: "bold", letterSpacing: "0.18em" }}>CIPHERVAULT</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
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
          <span style={{ fontSize: 11, color: "#4a4a7a" }}>{user?.email}</span>
          <button onClick={handleLogout} style={{
            fontSize: 11, padding: "5px 14px", borderRadius: 7,
            border: "1px solid rgba(83,74,183,0.25)", background: "transparent",
            color: "#7F77DD", cursor: "pointer", fontFamily: "Courier New, monospace",
            letterSpacing: "0.06em", transition: "all 0.2s"
          }}>logout →</button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "total saved", value: passwords.length, color: "#e2e8f0", glow: "rgba(83,74,183,0.3)" },
            { label: "strong passwords", value: strongCount, color: "#1D9E75", glow: "rgba(29,158,117,0.3)" },
            { label: "weak passwords", value: weakCount, color: "#E24B4A", glow: "rgba(226,75,74,0.3)" },
          ].map((s, i) => (
            <div key={i} style={{ ...cardStyle, padding: "18px 20px" }}>
              <div style={{ fontSize: 32, fontWeight: "bold", color: s.color, textShadow: `0 0 20px ${s.glow}` }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#4a4a7a", marginTop: 4, letterSpacing: "0.08em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search + Add */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px", borderRadius: 10,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(83,74,183,0.2)"
          }}>
            <svg width="14" height="14" viewBox="0 0 13 13" fill="none">
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
            padding: "10px 22px", borderRadius: 10,
            background: "linear-gradient(135deg, #534AB7 0%, #7F77DD 100%)",
            border: "1px solid rgba(83,74,183,0.5)",
            color: "#fff", fontSize: 12, fontWeight: "bold",
            cursor: "pointer", fontFamily: "Courier New, monospace",
            letterSpacing: "0.08em",
            boxShadow: "0 0 20px rgba(83,74,183,0.4)"
          }}>+ add entry</button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 7, marginBottom: 20, flexWrap: "wrap" }}>
          {["all", "social", "banking", "work", "shopping", "other"].map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{
              fontSize: 11, padding: "4px 14px", borderRadius: 99,
              border: `1px solid ${filter === cat ? "rgba(83,74,183,0.6)" : "rgba(83,74,183,0.15)"}`,
              background: filter === cat ? "rgba(83,74,183,0.15)" : "transparent",
              color: filter === cat ? "#7F77DD" : "#4a4a7a",
              cursor: "pointer", fontFamily: "Courier New, monospace",
              letterSpacing: "0.06em",
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
                  padding: "16px 18px",
                  display: "flex", alignItems: "center", gap: 16,
                  transition: "border-color 0.2s",
                }}>
                  {/* Icon */}
                  <div style={{
                    width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                    background: cat.bg, border: `1px solid ${cat.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: "bold", color: cat.text,
                    boxShadow: `0 0 12px ${cat.bg}`
                  }}>{getInitials(entry.siteName)}</div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: "bold", color: "#e2e8f0" }}>{entry.siteName}</span>
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 99,
                        background: cat.bg, border: `1px solid ${cat.border}`, color: cat.text
                      }}>{entry.category}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#4a4a7a", marginBottom: 5 }}>{entry.username}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, color: "#6a6a9a", letterSpacing: isVisible ? "0.02em" : "0.12em" }}>
                        {isVisible ? entry.password : "••••••••••"}
                      </span>
                      <button onClick={() => toggleVisible(entry._id)} style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 5,
                        border: "1px solid rgba(83,74,183,0.2)", background: "transparent",
                        color: "#534AB7", cursor: "pointer", fontFamily: "Courier New, monospace"
                      }}>{isVisible ? "hide" : "show"}</button>
                    </div>
                    {/* Strength */}
                    <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 7 }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{
                          height: 3, width: 20, borderRadius: 99,
                          background: i <= strength ? strengthColor[strength] : "rgba(255,255,255,0.05)",
                          boxShadow: i <= strength ? `0 0 6px ${strengthColor[strength]}` : "none"
                        }}/>
                      ))}
                      <span style={{ fontSize: 10, color: strengthColor[strength], marginLeft: 5 }}>{strengthLabel[strength]}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                    <button onClick={() => copyToClipboard(entry.password, entry._id)} style={{
                      fontSize: 10, padding: "4px 12px", borderRadius: 6,
                      border: `1px solid ${copied === entry._id ? "rgba(29,158,117,0.4)" : "rgba(83,74,183,0.2)"}`,
                      background: copied === entry._id ? "rgba(29,158,117,0.1)" : "transparent",
                      color: copied === entry._id ? "#1D9E75" : "#7F77DD",
                      cursor: "pointer", fontFamily: "Courier New, monospace", letterSpacing: "0.04em"
                    }}>{copied === entry._id ? "copied!" : "copy"}</button>
                    <button onClick={() => openEditForm(entry)} style={{
                      fontSize: 10, padding: "4px 12px", borderRadius: 6,
                      border: "1px solid rgba(83,74,183,0.2)", background: "transparent",
                      color: "#7F77DD", cursor: "pointer", fontFamily: "Courier New, monospace"
                    }}>edit</button>
                    <button onClick={() => handleDelete(entry._id)} style={{
                      fontSize: 10, padding: "4px 12px", borderRadius: 6,
                      border: "1px solid rgba(162,45,45,0.3)", background: "transparent",
                      color: "#E24B4A", cursor: "pointer", fontFamily: "Courier New, monospace"
                    }}>delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(6,6,18,0.9)",
          backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16
        }}>
          <div style={{
            background: "linear-gradient(145deg, #0e0e22, #0a0a18)",
            border: "1px solid rgba(83,74,183,0.35)",
            borderRadius: 18, padding: 30,
            width: "100%", maxWidth: 460,
            maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 0 60px rgba(83,74,183,0.2), 0 24px 60px rgba(0,0,0,0.7)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <span style={{ fontSize: 13, fontWeight: "bold", color: "#e2e8f0", letterSpacing: "0.12em" }}>
                &gt; {editEntry ? "edit entry" : "new vault entry"}
              </span>
              <button onClick={() => setShowForm(false)} style={{
                background: "transparent", border: "none", color: "#4a4a7a",
                fontSize: 20, cursor: "pointer", lineHeight: 1
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
                <div key={f.name} style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 10, color: "#7F77DD", letterSpacing: "0.12em", marginBottom: 7 }}>
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

              {/* Password + Generator */}
              <div style={{ marginBottom: 6 }}>
                <label style={{ display: "block", fontSize: 10, color: "#7F77DD", letterSpacing: "0.12em", marginBottom: 7 }}>
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
                    padding: "10px 14px", borderRadius: 9,
                    background: "rgba(83,74,183,0.15)", border: "1px solid rgba(83,74,183,0.4)",
                    color: "#7F77DD", fontSize: 11, cursor: "pointer",
                    fontFamily: "Courier New, monospace", whiteSpace: "nowrap",
                    boxShadow: "0 0 12px rgba(83,74,183,0.2)"
                  }}>⚡ generate</button>
                </div>
              </div>

              {/* Strength meter */}
              {formData.password && (
                <div style={{ marginBottom: 16 }}>
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

              {/* Category */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 10, color: "#7F77DD", letterSpacing: "0.12em", marginBottom: 7 }}>
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

              {/* Notes */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 10, color: "#7F77DD", letterSpacing: "0.12em", marginBottom: 7 }}>
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
                letterSpacing: "0.1em",
                boxShadow: "0 0 24px rgba(83,74,183,0.4)"
              }}>
                &gt; {editEntry ? "update entry" : "save entry"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vault;