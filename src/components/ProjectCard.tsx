import { Link } from 'react-router-dom'
import type { Project } from '../data/projects'

type ProjectCardProps = {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="project-card">
      <p className="project-course">{project.course}</p>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <div className="tool-list">
        {project.tools.map((tool) => (
          <span key={tool}>{tool}</span>
        ))}
      </div>
      <Link className="text-link" to={`/projects/${project.slug}`}>
        View project
      </Link>
    </article>
  )
}
