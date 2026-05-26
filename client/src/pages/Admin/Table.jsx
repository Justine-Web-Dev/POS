import React, { useState, useEffect } from 'react'
import { api } from '../../api/api'
import AddTable from '../../modals/AddTable'
import UpdateStatusModal from '../../modals/UpdateStatusModal'

const statusStyles = {
  Available: {
    border: "border-slate-200 hover:border-slate-300 hover:shadow-md",
    bg: "bg-white",
    text: "text-slate-800",
    label: "text-slate-600 bg-slate-100 border border-slate-200/40",
    dot: "bg-slate-400"
  },
  Occupied: {
    border: "border-orange-200 hover:border-orange-300 hover:shadow-md",
    bg: "bg-orange-50/20 hover:bg-orange-50/50",
    text: "text-orange-950 font-bold",
    label: "text-orange-600 bg-orange-100/50 border border-orange-200/20",
    dot: "bg-orange-500"
  },
  Reserved: {
    border: "border-yellow-200 hover:border-yellow-300 hover:shadow-md",
    bg: "bg-yellow-50/20 hover:bg-yellow-50/50",
    text: "text-yellow-950 font-bold",
    label: "text-yellow-600 bg-yellow-100/50 border border-yellow-200/20",
    dot: "bg-yellow-500"
  },
  Dirty: {
    border: "border-rose-200 hover:border-rose-300 hover:shadow-md",
    bg: "bg-rose-50/20 hover:bg-rose-50/50",
    text: "text-rose-950 font-bold",
    label: "text-rose-600 bg-rose-100/50 border border-rose-200/20",
    dot: "bg-rose-500"
  },
}

