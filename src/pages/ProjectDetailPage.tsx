import { Link, Navigate, useParams } from 'react-router-dom'
import { projects } from '../data/projects'

export function ProjectDetailPage() {
  const { slug } = useParams()
  const project = projects.find((item) => item.slug === slug)

  if (!project) {
    return <Navigate to="/projects" replace />
  }

  return (
    <section className="section route-section">
      <Link className="text-link" to="/projects">
        Back to projects
      </Link>

      <div className="project-detail">
        <p className="eyebrow">{project.course}</p>
        <h1>{project.title}</h1>
        <p>{project.description}</p>

        <div className="detail-block">
          <h2>Project Notes</h2>
          <p>
            This route is ready for the full case study: problem statement,
            design decisions, diagrams, build photos, test results, and links to
            supporting materials.
          </p>
        </div>

        <div className="tool-list">
          {project.tools.map((tool) => (
            <span key={tool}>{tool}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
