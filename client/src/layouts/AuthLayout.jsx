import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

export default function AuthLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <a href="#auth-main" className="visually-hidden-focusable btn btn-light position-absolute m-2" style={{ zIndex: 2000 }}>Skip to content</a>
      <Navbar />
      <main id="auth-main" className="flex-grow-1">
        <Outlet />
      </main>
    </div>
  );
}
