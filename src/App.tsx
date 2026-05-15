import './App.css'
import { AboutSection } from './components/AboutSection'
import { ContactSection } from './components/ContactSection'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { ProjectsSection } from './components/ProjectsSection'

function App() {
  return (
    <main className="page-shell">
      <Header />
      <Hero />
      <ProjectsSection />
      <AboutSection />
      <ContactSection />
    </main>
  )
}

export default App
