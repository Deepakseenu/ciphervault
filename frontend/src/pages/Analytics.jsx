import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPasswords } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

function Analytics() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
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

  // Health Score calculation
  const calculateHealthScore = () => {
    if (passwords.length === 0) return { score: 0, grade: 'F', color: '#E24B4A' };
    let total = 0;
    passwords.forEach(p => {
      const s = getStrength(p.password);
      total += (s / 5) * 100;
      if (p.needsUpdate) total -= 20;
    });
    const score = Math.max(0, Math.min(100, Math.round(total / passwords.length)));
    let grade = 'F', color = '#E24B4A';
    if (score >= 90) { grade = 'A'; color = '#1D9E75'; }
    else if (score >= 75) { grade = 'B'; color = '#1D9E75'; }
    else if (score >= 60) { grade = 'C'; color = '#EF9F27'; }
    else if (score >= 40) { grade = 'D'; color = '#E24B4A'; }
    return { score, grade, color };
  };

  // Strength distribution
  const strengthData = [
    { name: 'Very Strong', value: passwords.filter(p => getStrength(p.password) === 5).length, color: '#1D9E75' },
    { name: 'Strong',      value: passwords.filter(p => getStrength(p.password) === 4).length, color: '#5DCAA5' },
    { name: 'Moderate',    value: passwords.filter(p => getStrength(p.password) === 3).length, color: '#EF9F27' },
    { name: 'Weak',        value: passwords.filter(p => getStrength(p.password) === 2).length, color: '#E24B4A' },
    { name: 'Very Weak',   value: passwords.filter(p => getStrength(p.password) <= 1).length, color: '#A32D2D' },
  ].filter(d => d.value > 0);

  // Category distribution
  const categoryData = ['social','banking','work','shopping','other'].map(cat => ({
    name: cat,
    count: passwords.filter(p => p.category === cat).length
  })).filter(d => d.count > 0);

  // Security issues
  const issues = [
    { label: 'Weak passwords',      count: passwords.filter(p => getStrength(p.password) < 3).length,  color: '#E24B4A', icon: '⚠️' },
    { label: 'Needs update (90d+)', count: passwords.filter(p => p.needsUpdate).length,                color: '#EF9F27', icon: '⏰' },
    { label: 'Strong passwords',    count: passwords.filter(p => getStrength(p.password) >= 4).length, color: '#1D9E75', icon: '✅' },
  ];

  const health = calculateHealthScore();

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
    background: "linear-gradient(145deg, #0e0e22, #0a0a18)",
    border: "1px solid rgba(83,74,183,0.2)",
    borderRadius: 12,
    padding: "20px 24px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.4)"
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: "#0e0e22", border: "1px solid rgba(83,74,183,0.3)",
          borderRadius: 8, padding: "8px 12px", fontSize: 12,
          color: "#e2e8f0", fontFamily: "Courier New, monospace"
        }}>
          {payload[0].name}: {payload[0].value}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={glowStyle}>
      {/* Navbar */}
      <div style={{
        background: "linear-gradient(90deg, #08081a, #0d0d22)",
        borderBottom: "1px solid rgba(83,74,183,0.25)",
        padding: "12px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 4px 32px rgba(0,0,0,0.5)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => navigate("/vault")} style={{
            background: "transparent", border: "1px solid rgba(83,74,183,0.25)",
            color: "#7F77DD", fontSize: 11, padding: "5px 14px",
            borderRadius: 7, cursor: "pointer", fontFamily: "Courier New, monospace"
          }}>← vault</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
              <rect x="7" y="16" width="22" height="17" rx="4" fill="#1a1040" stroke="#7F77DD" strokeWidth="1.5"/>
              <path d="M11 16V12a7 7 0 0114 0v4" stroke="#7F77DD" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="18" cy="25" r="2.5" fill="#534AB7"/>
            </svg>
            <span style={{ color: "#fff", fontSize: 13, fontWeight: "bold", letterSpacing: "0.15em" }}>CIPHERVAULT</span>
            <span style={{ color: "#4a4a7a", fontSize: 11 }}>/ analytics</span>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          fontSize: 11, padding: "5px 14px", borderRadius: 7,
          border: "1px solid rgba(83,74,183,0.25)", background: "transparent",
          color: "#7F77DD", cursor: "pointer", fontFamily: "Courier New, monospace"
        }}>logout →</button>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px" }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 18, fontWeight: "bold", color: "#e2e8f0", letterSpacing: "0.1em", marginBottom: 6 }}>
            📊 VAULT ANALYTICS
          </h1>
          <p style={{ fontSize: 12, color: "#4a4a7a", letterSpacing: "0.06em" }}>
            &gt; security overview and password health analysis
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#534AB7", padding: 60, fontSize: 13, letterSpacing: "0.1em" }}>
            &gt; analysing vault security...
          </div>
        ) : passwords.length === 0 ? (
          <div style={{ textAlign: "center", color: "#3a3a6a", padding: 60, fontSize: 13 }}>
            &gt; no passwords in vault yet. add some first!
          </div>
        ) : (
          <>
            {/* Health Score */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 14, marginBottom: 14 }}>
              <div style={{ ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#4a4a7a", letterSpacing: "0.1em", marginBottom: 12 }}>VAULT HEALTH SCORE</div>
                <div style={{
                  width: 100, height: 100, borderRadius: "50%",
                  background: `conic-gradient(${health.color} ${health.score * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 30px ${health.color}40`,
                  marginBottom: 12, position: "relative"
                }}>
                  <div style={{
                    width: 76, height: 76, borderRadius: "50%",
                    background: "#0e0e22",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
                  }}>
                    <span style={{ fontSize: 22, fontWeight: "bold", color: health.color }}>{health.score}</span>
                    <span style={{ fontSize: 10, color: "#4a4a7a" }}>/ 100</span>
                  </div>
                </div>
                <div style={{
                  fontSize: 32, fontWeight: "bold", color: health.color,
                  textShadow: `0 0 20px ${health.color}`,
                  marginBottom: 6
                }}>Grade {health.grade}</div>
                <div style={{ fontSize: 11, color: "#4a4a7a" }}>
                  {health.grade === 'A' ? 'Excellent security!' :
                   health.grade === 'B' ? 'Good — room to improve' :
                   health.grade === 'C' ? 'Average — needs work' :
                   'Poor — take action now!'}
                </div>
              </div>

              {/* Security Issues */}
              <div style={cardStyle}>
                <div style={{ fontSize: 11, color: "#4a4a7a", letterSpacing: "0.1em", marginBottom: 16 }}>SECURITY BREAKDOWN</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {issues.map((issue, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: "#e2e8f0" }}>{issue.icon} {issue.label}</span>
                        <span style={{ fontSize: 12, fontWeight: "bold", color: issue.color }}>{issue.count}</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.05)" }}>
                        <div style={{
                          height: 4, borderRadius: 99,
                          background: issue.color,
                          width: `${passwords.length > 0 ? (issue.count / passwords.length) * 100 : 0}%`,
                          boxShadow: `0 0 8px ${issue.color}`,
                          transition: "width 1s ease"
                        }}/>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(83,74,183,0.15)" }}>
                  <div style={{ fontSize: 11, color: "#4a4a7a", letterSpacing: "0.08em", marginBottom: 8 }}>QUICK STATS</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                    {[
                      { label: "total", value: passwords.length, color: "#e2e8f0" },
                      { label: "avg length", value: Math.round(passwords.reduce((a,p) => a + (p.password?.length || 0), 0) / passwords.length) + " chars", color: "#7F77DD" },
                      { label: "categories", value: new Set(passwords.map(p => p.category)).size, color: "#1D9E75" },
                    ].map((s, i) => (
                      <div key={i} style={{ textAlign: "center", padding: "8px", borderRadius: 8, background: "rgba(255,255,255,0.02)" }}>
                        <div style={{ fontSize: 16, fontWeight: "bold", color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: "#4a4a7a", marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              {/* Strength Pie Chart */}
              <div style={cardStyle}>
                <div style={{ fontSize: 11, color: "#4a4a7a", letterSpacing: "0.1em", marginBottom: 16 }}>PASSWORD STRENGTH</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={strengthData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {strengthData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="transparent"/>
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />}/>
                    <Legend formatter={(value) => <span style={{ color: "#e2e8f0", fontSize: 11, fontFamily: "Courier New" }}>{value}</span>}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Bar Chart */}
              <div style={cardStyle}>
                <div style={{ fontSize: 11, color: "#4a4a7a", letterSpacing: "0.1em", marginBottom: 16 }}>BY CATEGORY</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={categoryData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fill: "#4a4a7a", fontSize: 11, fontFamily: "Courier New" }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fill: "#4a4a7a", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false}/>
                    <Tooltip content={<CustomTooltip />}/>
                    <Bar dataKey="count" fill="#534AB7" radius={[4,4,0,0]}>
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={["#534AB7","#1D9E75","#378ADD","#EF9F27","#888780"][i % 5]}/>
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recommendations */}
            <div style={cardStyle}>
              <div style={{ fontSize: 11, color: "#4a4a7a", letterSpacing: "0.1em", marginBottom: 16 }}>🎯 SECURITY RECOMMENDATIONS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {passwords.filter(p => getStrength(p.password) < 3).length > 0 && (
                  <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(226,75,74,0.08)", border: "1px solid rgba(226,75,74,0.25)" }}>
                    <span style={{ fontSize: 12, color: "#E24B4A" }}>⚠️ You have {passwords.filter(p => getStrength(p.password) < 3).length} weak password(s). Update them immediately!</span>
                  </div>
                )}
                {passwords.filter(p => p.needsUpdate).length > 0 && (
                  <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,159,39,0.08)", border: "1px solid rgba(239,159,39,0.25)" }}>
                    <span style={{ fontSize: 12, color: "#EF9F27" }}>⏰ {passwords.filter(p => p.needsUpdate).length} password(s) haven't been updated in 90+ days.</span>
                  </div>
                )}
                {passwords.filter(p => getStrength(p.password) >= 4).length === passwords.length && (
                  <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(29,158,117,0.08)", border: "1px solid rgba(29,158,117,0.25)" }}>
                    <span style={{ fontSize: 12, color: "#1D9E75" }}>✅ All passwords are strong! Keep it up.</span>
                  </div>
                )}
                <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(83,74,183,0.08)", border: "1px solid rgba(83,74,183,0.2)" }}>
                  <span style={{ fontSize: 12, color: "#7F77DD" }}>🔐 Use the password generator for maximum security. Aim for 16+ characters with symbols.</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Analytics;