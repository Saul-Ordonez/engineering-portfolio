export function Header() {
  return (
    <header className="site-header">
      <a className="logo" href="#top" aria-label="Saúl Ordonez home">
        SO
      </a>
      <nav className="nav-links" aria-label="Main navigation">
        <a href="#projects">Projects</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </nav>
    </header>
  )
}