import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { adminEmail, isSupabaseConfigured, supabase } from '../lib/supabase'
import {
  createProject,
  deleteProject,
  getAdminProjects,
  updateProject,
  type AdminProject,
  type ProjectInput,
} from '../services/projectService'

const emptyProject: ProjectInput = {
  slug: '',
  title: '',
  course: '',
  tools: [],
  description: '',
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
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not load projects.',
      )
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
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not save project.',
      )
    } finally {
      setIsSaving(false)
    }
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
      setErrorMessage(
        error instanceof Error ? error.message : 'Could not delete project.',
      )
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
            Tools
            <input
              onChange={(event) => setToolsText(event.target.value)}
              placeholder="Raspberry Pi Pico, MicroPython, PWM"
              value={toolsText}
            />
          </label>

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
