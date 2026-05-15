import { Link } from 'react-router-dom'

export function Hero() {
  return (
    <section className="hero-section" id="top">
      <div className="hero-copy">
        <p className="eyebrow">Electrical Engineering Student Portfolio</p>
        <h1>Building practical engineering projects from circuits to code.</h1>
        <p className="hero-text">
          I’m Saúl Ordonez, an engineering student documenting hands-on projects
          involving microcontrollers, electronics, programming, CAD, and problem
          solving. This site is where my school and personal builds will live as
          they grow from lab work into a full engineering portfolio.
        </p>
        <div className="hero-actions">
          <Link className="button primary-button" to="/projects">
            View Projects
          </Link>
          <Link className="button secondary-button" to="/contact">
            Get in Touch
          </Link>
        </div>
      </div>

      <aside className="hero-card" aria-label="Portfolio highlights">
        <p className="card-label">Current Focus</p>
        <h2>Electronics + Embedded Systems</h2>
        <ul>
          <li>Raspberry Pi Pico / MicroPython labs</li>
          <li>Circuit analysis and sensor projects</li>
          <li>CAD modeling and technical documentation</li>
        </ul>
      </aside>
    </section>
  )
}
