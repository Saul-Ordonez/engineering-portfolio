import { Link } from 'react-router-dom'

export function Hero() {
  return (
    <section className="hero-section" id="top">
      <div className="hero-copy">
        <p className="eyebrow">Engineering Student Portfolio</p>
        <p className="hero-name">Saúl Ordonez</p>
        <h1>Projects, notes, and builds from my engineering path.</h1>
        <p className="hero-text">
          I’m documenting the circuits, code, models, and design decisions I’m
          working through as I grow as an engineer. This portfolio is a record
          of what I’ve built, what I’m learning, and how I think through
          technical problems.
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

      <aside className="hero-card profile-card" aria-label="Saúl Ordonez profile snapshot">
        <div className="portrait-placeholder" aria-hidden="true">
          SO
        </div>
        <div>
          <p className="card-label">Current Focus</p>
          <h2>Electronics + Embedded Systems</h2>
          <ul>
            <li>Raspberry Pi Pico / MicroPython labs</li>
            <li>Circuit analysis and sensor projects</li>
            <li>CAD modeling and technical documentation</li>
          </ul>
        </div>
      </aside>
    </section>
  )
}
