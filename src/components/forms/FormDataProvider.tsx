'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Types for form data
interface Operator {
  operator_id: number
  name: string
  email: string
  operator_type: 'LEASING_AGENT' | 'MAINTENANCE' | 'BUILDING_MANAGER' | 'ADMIN'
  active: boolean
}

interface Building {
  building_id: string
  building_name: string
  operator_id?: number
  floors?: number
  total_rooms?: number
  available: boolean
}

interface Room {
  room_id: string
  room_number: string
  building_id: string
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED'
  private_room_rent?: number
  shared_room_rent_2?: number
  ready_to_rent: boolean
}

interface FormDataContextType {
  // Data
  operators: Operator[]
  buildings: Building[]
  rooms: Room[]
  
  // Loading states
  operatorsLoading: boolean
  buildingsLoading: boolean
  roomsLoading: boolean
  
  // Error states
  operatorsError: string | null
  buildingsError: string | null
  roomsError: string | null
  
  // Methods
  refreshOperators: () => Promise<void>
  refreshBuildings: () => Promise<void>
  refreshRooms: () => Promise<void>
  refreshAll: () => Promise<void>
  
  // Filtered data helpers
  getOperatorsByType: (type: string) => Operator[]
  getRoomsByBuilding: (buildingId: string) => Room[]
  getAvailableRooms: () => Room[]
  getBuildingsByOperator: (operatorId: number) => Building[]
}

const FormDataContext = createContext<FormDataContextType | undefined>(undefined)

interface FormDataProviderProps {
  children: ReactNode
}

export function FormDataProvider({ children }: FormDataProviderProps) {
  // State for operators
  const [operators, setOperators] = useState<Operator[]>([])
  const [operatorsLoading, setOperatorsLoading] = useState(false)
  const [operatorsError, setOperatorsError] = useState<string | null>(null)
  
  // State for buildings
  const [buildings, setBuildings] = useState<Building[]>([])
  const [buildingsLoading, setBuildingsLoading] = useState(false)
  const [buildingsError, setBuildingsError] = useState<string | null>(null)
  
  // State for rooms
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [roomsError, setRoomsError] = useState<string | null>(null)

  // Mock data for demonstration (replace with real API calls when backend is ready)
  // To switch to real API endpoints, uncomment the lines below and comment out the mock data:
  // const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const MOCK_OPERATORS: Operator[] = [
    {
      operator_id: 1,
      name: 'John Smith',
      email: 'john.smith@homewiz.com',
      operator_type: 'BUILDING_MANAGER',
      active: true
    },
    {
      operator_id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@homewiz.com',
      operator_type: 'LEASING_AGENT',
      active: true
    },
    {
      operator_id: 3,
      name: 'Mike Wilson',
      email: 'mike.wilson@homewiz.com',
      operator_type: 'MAINTENANCE',
      active: true
    },
    {
      operator_id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@homewiz.com',
      operator_type: 'ADMIN',
      active: true
    }
  ]

  const MOCK_BUILDINGS: Building[] = [
    {
      building_id: 'bldg_sunset_001',
      building_name: 'Sunset Apartments',
      operator_id: 1,
      floors: 5,
      total_rooms: 50,
      available: true
    },
    {
      building_id: 'bldg_garden_002',
      building_name: 'Garden View Complex',
      operator_id: 1,
      floors: 8,
      total_rooms: 80,
      available: true
    },
    {
      building_id: 'bldg_downtown_003',
      building_name: 'Downtown Lofts',
      operator_id: 2,
      floors: 12,
      total_rooms: 120,
      available: true
    }
  ]

  const MOCK_ROOMS: Room[] = [
    {
      room_id: 'room_sunset_101',
      room_number: '101',
      building_id: 'bldg_sunset_001',
      status: 'AVAILABLE',
      private_room_rent: 800,
      shared_room_rent_2: 500,
      ready_to_rent: true
    },
    {
      room_id: 'room_sunset_102',
      room_number: '102',
      building_id: 'bldg_sunset_001',
      status: 'OCCUPIED',
      private_room_rent: 850,
      shared_room_rent_2: 525,
      ready_to_rent: false
    },
    {
      room_id: 'room_garden_201',
      room_number: '201',
      building_id: 'bldg_garden_002',
      status: 'AVAILABLE',
      private_room_rent: 900,
      shared_room_rent_2: 550,
      ready_to_rent: true
    },
    {
      room_id: 'room_garden_202',
      room_number: '202',
      building_id: 'bldg_garden_002',
      status: 'MAINTENANCE',
      private_room_rent: 900,
      shared_room_rent_2: 550,
      ready_to_rent: false
    },
    {
      room_id: 'room_downtown_301',
      room_number: '301',
      building_id: 'bldg_downtown_003',
      status: 'AVAILABLE',
      private_room_rent: 1200,
      shared_room_rent_2: 700,
      ready_to_rent: true
    }
  ]

  // Fetch operators (using mock data)
  const fetchOperators = async (): Promise<Operator[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return MOCK_OPERATORS
  }

  // Fetch buildings (using mock data)
  const fetchBuildings = async (): Promise<Building[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600))
    return MOCK_BUILDINGS
  }

  // Fetch rooms (using mock data)
  const fetchRooms = async (): Promise<Room[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700))
    return MOCK_ROOMS
  }

  // Refresh operators
  const refreshOperators = async () => {
    setOperatorsLoading(true)
    setOperatorsError(null)
    try {
      const data = await fetchOperators()
      setOperators(data)
    } catch (error) {
      setOperatorsError(error instanceof Error ? error.message : 'Failed to fetch operators')
      console.error('Error fetching operators:', error)
    } finally {
      setOperatorsLoading(false)
    }
  }

  // Refresh buildings
  const refreshBuildings = async () => {
    setBuildingsLoading(true)
    setBuildingsError(null)
    try {
      const data = await fetchBuildings()
      setBuildings(data)
    } catch (error) {
      setBuildingsError(error instanceof Error ? error.message : 'Failed to fetch buildings')
      console.error('Error fetching buildings:', error)
    } finally {
      setBuildingsLoading(false)
    }
  }

  // Refresh rooms
  const refreshRooms = async () => {
    setRoomsLoading(true)
    setRoomsError(null)
    try {
      const data = await fetchRooms()
      setRooms(data)
    } catch (error) {
      setRoomsError(error instanceof Error ? error.message : 'Failed to fetch rooms')
      console.error('Error fetching rooms:', error)
    } finally {
      setRoomsLoading(false)
    }
  }

  // Refresh all data
  const refreshAll = async () => {
    await Promise.all([
      refreshOperators(),
      refreshBuildings(),
      refreshRooms()
    ])
  }

  // Helper methods for filtered data
  const getOperatorsByType = (type: string): Operator[] => {
    return operators.filter(op => op.operator_type === type && op.active)
  }

  const getRoomsByBuilding = (buildingId: string): Room[] => {
    return rooms.filter(room => room.building_id === buildingId)
  }

  const getAvailableRooms = (): Room[] => {
    return rooms.filter(room => room.status === 'AVAILABLE' && room.ready_to_rent)
  }

  const getBuildingsByOperator = (operatorId: number): Building[] => {
    return buildings.filter(building => building.operator_id === operatorId && building.available)
  }

  // Load initial data on mount
  useEffect(() => {
    refreshAll()
  }, [])

  const contextValue: FormDataContextType = {
    // Data
    operators,
    buildings,
    rooms,
    
    // Loading states
    operatorsLoading,
    buildingsLoading,
    roomsLoading,
    
    // Error states
    operatorsError,
    buildingsError,
    roomsError,
    
    // Methods
    refreshOperators,
    refreshBuildings,
    refreshRooms,
    refreshAll,
    
    // Filtered data helpers
    getOperatorsByType,
    getRoomsByBuilding,
    getAvailableRooms,
    getBuildingsByOperator
  }

  return (
    <FormDataContext.Provider value={contextValue}>
      {children}
    </FormDataContext.Provider>
  )
}

