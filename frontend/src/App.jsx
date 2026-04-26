import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Vault from "./pages/Vault";

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen text-purple-400 text-sm tracking-widest">
      initializing cipher vault...
    </div>
  );
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/vault" element={
        <ProtectedRoute>
          <Vault />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;