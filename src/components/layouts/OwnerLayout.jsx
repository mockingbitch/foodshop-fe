import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import OwnerHeader from '@components/owner/OwnerHeader'
import Footer from '@components/common/Footer'
import OwnerSidebar from '@components/owner/OwnerSidebar'
import { Menu } from 'lucide-react'

const OwnerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <OwnerHeader />
      <div className="flex-1 flex relative">
        <OwnerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 w-full min-w-0 p-4 sm:p-6 bg-gray-50">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden flex items-center gap-2 mb-4 py-2 px-3 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            aria-label="Menu"
          >
            <Menu size={20} />
            <span className="text-sm font-medium">Menu</span>
          </button>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default OwnerLayout
