import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <header className="nav">
        <Link to="/" className="brand">ShareAPlate</Link>
        <div className="nav-right">
          {user ? (
            <>
              <span className="who">{user.name} <small>({user.role})</small></span>
              <button className="btn ghost" onClick={() => { logout(); navigate('/login'); }}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn ghost">Log in</Link>
              <Link to="/register" className="btn">Sign up</Link>
            </>
          )}
        </div>
      </header>
      {user && user.role !== 'admin' && !user.verified && (
        <div className="notice">
          Your account is waiting for admin approval. You can look around now, and posting or claiming food unlocks once you are approved.
        </div>
      )}
    </>
  );
}
