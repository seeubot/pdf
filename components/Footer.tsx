export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-lg font-semibold mb-2">PDF Tools</p>
        <p className="text-gray-400">
          &copy; {new Date().getFullYear()} PDF Tools. Created by Naveen. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
