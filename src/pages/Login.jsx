import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      navigate(`/${data.user.role}`);
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <div className="auth">
      <h1>Good food should be eaten.</h1>
      <p className="lead">Log in to post surplus food or claim it before it goes to waste.</p>
      <form className="card form" onSubmit={submit}>
        <label>Email
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label>Password
          <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit">Log in</button>
        <p className="meta">New here? <Link to="/register">Create an account</Link></p>
      </form>
    </div>
  );
}
