import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { socket } from '../socket';
import ListingCard from '../components/ListingCard';
import { PickerMap } from '../components/Maps';

const toInput = (d) => {
  const x = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return x.toISOString().slice(0, 16);
};
const blank = () => ({
  title: '', foodType: 'veg', quantity: '', storageNotes: '', address: '',
  cookedAt: toInput(new Date()),
  pickupBefore: toInput(new Date(Date.now() + 3 * 3600 * 1000)),
});

export default function Donor() {
  const [form, setForm] = useState(blank());
  const [pos, setPos] = useState(null); // [lat, lng]
  const [mine, setMine] = useState([]);
  const [codes, setCodes] = useState({});
  const [msg, setMsg] = useState({ type: '', text: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const load = useCallback(() => {
    api.get('/listings/mine').then((r) => setMine(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    load();
    ['listing:new', 'listing:claimed', 'listing:expired'].forEach((ev) => socket.on(ev, load));
    return () => ['listing:new', 'listing:claimed', 'listing:expired'].forEach((ev) => socket.off(ev, load));
  }, [load]);

  const useMyLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setPos([p.coords.latitude, p.coords.longitude]),
      () => setMsg({ type: 'error', text: 'Could not get your location. Click the map to set it instead.' })
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!pos) return setMsg({ type: 'error', text: 'Set the pickup spot: use your location or click the map.' });
    try {
      await api.post('/listings', {
        ...form,
        quantity: Number(form.quantity),
        cookedAt: new Date(form.cookedAt).toISOString(),
        pickupBefore: new Date(form.pickupBefore).toISOString(),
        lat: pos[0],
        lng: pos[1],
      });
      setMsg({ type: 'ok', text: 'Posted. Receivers nearby can see it now.' });
      setForm(blank());
      load();
    } catch (err) {
      setMsg({ type: 'error', text: errMsg(err) });
    }
  };

  const confirm = async (id) => {
    try {
      await api.post(`/listings/${id}/complete`, { code: codes[id] });
      setMsg({ type: 'ok', text: 'Handover confirmed. Thank you.' });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: errMsg(err) });
    }
  };

  return (
    <div className="two-col">
      <section>
        <h2>Post surplus food</h2>
        <form className="card form" onSubmit={submit}>
          <label>What is it?<input required placeholder="e.g. Dal, rice and 40 rotis" value={form.title} onChange={set('title')} /></label>
          <div className="row">
            <label>Servings<input type="number" min="1" required value={form.quantity} onChange={set('quantity')} /></label>
            <label>Type
              <select value={form.foodType} onChange={set('foodType')}>
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-vegetarian</option>
                <option value="bakery">Bakery</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>
          <div className="row">
            <label>Cooked at<input type="datetime-local" required value={form.cookedAt} onChange={set('cookedAt')} /></label>
            <label>Pick up before<input type="datetime-local" required value={form.pickupBefore} onChange={set('pickupBefore')} /></label>
          </div>
          <label>Storage notes<input placeholder="e.g. kept hot, covered, in steel containers" value={form.storageNotes} onChange={set('storageNotes')} /></label>
          <label>Pickup address<input required value={form.address} onChange={set('address')} /></label>
          <div>
            <div className="row-between">
              <span className="label-text">Pickup spot on the map</span>
              <button type="button" className="btn ghost" onClick={useMyLocation}>Use my location</button>
            </div>
            <PickerMap value={pos} onChange={setPos} />
          </div>
          {msg.text && <p className={msg.type === 'error' ? 'error' : 'ok'}>{msg.text}</p>}
          <button className="btn" type="submit">Post food</button>
        </form>
      </section>

      <section>
        <h2>Your listings</h2>
        {mine.length === 0 && <p className="empty">Nothing posted yet. Your first listing will show up here.</p>}
        {mine.map((l) => (
          <ListingCard key={l._id} listing={l}>
            {l.status === 'claimed' && (
              <div className="inline">
                <input
                  placeholder="Receiver's 6-digit code"
                  value={codes[l._id] || ''}
                  onChange={(e) => setCodes({ ...codes, [l._id]: e.target.value })}
                />
                <button className="btn" onClick={() => confirm(l._id)}>Confirm handover</button>
              </div>
            )}
          </ListingCard>
        ))}
      </section>
    </div>
  );
}
