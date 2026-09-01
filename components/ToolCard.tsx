'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface ToolCardProps {
  icon: string
  title: string
  description: string
  href: string
  color: string
}

export default function ToolCard({ icon, title, description, href, color }: ToolCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
    >
      <Link href={href} className="block p-6">
        <div className={`w-16 h-16 ${color} rounded-lg flex items-center justify-center mb-4`}>
          <span className="text-3xl">{icon}</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
        <div className="mt-4 flex items-center text-blue-600 font-medium">
          Use Tool
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </motion.div>
  )
}
