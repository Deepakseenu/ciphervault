import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Vault from "./pages/Vault";
import ActivityLog from "./pages/ActivityLog";
import ShareAccess from "./pages/ShareAccess";
import Analytics from "./pages/Analytics";

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", color: "#534AB7", fontSize: 13,
      letterSpacing: "0.1em", fontFamily: "Courier New, monospace",
      background: "#060612"
    }}>
      &gt; initializing cipher vault...
    </div>
  );
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/vault" element={<ProtectedRoute><Vault /></ProtectedRoute>} />
      <Route path="/activity" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/share/:token" element={<ShareAccess />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;