// Custom hook to use the form data context
export function useFormData() {
  const context = useContext(FormDataContext)
  if (context === undefined) {
    throw new Error('useFormData must be used within a FormDataProvider')
  }
  return context
}

// Higher-order component to wrap forms with data provider
export function withFormData<P extends object>(Component: React.ComponentType<P>) {
  return function WrappedComponent(props: P) {
    return (
      <FormDataProvider>
        <Component {...props} />
      </FormDataProvider>
    )
  }
}

// Utility component for displaying loading states
export function FormDataLoader({ 
  loading, 
  error, 
  children, 
  fallback 
}: { 
  loading: boolean
  error: string | null
  children: ReactNode
  fallback?: ReactNode
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex">
          <div className="text-red-400">⚠️</div>
          <div className="ml-2">
            <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Smart select component that handles foreign key relationships
interface SmartSelectProps {
  label: string
  value: string | number | undefined
  onChange: (value: string | number | undefined) => void
  options: Array<{ value: string | number; label: string; disabled?: boolean }>
  placeholder?: string
  required?: boolean
  loading?: boolean
  error?: string
  helpText?: string
  className?: string
}

export function SmartSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  required = false,
  loading = false,
  error,
  helpText,
  className = ""
}: SmartSelectProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <select
        value={value || ''}
        onChange={(e) => {
          const val = e.target.value
          onChange(val === '' ? undefined : (isNaN(Number(val)) ? val : Number(val)))
        }}
        disabled={loading}
        className={`w-full p-2 border border-gray-300 rounded-md ${
          error ? 'border-red-500' : ''
        } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      >
        <option value="">{loading ? 'Loading...' : placeholder}</option>
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {helpText && !error && <p className="text-gray-500 text-sm mt-1">{helpText}</p>}
    </div>
  )
}
