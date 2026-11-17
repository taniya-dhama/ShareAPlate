import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Donor from './pages/Donor';
import Receiver from './pages/Receiver';
import Admin from './pages/Admin';

const home = (role) => `/${role}`;

// Only lets the right role into a page
function Guard({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={home(user.role)} replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Navigate to={user ? home(user.role) : '/login'} replace />} />
          <Route path="/login" element={user ? <Navigate to={home(user.role)} replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to={home(user.role)} replace /> : <Register />} />
          <Route path="/donor" element={<Guard role="donor"><Donor /></Guard>} />
          <Route path="/receiver" element={<Guard role="receiver"><Receiver /></Guard>} />
          <Route path="/admin" element={<Guard role="admin"><Admin /></Guard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
