import { NavLink } from 'react-router-dom'

export function Header() {
  return (
    <header className="site-header">
      <NavLink className="site-brand" to="/" aria-label="Saúl Ordonez home">
        <span className="logo">SO</span>
        <span className="brand-text">
          {/* <span>Saúl Ordonez</span> */}
          {/* <span>Engineering Portfolio</span> */}
        </span>
      </NavLink>
      <nav className="nav-links" aria-label="Main navigation">
        <NavLink to="/projects">Projects</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </nav>
    </header>
  )
}
