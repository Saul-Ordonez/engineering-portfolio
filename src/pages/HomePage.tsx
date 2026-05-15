import { AboutSection } from '../components/AboutSection'
import { ContactSection } from '../components/ContactSection'
import { Hero } from '../components/Hero'
import { ProjectsSection } from '../components/ProjectsSection'

export function HomePage() {
  return (
    <>
      <Hero />
      <ProjectsSection />
      <AboutSection />
      <ContactSection />
    </>
  )
}
