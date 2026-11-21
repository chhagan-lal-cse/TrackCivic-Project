import { Link } from 'react-router-dom';

export default function Logo({ onDark = false, to = '/' }) {
  return (
    <Link to={to} className={`cf-logo ${onDark ? 'on-dark' : ''}`} aria-label="TrackCivic home">
      <img className="cf-logo-image" src="/trackcivic-logo.png" alt="" />
    </Link>
  );
}
