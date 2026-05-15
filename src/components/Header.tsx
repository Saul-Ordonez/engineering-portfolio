import { NavLink } from 'react-router-dom'

export function Header() {
  return (
    <header className="site-header">
      <NavLink className="logo" to="/" aria-label="Saúl Ordonez home">
        SO
      </NavLink>
      <nav className="nav-links" aria-label="Main navigation">
        <NavLink to="/projects">Projects</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact</NavLink>
      </nav>
    </header>
  )
}
