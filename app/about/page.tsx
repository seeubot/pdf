'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">About Us</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-600 to-cyan-600 mx-auto"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
        >
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative w-48 h-48 md:w-60 md:h-60 rounded-full overflow-hidden border-4 border-teal-600 shadow-xl">
              <Image
                src="https://i.postimg.cc/Hn9QCRjt/Screenshot-20260901-203444-Instagram-(1).jpg"
                alt="Naveen - Founder"
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Naveen</h2>
              <p className="text-teal-600 font-semibold mb-4">Founder and Developer</p>
              <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                Passionate about creating free tools to make PDF management easier for everyone. 
                Dedicated to providing high-quality, user-friendly solutions without any cost.
              </p>

              <div className="flex gap-4 justify-center md:justify-start">
              
                <a
                  href="https://www.linkedin.com/in/naveen-s-816b94235"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                  </svg>
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
