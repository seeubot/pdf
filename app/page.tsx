'use client'

import { motion } from 'framer-motion'
import ToolCard from '../components/ToolCard'

const tools = [
  {
    icon: 'M',
    title: 'Merge PDF',
    description: 'Combine multiple PDFs into one single document',
    href: '/tools/merge',
    color: 'bg-teal-100'
  },
  {
    icon: 'S',
    title: 'Split PDF',
    description: 'Split PDFs into multiple separate files',
    href: '/tools/split',
    color: 'bg-cyan-100'
  },
  {
    icon: 'I',
    title: 'Image to PDF',
    description: 'Convert images to PDF format easily',
    href: '/tools/image-to-pdf',
    color: 'bg-emerald-100'
  },
  {
    icon: 'P',
    title: 'Protect PDF',
    description: 'Add password protection to your PDFs',
    href: '/tools/protect',
    color: 'bg-sky-100'
  },
    {
    icon: 'C',
    title: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining quality',
    href: '/tools/compress',
    color: 'bg-orange-100'
  }
]

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-600 to-cyan-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-24 md:py-32 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            PDF Tools for Everyone
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl mb-10 opacity-90 max-w-2xl mx-auto"
          >
            Merge, split, convert, and protect PDFs - all in one place, completely free
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <a
              href="#tools"
              className="bg-white text-teal-700 px-10 py-4 rounded-full font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all inline-block"
            >
              Get Started
            </a>
          </motion.div>
        </div>

        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 112C120 104 240 88 360 80C480 72 600 72 720 76C840 80 960 88 1080 92C1200 96 1320 96 1380 96L1440 96V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Tools</h2>
            <p className="text-xl text-gray-600">Choose from our collection of free PDF tools</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <ToolCard {...tool} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-cyan-700">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to work with your PDFs?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start using our free tools now - no registration required
          </p>
          <a
            href="#tools"
            className="bg-white text-teal-700 px-10 py-4 rounded-full font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all inline-block"
          >
            Explore Tools
          </a>
        </div>
      </section>
    </div>
  )
}
