'use client'

import { motion } from 'framer-motion'
import ToolCard from '@/components/ToolCard'
import About from '@/components/About'

const tools = [
  {
    icon: '🔗',
    title: 'Merge PDF',
    description: 'Combine multiple PDFs into one single document',
    href: '/tools/merge',
    color: 'bg-blue-100'
  },
  {
    icon: '✂️',
    title: 'Split PDF',
    description: 'Split PDFs into multiple separate files',
    href: '/tools/split',
    color: 'bg-green-100'
  },
  {
    icon: '🖼️',
    title: 'Image to PDF',
    description: 'Convert images to PDF format easily',
    href: '/tools/image-to-pdf',
    color: 'bg-purple-100'
  },
  {
    icon: '🔒',
    title: 'Protect PDF',
    description: 'Add password protection to your PDFs',
    href: '/tools/protect',
    color: 'bg-red-100'
  },
  {
    icon: '📝',
    title: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining quality',
    href: '/tools/compress',
    color: 'bg-yellow-100'
  },
  {
    icon: '🔄',
    title: 'Rotate PDF',
    description: 'Rotate PDF pages to the correct orientation',
    href: '/tools/rotate',
    color: 'bg-indigo-100'
  }
]

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Every tool you need to work with PDFs
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 opacity-90"
          >
            Merge, split, compress, and convert PDFs - all in one place, completely free!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <a
              href="#tools"
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold text-lg hover:shadow-xl transition"
            >
              Get Started
            </a>
          </motion.div>
        </div>
        
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-white opacity-10 rounded-full"></div>
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white opacity-10 rounded-full"></div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Tools</h2>
            <p className="text-xl text-gray-600">Choose from our collection of free PDF tools</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      {/* About Section */}
      <About />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to work with your PDFs?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start using our free tools now - no registration required!
          </p>
          <a
            href="#tools"
            className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold text-lg hover:shadow-xl transition inline-block"
          >
            Explore Tools
          </a>
        </div>
      </section>
    </div>
  )
}