function Table() {
  const [tables, setTables] = useState([])
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedTableForUpdate, setSelectedTableForUpdate] = useState(null)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)

  const handleEditStatus = (table) => {
    setSelectedTableForUpdate(table)
    setIsUpdateModalOpen(true)
  }

  const getNormalizedStatus = (status) => {
    if (!status) return 'Available'
    const s = status.trim().toLowerCase()
    if (s === 'occupied') return 'Occupied'
    if (s === 'reserved') return 'Reserved'
    if (s === 'dirty') return 'Dirty'
    return 'Available'
  }

  const fetchTables = async () => {
    try {
      const response = await api.get('/api/users/admin/read-table')
      const normalizedData = response.data.map(table => ({
        ...table,
        status: getNormalizedStatus(table.status)
      }))
      setTables(normalizedData)
      console.log(normalizedData)
    } catch (error) {
      console.error("Error fetching tables:", error)
    }
  }

  useEffect(() => {
    fetchTables()
  }, [])

  // Calculate dynamic stats
  const totalTables = tables.length
  const occupiedCount = tables.filter(t => t.status === 'Occupied').length
  const availableCount = tables.filter(t => t.status === 'Available').length
  const reservedCount = tables.filter(t => t.status === 'Reserved').length
  const dirtyCount = tables.filter(t => t.status === 'Dirty').length
  
  const totalPax = tables.reduce((acc, t) => acc + (Number(t.capacity) || 0), 0)
  const occupiedPax = tables.filter(t => t.status === 'Occupied').reduce((acc, t) => acc + (Number(t.capacity) || 0), 0)
  const occupancyRate = totalTables > 0 ? Math.round((occupiedCount / totalTables) * 100) : 0

  // Filter tables based on status and search query
  const filteredTables = tables.filter(table => {
    const matchesStatus = selectedStatus === 'All' || table.status === selectedStatus
    const matchesSearch = table.table_number.toString().includes(searchQuery)
    return matchesStatus && matchesSearch
  })

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 sm:p-5 xl:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
      
      {/* Top Header & Status Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-50 rounded-lg text-blue-600 border border-blue-100">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Floor Matrix</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 ml-8">Real-time table allocation and capacity monitoring</p>
        </div>

        {/* Action Panel: Interactive filtering & search */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto ml-0 sm:ml-8">
          <div className="relative flex-grow sm:flex-grow-0">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search table number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 text-sm rounded-xl pl-9 pr-4 py-2 w-full sm:w-56 focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-400 text-slate-800 shadow-xs"
            />
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 border border-blue-500 hover:bg-blue-700 text-white font-medium text-sm px-4 py-2 rounded-xl transition-all flex items-center gap-2 active:scale-[0.98] shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Table
          </button>
        </div>
      </div>

      {/* Main Screen Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 xl:gap-6">
        
        {/* Left Side: Layout Grid Matrix */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 xl:p-6 min-h-[450px] shadow-xs">
          
          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 mb-4 border-b border-slate-100 pb-3">
            {['All', 'Available', 'Occupied', 'Reserved', 'Dirty'].map((status) => {
              const countMap = {
                All: totalTables,
                Available: availableCount,
                Occupied: occupiedCount,
                Reserved: reservedCount,
                Dirty: dirtyCount
              }
              const isActive = selectedStatus === status
              
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-950 shadow-2xs'
                  }`}
                >
                  {status} <span className={`ml-1 text-[10px] ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>({countMap[status]})</span>
                </button>
              )
            })}
          </div>

          {/* Grid Render */}
          {filteredTables.length === 0 ? (
            <div className="h-[380px] flex flex-col items-center justify-center text-slate-400 gap-3 border border-dashed border-slate-200 rounded-2xl">
              <span className="p-4 bg-slate-50 rounded-full text-slate-400 border border-slate-100">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </span>
              <div className="text-center">
                <p className="text-base font-semibold text-slate-600">No tables matching active filters</p>
                <p className="text-xs text-slate-400 mt-1">Try tweaking your search query or status filter.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredTables.map((table) => {
                const style = statusStyles[table.status] || statusStyles.Available
                
                return (
                  <div
                    key={table.id || table.table_number}
                    onClick={() => handleEditStatus(table)}
                    className={`aspect-[1.18] rounded-xl border-2 ${style.border} ${style.bg} p-3 sm:p-4 flex flex-col justify-between transition-all duration-300 cursor-pointer shadow-2xs active:scale-[0.97]`}
                  >
                    {/* Top Row: Status Indicator */}
                    <div className="flex justify-between items-start">
                      <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${style.label}`}>
                        {table.status}
                      </span>
                    </div>

                    {/* Middle Core: Table Number Display */}
                    <div className="flex flex-col items-center justify-center flex-grow py-1 sm:py-2">
                      <span className={`text-xl sm:text-2xl xl:text-3xl font-black tracking-tight whitespace-nowrap ${style.text}`}>
                        {table.table_number}
                      </span>
                    </div>

                    {/* Bottom Row: Capacity & Quick Action */}
                    <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-semibold text-slate-400 border-t border-slate-100 pt-1.5 sm:pt-2">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                        {table.capacity} Pax
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Side: Floor Statistics Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-4">
          
          {/* Main Occupancy Stats Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 mb-3">Floor Overview</h3>
            
            <div className="space-y-3">
              
              {/* Progress bar Occupancy tracking */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span className="text-slate-500">Live Occupancy</span>
                  <span className="text-orange-600">{occupancyRate}%</span>
                </div>
                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${occupancyRate}%` }}
                  ></div>
                </div>
              </div>

              {/* Numerical breakdown grid */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Total Seats</span>
                  <span className="text-base sm:text-lg font-bold text-slate-800 mt-0.5 block">{totalPax}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Occupied</span>
                  <span className="text-base sm:text-lg font-bold text-orange-600 mt-0.5 block">{occupiedPax}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Legend Widget */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 mb-2.5">Status Legend</h3>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                <span className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-slate-400 shadow-2xs"></span> Available
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400 font-bold">{availableCount} tables</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                <span className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-orange-500 shadow-2xs"></span> Occupied
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400 font-bold">{occupiedCount} tables</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                <span className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-2xs"></span> Reserved
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400 font-bold">{reservedCount} tables</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
                <span className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shadow-2xs"></span> Dirty
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400 font-bold">{dirtyCount} tables</span>
              </div>
            </div>
          </div>

          {/* Quick Instructions / Info Alerts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex-1">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 mb-2.5">Live Log</h3>
            <div className="space-y-2">
              <div className="flex gap-2 items-start bg-slate-50 p-2 rounded-xl border border-slate-100/80">
                <div className="w-4.5 h-4.5 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 shrink-0 text-[10px] font-bold shadow-3xs">!</div>
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-700">System Ready</h4>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Monitoring floor changes...</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      <AddTable 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchTables} 
      />

      <UpdateStatusModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false)
          setSelectedTableForUpdate(null)
        }}
        onSuccess={fetchTables}
        table={selectedTableForUpdate}
      />
    </div>
  )
}

export default Table