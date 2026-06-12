import { useFeaturedProjects } from '../hooks/useProjects'
import { ProjectCard } from './ProjectCard'

export function ProjectsSection() {
  const { projects, isLoading } = useFeaturedProjects()

  return (
    <section className="section" id="projects">
      <div className="section-heading">
        <p className="eyebrow">Selected Work</p>
        <h2>Engineering Projects</h2>
        <p>
          These placeholder entries give the site structure. As each project is
          finished, the cards can link to write-ups, GitHub repositories, photos,
          diagrams, or demo videos.
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
