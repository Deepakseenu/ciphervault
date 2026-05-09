import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getActivityLogs } from "../services/api";
import { useAuth } from "../context/AuthContext";

function ActivityLog() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      const res = await getActivityLogs();
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  const actionConfig = {
    LOGIN_SUCCESS:      { label: "Login",             color: "#1D9E75", bg: "rgba(29,158,117,0.1)",  border: "rgba(29,158,117,0.3)",  icon: "🔓" },
    LOGIN_FAILED:       { label: "Failed Login",      color: "#E24B4A", bg: "rgba(226,75,74,0.1)",   border: "rgba(226,75,74,0.3)",   icon: "⚠️" },
    REGISTER:           { label: "Registered",        color: "#534AB7", bg: "rgba(83,74,183,0.1)",   border: "rgba(83,74,183,0.3)",   icon: "✨" },
    PASSWORD_ADDED:     { label: "Password Added",    color: "#1D9E75", bg: "rgba(29,158,117,0.1)",  border: "rgba(29,158,117,0.3)",  icon: "➕" },
    PASSWORD_UPDATED:   { label: "Password Updated",  color: "#EF9F27", bg: "rgba(239,159,39,0.1)",  border: "rgba(239,159,39,0.3)",  icon: "✏️" },
    PASSWORD_DELETED:   { label: "Password Deleted",  color: "#E24B4A", bg: "rgba(226,75,74,0.1)",   border: "rgba(226,75,74,0.3)",   icon: "🗑️" },
    PASSWORD_VIEWED:    { label: "Password Viewed",   color: "#378ADD", bg: "rgba(55,138,221,0.1)",  border: "rgba(55,138,221,0.3)",  icon: "👁️" },
    BREACH_CHECK:       { label: "Breach Check",      color: "#7F77DD", bg: "rgba(83,74,183,0.1)",   border: "rgba(83,74,183,0.3)",   icon: "🔍" },
    SHARE_CREATED:      { label: "Share Created",     color: "#EF9F27", bg: "rgba(239,159,39,0.1)",  border: "rgba(239,159,39,0.3)",  icon: "🔗" },
    SHARE_ACCESSED:     { label: "Share Accessed",    color: "#378ADD", bg: "rgba(55,138,221,0.1)",  border: "rgba(55,138,221,0.3)",  icon: "📨" },
  };

  const statusConfig = {
    SUCCESS: { color: "#1D9E75", label: "success" },
    WARNING: { color: "#EF9F27", label: "warning" },
    FAILED:  { color: "#E24B4A", label: "failed"  },
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const glowStyle = {
    minHeight: "100vh",
    fontFamily: "Courier New, monospace",
    background: "#060612",
    backgroundImage: `
      radial-gradient(ellipse at 15% 15%, rgba(83,74,183,0.18) 0%, transparent 45%),
      radial-gradient(ellipse at 85% 85%, rgba(29,158,117,0.1) 0%, transparent 45%)
    `
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
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => navigate("/vault")} style={{
            background: "transparent", border: "1px solid rgba(83,74,183,0.25)",
            color: "#7F77DD", fontSize: 11, padding: "5px 14px",
            borderRadius: 7, cursor: "pointer", fontFamily: "Courier New, monospace",
            letterSpacing: "0.06em"
          }}>← vault</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
              <rect x="7" y="16" width="22" height="17" rx="4" fill="#1a1040" stroke="#7F77DD" strokeWidth="1.5"/>
              <path d="M11 16V12a7 7 0 0114 0v4" stroke="#7F77DD" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="18" cy="25" r="2.5" fill="#534AB7"/>
            </svg>
            <span style={{ color: "#ffffff", fontSize: 13, fontWeight: "bold", letterSpacing: "0.15em" }}>
              CIPHERVAULT
            </span>
            <span style={{ color: "#4a4a7a", fontSize: 11 }}>/ activity log</span>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          fontSize: 11, padding: "5px 14px", borderRadius: 7,
          border: "1px solid rgba(83,74,183,0.25)", background: "transparent",
          color: "#7F77DD", cursor: "pointer", fontFamily: "Courier New, monospace"
        }}>logout →</button>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 18, fontWeight: "bold", color: "#e2e8f0", letterSpacing: "0.1em", marginBottom: 6 }}>
            📋 ACCOUNT ACTIVITY
          </h1>
          <p style={{ fontSize: 12, color: "#4a4a7a", letterSpacing: "0.06em" }}>
            &gt; complete audit trail of all account actions — last 50 events
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "total events", value: logs.length, color: "#e2e8f0" },
            { label: "successful", value: logs.filter(l => l.status === "SUCCESS").length, color: "#1D9E75" },
            { label: "warnings", value: logs.filter(l => l.status === "WARNING").length, color: "#EF9F27" },
            { label: "failed", value: logs.filter(l => l.status === "FAILED").length, color: "#E24B4A" },
          ].map((s, i) => (
            <div key={i} style={{
              background: "linear-gradient(145deg, #0e0e22, #0a0a18)",
              border: "1px solid rgba(83,74,183,0.2)",
              borderRadius: 10, padding: "14px 16px"
            }}>
              <div style={{ fontSize: 26, fontWeight: "bold", color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#4a4a7a", marginTop: 3, letterSpacing: "0.06em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Logs */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#534AB7", padding: 60, fontSize: 13, letterSpacing: "0.1em" }}>
            &gt; loading activity logs...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: "center", color: "#3a3a6a", padding: 60, fontSize: 13 }}>
            &gt; no activity recorded yet
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {logs.map((log, i) => {
              const action = actionConfig[log.action] || { label: log.action, color: "#7F77DD", bg: "rgba(83,74,183,0.1)", border: "rgba(83,74,183,0.3)", icon: "📌" };
              const status = statusConfig[log.status] || statusConfig.SUCCESS;
              return (
                <div key={log._id} style={{
                  background: "linear-gradient(145deg, #0e0e22, #0a0a18)",
                  border: `1px solid ${i === 0 ? "rgba(83,74,183,0.35)" : "rgba(83,74,183,0.15)"}`,
                  borderRadius: 10, padding: "14px 18px",
                  display: "flex", alignItems: "center", gap: 14
                }}>
                  {/* Icon */}
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: action.bg, border: `1px solid ${action.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16
                  }}>{action.icon}</div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{
                        fontSize: 12, fontWeight: "bold",
                        color: action.color, letterSpacing: "0.06em"
                      }}>{action.label}</span>
                      <span style={{
                        fontSize: 10, padding: "2px 8px", borderRadius: 99,
                        background: `rgba(${status.color === "#1D9E75" ? "29,158,117" : status.color === "#EF9F27" ? "239,159,39" : "226,75,74"},0.1)`,
                        border: `1px solid ${status.color}`,
                        color: status.color
                      }}>{status.label}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#4a4a7a", marginBottom: 2 }}>
                      {log.details}
                    </div>
                    <div style={{ fontSize: 10, color: "#3a3a5a", letterSpacing: "0.04em" }}>
                      IP: {log.ipAddress} · {log.userAgent.slice(0, 40)}...
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: "#4a4a7a", letterSpacing: "0.04em" }}>
                      {formatDate(log.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityLog;