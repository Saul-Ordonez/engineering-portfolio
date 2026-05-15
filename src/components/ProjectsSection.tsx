import { projects } from '../data/projects'
import { ProjectCard } from './ProjectCard'

export function ProjectsSection() {
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
        {projects.map((project) => (
          <ProjectCard project={project} key={project.title} />
        ))}
      </div>
    </section>
  )
}