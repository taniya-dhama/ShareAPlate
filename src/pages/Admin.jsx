import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api';

export default function Admin() {
  const [pending, setPending] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.get('/admin/pending').then((r) => setPending(r.data)).catch((e) => setError(errMsg(e)));
    api.get('/admin/stats').then((r) => setStats(r.data)).catch((e) => setError(errMsg(e)));
  }, []);

  useEffect(() => { load(); }, [load]);

  const verify = async (id) => {
    await api.patch(`/admin/verify/${id}`);
    load();
  };

  return (
    <div>
      <h2>Impact so far</h2>
      {error && <p className="error">{error}</p>}
      {stats && (
        <div className="stats">
          <div className="card"><span className="big">{stats.mealsSaved}</span> meals handed over</div>
          <div className="card"><span className="big">{stats.totalListings}</span> listings posted</div>
          <div className="card"><span className="big">{stats.donors}</span> donors</div>
          <div className="card"><span className="big">{stats.receivers}</span> receivers</div>
        </div>
      )}

      <h2>Waiting for approval</h2>
      {pending.length === 0 && <p className="empty">Everyone who signed up has been approved.</p>}
      {pending.map((u) => (
        <article className="card listing" key={u._id}>
          <div className="listing-top">
            <h3>{u.organization || u.name}</h3>
            <span className="status claimed">{u.role}</span>
          </div>
          <p className="meta">{u.name}, {u.email}{u.phone && `, ${u.phone}`}</p>
          <div className="actions"><button className="btn" onClick={() => verify(u._id)}>Approve</button></div>
        </article>
      ))}
    </div>
  );
}
