import { useEffect, useState } from 'react';

export function timeLeft(date) {
  const ms = new Date(date) - Date.now();
  if (ms <= 0) return { text: 'Expired', level: 'expired' };
  const mins = Math.floor(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const text = h > 0 ? `${h}h ${m}m left` : `${m}m left`;
  return { text, level: mins < 30 ? 'urgent' : mins < 90 ? 'soon' : 'ok' };
}

// The pickup window. Turns amber, then red as time runs out.
export default function Countdown({ until }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);
  const { text, level } = timeLeft(until);
  return <span className={`window ${level}`}>{text}</span>;
}
