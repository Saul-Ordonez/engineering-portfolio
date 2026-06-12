import { Link, Navigate, useParams } from 'react-router-dom'
import { useProject } from '../hooks/useProjects'

export function ProjectDetailPage() {
  const { slug } = useParams()
  const { project, isLoading } = useProject(slug)

  if (isLoading) {
    return (
      <section className="section route-section">
        <p>Loading project...</p>
      </section>
    )
  }

  if (!project) {
    return <Navigate to="/projects" replace />
  }

  const imageUrls = project.imageUrls ?? []
  const videoUrls = project.videoUrls ?? []
  const hasMedia = imageUrls.length > 0 || videoUrls.length > 0
  const projectNotes =
    project.notes?.trim() ||
    'This route is ready for the full case study: problem statement, design decisions, diagrams, build photos, test results, and links to supporting materials.'

  return (
    <section className="section route-section">
      <Link className="text-link" to="/projects">
        Back to projects
      </Link>

      <div className="project-detail">
        <p className="eyebrow">{project.course}</p>
        <h1>{project.title}</h1>
        <p>{project.description}</p>

        {hasMedia ? (
          <div className="project-media-section">
            {imageUrls.length > 0 ? (
              <div className="project-image-grid">
                {imageUrls.map((imageUrl) => (
                  <img key={imageUrl} src={imageUrl} alt="" />
                ))}
              </div>
            ) : null}

            {videoUrls.length > 0 ? (
              <div className="project-video-grid">
                {videoUrls.map((videoUrl) => (
                  <video controls key={videoUrl} preload="metadata">
                    <source src={videoUrl} />
                  </video>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="detail-block">
          <h2>Project Notes</h2>
          <p>{projectNotes}</p>
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
