import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import OwnerHeader from '@components/owner/OwnerHeader'
import Footer from '@components/common/Footer'
import OwnerSidebar from '@components/owner/OwnerSidebar'
import { Menu } from 'lucide-react'

const OwnerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <OwnerHeader />
      <div className="flex-1 flex relative pt-14 md:pt-16">
        <OwnerSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 w-full min-w-0 flex flex-col bg-gray-50 md:ml-64">
          {/* Mobile: menu gộp vào header (hamburger), không hiện nút Menu trong main */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="hidden items-center gap-2 mb-4 py-2 px-3 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            aria-label="Menu"
          >
            <Menu size={20} />
            <span className="text-sm font-medium">Menu</span>
          </button>
          {/* PC: giới hạn width body content, padding hợp lý */}
          <div className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer compact />
    </div>
  )
}

export default OwnerLayout
