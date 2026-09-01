'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function About() {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">About Us</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-12"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white shadow-xl">
              <Image
                src="https://i.postimg.cc/Hn9QCRjt/Screenshot-20260901-203444-Instagram-(1).jpg"
                alt="Naveen - Founder"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            
            <div className="text-center md:text-left flex-1">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Naveen</h3>
              <p className="text-blue-600 font-semibold mb-4">Founder & Developer</p>
              <p className="text-gray-700 leading-relaxed mb-6">
                Passionate about creating free tools to make PDF management easier for everyone. 
                Dedicated to providing high-quality, user-friendly solutions without any cost.
              </p>
              
              <div className="flex gap-4 justify-center md:justify-start">
                <a 
                  href="https://github.com/seeubot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                >
                  GitHub
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
