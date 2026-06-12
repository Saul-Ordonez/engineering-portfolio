import { projects as localProjects, type Project } from '../data/projects'
import { supabase } from '../lib/supabase'

export type ProjectInput = {
  slug: string
  title: string
  course: string
  tools: string[]
  description: string
  featured: boolean
  displayOrder: number
  isPublished: boolean
}

type ProjectRow = {
  id?: string
  slug: string
  title: string
  course: string
  tools: string[] | null
  description: string
  featured: boolean | null
  display_order: number | null
  is_published: boolean | null
}

export type AdminProject = Project & {
  id: string
  featured: boolean
  displayOrder: number
  isPublished: boolean
}

const projectColumns =
  'id, slug, title, course, tools, description, featured, display_order, is_published'

function fromRow(row: ProjectRow): Project {
  return {
    slug: row.slug,
    title: row.title,
    course: row.course,
    tools: row.tools ?? [],
    description: row.description,
    featured: Boolean(row.featured),
    displayOrder: row.display_order ?? 0,
    isPublished: row.is_published ?? true,
  }
}

function toRow(project: ProjectInput): Omit<ProjectRow, 'id'> {
  return {
    slug: project.slug,
    title: project.title,
    course: project.course,
    tools: project.tools,
    description: project.description,
    featured: project.featured,
    display_order: project.displayOrder,
    is_published: project.isPublished,
  }
}

export async function getPublishedProjects() {
  if (!supabase) {
    return localProjects
  }

  const { data, error } = await supabase
    .from('projects')
    .select(projectColumns)
    .eq('is_published', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Could not load Supabase projects.', error)
    return localProjects
  }

  return data.map(fromRow)
}

export async function getFeaturedProjects() {
  const publishedProjects = await getPublishedProjects()

  return publishedProjects.filter((project) => project.featured)
}

export async function getProjectBySlug(slug: string) {
  const publishedProjects = await getPublishedProjects()

  return publishedProjects.find((project) => project.slug === slug) ?? null
}

export async function getAdminProjects(): Promise<AdminProject[]> {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('projects')
    .select(projectColumns)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return data.map((row) => ({
    ...fromRow(row),
    id: row.id ?? row.slug,
    featured: Boolean(row.featured),
    displayOrder: row.display_order ?? 0,
    isPublished: row.is_published ?? true,
  }))
}

export async function createProject(project: ProjectInput) {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  const { error } = await supabase.from('projects').insert(toRow(project))

  if (error) {
    throw error
  }
}

export async function updateProject(id: string, project: ProjectInput) {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  const { error } = await supabase
    .from('projects')
    .update(toRow(project))
    .eq('id', id)

  if (error) {
    throw error
  }
}

export async function deleteProject(id: string) {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  const { error } = await supabase.from('projects').delete().eq('id', id)

  if (error) {
    throw error
  }
}
