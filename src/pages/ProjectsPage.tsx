import { ProjectCard } from '../components/ProjectCard'
import { projects } from '../data/projects'

export function ProjectsPage() {
  return (
    <section className="section route-section">
      <div className="section-heading">
        <p className="eyebrow">Projects</p>
        <h1>Project Library</h1>
        <p>
          A dedicated place for engineering write-ups, build notes, images, and
          source links as the portfolio grows.
        </p>
      </div>

      <div className="project-grid">
        {projects.map((project) => (
          <ProjectCard project={project} key={project.slug} />
        ))}
      </div>
    </section>
  )
}
