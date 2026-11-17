import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';

export default function Register() {
  const [form, setForm] = useState({
    name: '', organization: '', phone: '', email: '', password: '', role: 'donor',
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.user);
      navigate(`/${data.user.role}`);
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <div className="auth">
      <h1>Join FoodShare</h1>
      <p className="lead">An admin checks every donor and NGO before they can post or claim food.</p>
      <form className="card form" onSubmit={submit}>
        <div className="choice">
          <label className={form.role === 'donor' ? 'on' : ''}>
            <input type="radio" name="role" value="donor" checked={form.role === 'donor'} onChange={set('role')} />
            I have surplus food
          </label>
          <label className={form.role === 'receiver' ? 'on' : ''}>
            <input type="radio" name="role" value="receiver" checked={form.role === 'receiver'} onChange={set('role')} />
            I collect food (NGO or student)
          </label>
        </div>
        <label>Your name<input required value={form.name} onChange={set('name')} /></label>
        <label>{form.role === 'donor' ? 'Restaurant, mess or caterer name' : 'NGO or group name'}
          <input value={form.organization} onChange={set('organization')} />
        </label>
        <label>Phone<input value={form.phone} onChange={set('phone')} /></label>
        <label>Email<input type="email" required value={form.email} onChange={set('email')} /></label>
        <label>Password (6 or more characters)
          <input type="password" required minLength={6} value={form.password} onChange={set('password')} />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit">Create account</button>
        <p className="meta">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
