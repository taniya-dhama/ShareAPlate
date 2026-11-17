import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { socket } from '../socket';
import ListingCard from '../components/ListingCard';
import { ListingsMap } from '../components/Maps';

export default function Receiver() {
  const [listings, setListings] = useState([]);
  const [mine, setMine] = useState([]);
  const [here, setHere] = useState(null); // [lat, lng]
  const [km, setKm] = useState(10);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const load = useCallback(() => {
    const params = here ? { lat: here[0], lng: here[1], km } : {};
    api.get('/listings', { params }).then((r) => setListings(r.data)).catch(() => {});
    api.get('/listings/mine').then((r) => setMine(r.data)).catch(() => {});
  }, [here, km]);

  useEffect(() => {
    load();
    ['listing:new', 'listing:claimed', 'listing:expired'].forEach((ev) => socket.on(ev, load));
    return () => ['listing:new', 'listing:claimed', 'listing:expired'].forEach((ev) => socket.off(ev, load));
  }, [load]);

  const findNearMe = () => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setHere([p.coords.latitude, p.coords.longitude]),
      () => setMsg({ type: 'error', text: 'Could not get your location. Allow location access in your browser.' })
    );
  };

  const claim = async (id) => {
    try {
      const { data } = await api.post(`/listings/${id}/claim`, {});
      setMsg({ type: 'ok', text: `Claimed. Show code ${data.pickupCode} to the donor when you collect.` });
      load();
    } catch (err) {
      setMsg({ type: 'error', text: errMsg(err) });
      load();
    }
  };

  const claimed = mine.filter((l) => l.status === 'claimed');

  return (
    <div>
      <div className="row-between">
        <h2>Food available now</h2>
        <div className="inline">
          <select value={km} onChange={(e) => setKm(Number(e.target.value))} aria-label="Search distance">
            {[2, 5, 10, 25, 50].map((n) => <option key={n} value={n}>Within {n} km</option>)}
          </select>
          <button className="btn ghost" onClick={findNearMe}>Find near me</button>
        </div>
      </div>

      {msg.text && <p className={`banner ${msg.type === 'error' ? 'error' : 'ok'}`}>{msg.text}</p>}

      {claimed.length > 0 && (
        <div className="card codes">
          <h3>Your pickups</h3>
          {claimed.map((l) => (
            <p key={l._id}><strong>{l.title}</strong> at {l.address}. Your code: <span className="code">{l.pickupCode}</span></p>
          ))}
        </div>
      )}

      <div className="two-col">
        <section>
          {listings.length === 0 && <p className="empty">No food listed right now. New listings appear here instantly.</p>}
          {listings.map((l) => (
            <ListingCard key={l._id} listing={l}>
              <button className="btn" onClick={() => claim(l._id)}>Claim this food</button>
            </ListingCard>
          ))}
        </section>
        <section>
          <ListingsMap listings={listings} center={here} />
        </section>
      </div>
    </div>
  );
}
