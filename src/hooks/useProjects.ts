import { useEffect, useState } from 'react'
import type { Project } from '../data/projects'
import {
  getFeaturedProjects,
  getProjectBySlug,
  getPublishedProjects,
} from '../services/projectService'

type ProjectState = {
  projects: Project[]
  isLoading: boolean
}

export function usePublishedProjects() {
  const [state, setState] = useState<ProjectState>({
    projects: [],
    isLoading: true,
  })

  useEffect(() => {
    let isActive = true

    getPublishedProjects().then((projects) => {
      if (isActive) {
        setState({ projects, isLoading: false })
      }
    })

    return () => {
      isActive = false
    }
  }, [])

  return state
}

export function useFeaturedProjects() {
  const [state, setState] = useState<ProjectState>({
    projects: [],
    isLoading: true,
  })

  useEffect(() => {
    let isActive = true

    getFeaturedProjects().then((projects) => {
      if (isActive) {
        setState({ projects, isLoading: false })
      }
    })

    return () => {
      isActive = false
    }
  }, [])

  return state
}

export function useProject(slug: string | undefined) {
  const [state, setState] = useState<{
    isLoading: boolean
    project: Project | null
    slug: string | undefined
  }>({
    isLoading: Boolean(slug),
    project: null,
    slug,
  })

  useEffect(() => {
    let isActive = true

    if (!slug) {
      return
    }

    getProjectBySlug(slug).then((project) => {
      if (isActive) {
        setState({ isLoading: false, project, slug })
      }
    })

    return () => {
      isActive = false
    }
  }, [slug])

  return {
    project: state.slug === slug ? state.project : null,
    isLoading: Boolean(slug) && (state.slug !== slug || state.isLoading),
  }
}
