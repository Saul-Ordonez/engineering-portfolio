export type Project = {
  slug: string
  title: string
  course: string
  tools: string[]
  description: string
}

export const projects: Project[] = [
  {
    slug: 'rgb-led-system',
    title: 'Microcontroller Lab: RGB LED System',
    course: 'ENGR 151',
    tools: ['Raspberry Pi Pico', 'MicroPython', 'PWM', 'VS Code'],
    description:
      'Built and programmed an RGB LED circuit using pulse-width modulation to control color and brightness through code.',
  },
  {
    slug: 'thermistor-temperature-monitor',
    title: 'Thermistor Temperature Monitor',
    course: 'ENGR 151',
    tools: ['Voltage Divider', 'ADC', 'Python', 'Circuit Analysis'],
    description:
      'Used a thermistor and voltage divider circuit to read changing temperature values and trigger status LEDs based on set points.',
  },
  {
    slug: 'cad-design-practice',
    title: 'CAD Design Practice',
    course: 'Engineering Graphics / Personal Practice',
    tools: ['CAD', '3D Modeling', 'Technical Drawings'],
    description:
      'Created mechanical-style models and drawings to practice dimensioning, visualization, and design communication.',
  },
]

const featuredProjectSlugs = [
  'rgb-led-system',
  'thermistor-temperature-monitor',
  'cad-design-practice',
]

export const featuredProjects = featuredProjectSlugs
  .map((slug) => projects.find((project) => project.slug === slug))
  .filter((project): project is Project => Boolean(project))
