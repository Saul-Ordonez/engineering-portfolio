import { ProjectCard } from '../components/ProjectCard'
import { usePublishedProjects } from '../hooks/useProjects'

export function ProjectsPage() {
  const { projects, isLoading } = usePublishedProjects()

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
        {isLoading ? <p>Loading projects...</p> : null}
        {projects.map((project) => (
          <ProjectCard project={project} key={project.slug} />
        ))}
      </div>
    </section>
  )
}
