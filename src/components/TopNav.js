import { Link, NavLink } from 'react-router-dom';

function navLinkClass({ isActive }) {
  return isActive ? 'topnav-link topnav-link--active' : 'topnav-link';
}

function NotesLogo() {
  return (
    <svg
      className="topnav-logo"
      viewBox="0 0 24 24"
      width="26"
      height="26"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 12h8v2H8v-2zm0 4h8v2H8v-2z"
      />
    </svg>
  );
}

/**
 * Primary site navigation. Keeps #home and #add for existing tests and page objects.
 */
export default function TopNav() {
  return (
    <nav className="topnav" aria-label="Main">
      <div className="topnav-inner">
        <Link to="/" className="topnav-brand">
          <NotesLogo />
          <span className="topnav-title">Notes Demo</span>
        </Link>
        <ul className="topnav-list">
          <li>
            <NavLink id="home" to="/" end className={navLinkClass}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink id="add" to="/add" className={navLinkClass}>
              Add Note
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}
