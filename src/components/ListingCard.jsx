import Countdown from './Countdown';

const fmt = (d) => new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
const typeLabel = { veg: 'Vegetarian', 'non-veg': 'Non-vegetarian', bakery: 'Bakery', other: 'Other' };

export default function ListingCard({ listing, children }) {
  const donor = listing.donor && typeof listing.donor === 'object' ? listing.donor : null;
  return (
    <article className="card listing">
      <div className="listing-top">
        <h3>{listing.title}</h3>
        {listing.status === 'available' ? (
          <Countdown until={listing.pickupBefore} />
        ) : (
          <span className={`status ${listing.status}`}>{listing.status}</span>
        )}
      </div>
      <p className="meta">
        {listing.quantity} servings, {typeLabel[listing.foodType] || listing.foodType}
        {donor && <> from {donor.organization || donor.name}</>}
      </p>
      <p className="meta">{listing.address}</p>
      <p className="meta">Cooked {fmt(listing.cookedAt)}. Pick up before {fmt(listing.pickupBefore)}.</p>
      {listing.storageNotes && <p className="meta">Storage: {listing.storageNotes}</p>}
      {children && <div className="actions">{children}</div>}
    </article>
  );
}
