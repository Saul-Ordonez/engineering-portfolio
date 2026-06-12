import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { adminEmail, isSupabaseConfigured, supabase } from '../lib/supabase'
import {
  createProject,
  deleteProject,
  getAdminProjects,
  uploadProjectMedia,
  updateProject,
  type AdminProject,
  type ProjectInput,
} from '../services/projectService'
import { getErrorMessage } from '../utils/errorMessage'

const emptyProject: ProjectInput = {
  slug: '',
  title: '',
  course: '',
  tools: [],
  description: '',
  notes: '',
  imageUrls: [],
  videoUrls: [],
  coverImageUrl: '',
  featured: true,
  displayOrder: 0,
  isPublished: true,
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toProjectInput(project: AdminProject): ProjectInput {
  return {
    slug: project.slug,
    title: project.title,
    course: project.course,
    tools: project.tools,
    description: project.description,
    notes: project.notes ?? '',
    imageUrls: project.imageUrls ?? [],
    videoUrls: project.videoUrls ?? [],
    coverImageUrl: project.coverImageUrl ?? project.imageUrls?.[0] ?? '',
    featured: project.featured,
    displayOrder: project.displayOrder,
    isPublished: project.isPublished,
  }
}

export function AdminProjectsPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [email, setEmail] = useState(adminEmail ?? '')
  const [authMessage, setAuthMessage] = useState('')
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm] = useState<ProjectInput>(emptyProject)
  const [toolsText, setToolsText] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(supabase))
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const canManage = useMemo(() => {
    return Boolean(
      isSupabaseConfigured &&
        adminEmail &&
        session?.user.email?.toLowerCase() === adminEmail.toLowerCase(),
    )
  }, [session])

  useEffect(() => {
    if (!supabase) {
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!canManage) {
      return
    }

    void loadProjects()
  }, [canManage])

  function updateForm(nextForm: ProjectInput) {
    setForm(nextForm)
    setToolsText(nextForm.tools.join(', '))
  }

  async function loadProjects() {
    setErrorMessage('')

    try {
      const nextProjects = await getAdminProjects()
      setProjects(nextProjects)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Could not load projects.'))
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!supabase) {
      return
    }

    setAuthMessage('')
    setErrorMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/projects`,
      },
    })

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setAuthMessage('Check your email for a sign-in link.')
  }

  async function handleLogout() {
    if (!supabase) {
      return
    }

    await supabase.auth.signOut()
    setSelectedId(null)
    updateForm(emptyProject)
  }

  function handleSelect(project: AdminProject) {
    setSelectedId(project.id)
    updateForm(toProjectInput(project))
  }

  function handleNewProject() {
    setSelectedId(null)
    updateForm({
      ...emptyProject,
      displayOrder: projects.length + 1,
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setErrorMessage('')

    const nextProject = {
      ...form,
      slug: form.slug || slugify(form.title),
      tools: toolsText
        .split(',')
        .map((tool) => tool.trim())
        .filter(Boolean),
      coverImageUrl:
        form.coverImageUrl && form.imageUrls.includes(form.coverImageUrl)
          ? form.coverImageUrl
          : form.imageUrls[0] || '',
    }

    try {
      if (selectedId) {
        await updateProject(selectedId, nextProject)
      } else {
        await createProject(nextProject)
      }

      updateForm(emptyProject)
      setSelectedId(null)
      await loadProjects()
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Could not save project.'))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleMediaUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    const projectSlug = form.slug || slugify(form.title)

    if (!files.length) {
      return
    }

    if (!projectSlug) {
      setErrorMessage('Add a project title or slug before uploading media.')
      event.target.value = ''
      return
    }

    setIsUploading(true)
    setErrorMessage('')

    try {
      const uploadedMedia = await Promise.all(
        files.map((file) => uploadProjectMedia(file, projectSlug)),
      )
      const imageUrls = uploadedMedia
        .filter((media) => media.type === 'images')
        .map((media) => media.url)
      const videoUrls = uploadedMedia
        .filter((media) => media.type === 'videos')
        .map((media) => media.url)

      setForm((current) => ({
        ...current,
        imageUrls: [...current.imageUrls, ...imageUrls],
        videoUrls: [...current.videoUrls, ...videoUrls],
        coverImageUrl: current.coverImageUrl || imageUrls[0] || '',
      }))
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Could not upload media.'))
    } finally {
      event.target.value = ''
      setIsUploading(false)
    }
  }

  function handleRemoveImage(imageUrl: string) {
    setForm((current) => {
      const imageUrls = current.imageUrls.filter((url) => url !== imageUrl)

      return {
        ...current,
        imageUrls,
        coverImageUrl:
          current.coverImageUrl === imageUrl
            ? imageUrls[0] || ''
            : current.coverImageUrl,
      }
    })
  }

  function handleRemoveVideo(videoUrl: string) {
    setForm((current) => ({
      ...current,
      videoUrls: current.videoUrls.filter((url) => url !== videoUrl),
    }))
  }

  async function handleDelete() {
    if (!selectedId || !window.confirm('Delete this project?')) {
      return
    }

    setIsSaving(true)
    setErrorMessage('')

    try {
      await deleteProject(selectedId)
      updateForm(emptyProject)
      setSelectedId(null)
      await loadProjects()
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Could not delete project.'))
    } finally {
      setIsSaving(false)
    }
  }

  if (!isSupabaseConfigured || !adminEmail) {
    return (
      <section className="section route-section admin-page">
        <div className="admin-panel">
          <p className="eyebrow">Admin setup</p>
          <h1>Connect Supabase first</h1>
          <p>
            Add <code>VITE_SUPABASE_URL</code>,{' '}
            <code>VITE_SUPABASE_ANON_KEY</code>, and{' '}
            <code>VITE_ADMIN_EMAIL</code> to your local environment, then restart
            Vite.
          </p>
        </div>
      </section>
    )
  }

  if (isLoading) {
    return (
      <section className="section route-section admin-page">
        <p>Loading admin...</p>
      </section>
    )
  }

  if (!session || !canManage) {
    return (
      <section className="section route-section admin-page">
        <div className="admin-panel admin-login">
          <p className="eyebrow">Project Admin</p>
          <h1>Sign in</h1>
          <form className="admin-form" onSubmit={handleLogin}>
            <label>
              Email
              <input
                autoComplete="email"
                inputMode="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>
            <button className="button primary-button" type="submit">
              Send sign-in link
            </button>
          </form>
          {authMessage ? <p className="success-message">{authMessage}</p> : null}
          {session && !canManage ? (
            <p className="error-message">
              This account is signed in, but it is not the configured admin.
            </p>
          ) : null}
          {errorMessage ? <p className="error-message">{errorMessage}</p> : null}
        </div>
      </section>
    )
  }

  return (
    <section className="section route-section admin-page">
      <div className="admin-toolbar">
        <div>
          <p className="eyebrow">Project Admin</p>
          <h1>Manage projects</h1>
        </div>
        <button className="button secondary-button" onClick={handleLogout}>
          Sign out
        </button>
      </div>

      {errorMessage ? <p className="error-message">{errorMessage}</p> : null}

      <div className="admin-layout">
        <aside className="admin-list" aria-label="Projects">
          <button className="button primary-button" onClick={handleNewProject}>
            New project
          </button>
          {projects.map((project) => (
            <button
              className={
                project.id === selectedId
                  ? 'project-row project-row-active'
                  : 'project-row'
              }
              key={project.id}
              onClick={() => handleSelect(project)}
            >
              <span>{project.title}</span>
              <small>{project.isPublished ? 'Published' : 'Draft'}</small>
            </button>
          ))}
        </aside>

        <form className="admin-form admin-panel" onSubmit={handleSubmit}>
          <div className="admin-form-header">
            <div>
              <p className="eyebrow">
                {selectedId ? 'Edit project' : 'New project'}
              </p>
              <h2>{selectedId ? form.title || 'Untitled' : 'Project details'}</h2>
            </div>
            {selectedId ? (
              <button
                className="button danger-button"
                disabled={isSaving}
                onClick={handleDelete}
                type="button"
              >
                Delete
              </button>
            ) : null}
          </div>

          <label>
            Title
            <input
              onBlur={() =>
                setForm((current) => ({
                  ...current,
                  slug: current.slug || slugify(current.title),
                }))
              }
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              required
              value={form.title}
            />
          </label>

          <div className="admin-field-grid">
            <label>
              Slug
              <input
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    slug: slugify(event.target.value),
                  }))
                }
                required
                value={form.slug}
              />
            </label>
            <label>
              Course
              <input
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    course: event.target.value,
                  }))
                }
                required
                value={form.course}
              />
            </label>
          </div>

          <label>
            Description
            <textarea
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              required
              rows={5}
              value={form.description}
            />
          </label>

          <label>
            Project notes
            <textarea
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
              placeholder="Problem statement, design decisions, test results, build notes, links..."
              rows={7}
              value={form.notes}
            />
          </label>

          <label>
            Tools
            <input
              onChange={(event) => setToolsText(event.target.value)}
              placeholder="Raspberry Pi Pico, MicroPython, PWM"
              value={toolsText}
            />
          </label>

          <div className="media-admin-block">
            <div>
              <p className="eyebrow">Media</p>
              <h3>Images and videos</h3>
            </div>

            <label>
              Upload files
              <input
                accept="image/*,video/*"
                disabled={isUploading}
                multiple
                onChange={handleMediaUpload}
                type="file"
              />
            </label>

            {form.imageUrls.length > 0 ? (
              <div className="media-preview-section">
                <h4>Images</h4>
                <div className="media-preview-grid">
                  {form.imageUrls.map((imageUrl) => {
                    const isCover = form.coverImageUrl === imageUrl

                    return (
                      <div className="media-preview-card" key={imageUrl}>
                        <img src={imageUrl} alt="" />
                        <div className="media-preview-actions">
                          <button
                            className={
                              isCover
                                ? 'media-action media-action-active'
                                : 'media-action'
                            }
                            onClick={() =>
                              setForm((current) => ({
                                ...current,
                                coverImageUrl: imageUrl,
                              }))
                            }
                            type="button"
                          >
                            {isCover ? 'Highlight image' : 'Use as highlight'}
                          </button>
                          <button
                            className="media-action danger-action"
                            onClick={() => handleRemoveImage(imageUrl)}
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {form.videoUrls.length > 0 ? (
              <div className="media-preview-section">
                <h4>Videos</h4>
                <div className="media-preview-grid">
                  {form.videoUrls.map((videoUrl) => (
                    <div className="media-preview-card" key={videoUrl}>
                      <video controls preload="metadata">
                        <source src={videoUrl} />
                      </video>
                      <div className="media-preview-actions">
                        <button
                          className="media-action danger-action"
                          onClick={() => handleRemoveVideo(videoUrl)}
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {isUploading ? <p className="success-message">Uploading media...</p> : null}
          </div>

          <div className="admin-field-grid">
            <label>
              Display order
              <input
                min={0}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    displayOrder: Number(event.target.value),
                  }))
                }
                type="number"
                value={form.displayOrder}
              />
            </label>
            <div className="toggle-group">
              <label>
                <input
                  checked={form.featured}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      featured: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
                Featured
              </label>
              <label>
                <input
                  checked={form.isPublished}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isPublished: event.target.checked,
                    }))
                  }
                  type="checkbox"
                />
                Published
              </label>
            </div>
          </div>

          <button className="button primary-button" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save project'}
          </button>
        </form>
      </div>
    </section>
  )
}
