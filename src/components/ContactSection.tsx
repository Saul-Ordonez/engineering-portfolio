export function ContactSection() {
  return (
    <section className="section contact-section" id="contact">
      <p className="eyebrow">Contact</p>
      <h2>Let’s connect.</h2>
      <p>
        This section can eventually include email, GitHub, LinkedIn, a resume link,
        and project-specific contact information.
      </p>
      <div className="contact-links">
        <a href="mailto:your.email@example.com">Email</a>
        <a href="https://github.com/" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      </div>
    </section>
  )
}