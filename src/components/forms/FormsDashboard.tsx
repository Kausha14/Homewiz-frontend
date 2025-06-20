'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EnhancedCard, StatusBadge } from '@/components/ui/enhanced-components'
import OperatorForm from './OperatorForm'
import BuildingForm from './BuildingForm'
import RoomForm from './RoomForm'
import TenantForm from './TenantForm'
import LeadForm from './LeadForm'
import { FormDataProvider, useFormData } from './FormDataProvider'
import { OperatorFormData, BuildingFormData, RoomFormData, TenantFormData, LeadFormData } from '@/types'
import {
  Users,
  Building,
  Home,
  UserCheck,
  Target,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Plus,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import '@/styles/design-system.css'

type FormType = 'dashboard' | 'operator' | 'building' | 'room' | 'tenant' | 'lead'

interface FormConfig {
  id: FormType
  title: string
  description: string
  icon: React.ReactNode
  color: string
  fields: number
  category: 'Management' | 'Property' | 'People'
}

const FORM_CONFIGS: FormConfig[] = [
  {
    id: 'operator',
    title: 'Operator Management',
    description: 'Manage property operators, staff, and their permissions with advanced scheduling',
    icon: <Users className="w-6 h-6" />,
    color: 'from-blue-500 to-blue-600',
    fields: 22,
    category: 'Management'
  },
  {
    id: 'building',
    title: 'Building Configuration',
    description: 'Add and configure building details, amenities, and policies with visual tools',
    icon: <Building className="w-6 h-6" />,
    color: 'from-emerald-500 to-emerald-600',
    fields: 50,
    category: 'Property'
  },
  {
    id: 'room',
    title: 'Room Setup',
    description: 'Set up individual rooms with specifications, pricing, and availability tracking',
    icon: <Home className="w-6 h-6" />,
    color: 'from-purple-500 to-purple-600',
    fields: 40,
    category: 'Property'
  },
  {
    id: 'tenant',
    title: 'Tenant Management',
    description: 'Manage tenant information, leases, and preferences with smart automation',
    icon: <UserCheck className="w-6 h-6" />,
    color: 'from-orange-500 to-orange-600',
    fields: 35,
    category: 'People'
  },
  {
    id: 'lead',
    title: 'Lead Tracking',
    description: 'Track prospective tenants and their housing interests with intelligent scoring',
    icon: <Target className="w-6 h-6" />,
    color: 'from-pink-500 to-pink-600',
    fields: 25,
    category: 'People'
  }
]

function FormsDashboardContent() {
  const [currentForm, setCurrentForm] = useState<FormType>('dashboard')
  const [isLoading, setIsLoading] = useState(false)
  const formData = useFormData()

  const handleFormSubmit = async (data: any, formType: FormType) => {
    setIsLoading(true)
    try {
      // Here you would typically make an API call to save the data
      console.log(`Submitting ${formType} form:`, data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Refresh related data after successful submission
      switch (formType) {
        case 'operator':
          await formData.refreshOperators()
          break
        case 'building':
          await formData.refreshBuildings()
          break
        case 'room':
          await formData.refreshRooms()
          break
        case 'tenant':
          // Refresh multiple data sources for tenant
          await Promise.all([
            formData.refreshRooms(),
            formData.refreshBuildings()
          ])
          break
        case 'lead':
          await formData.refreshRooms()
          break
      }
      
      // Return to dashboard after successful submission
      setCurrentForm('dashboard')
      
      // Show success message (you might want to use a toast notification here)
      alert(`${formType} saved successfully!`)
      
    } catch (error) {
      console.error(`Error submitting ${formType} form:`, error)
      alert(`Error saving ${formType}. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFormCancel = () => {
    setCurrentForm('dashboard')
  }

  const renderCurrentForm = () => {
    switch (currentForm) {
      case 'operator':
        return (
          <OperatorForm
            onSubmit={(data) => handleFormSubmit(data, 'operator')}
            onCancel={handleFormCancel}
            isLoading={isLoading}
          />
        )
      
      case 'building':
        return (
          <BuildingForm
            onSubmit={(data) => handleFormSubmit(data, 'building')}
            onCancel={handleFormCancel}
            isLoading={isLoading}
            operators={formData.operators}
          />
        )
      
      case 'room':
        return (
          <RoomForm
            onSubmit={(data) => handleFormSubmit(data, 'room')}
            onCancel={handleFormCancel}
            isLoading={isLoading}
            buildings={formData.buildings}
          />
        )
      
      case 'tenant':
        return (
          <TenantForm
            onSubmit={(data) => handleFormSubmit(data, 'tenant')}
            onCancel={handleFormCancel}
            isLoading={isLoading}
            buildings={formData.buildings}
            rooms={formData.rooms}
            operators={formData.operators}
          />
        )
      
      case 'lead':
        return (
          <LeadForm
            onSubmit={(data) => handleFormSubmit(data, 'lead')}
            onCancel={handleFormCancel}
            isLoading={isLoading}
            rooms={formData.rooms.map(room => ({
              ...room,
              building_name: formData.buildings.find(b => b.building_id === room.building_id)?.building_name || 'Unknown Building'
            }))}
          />
        )
      
      default:
        return renderDashboard()
    }
  }

  const renderDashboard = () => {
    const categories = ['Management', 'Property', 'People']

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Hero Section */}
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Premium Rental Platform
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6 animate-fade-in-up">
              Rental Application Forms
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Comprehensive form system for managing operators, properties, and tenants with
              smart defaults, real-time validation, and seamless data relationships.
            </p>
            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">100% Schema Coverage</span>
              </div>
              <div className="flex items-center gap-2 text-blue-600">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">Smart Automation</span>
              </div>
              <div className="flex items-center gap-2 text-purple-600">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">Premium UX</span>
              </div>
            </div>
          </motion.div>

          {/* Data Status Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <EnhancedCard variant="premium" className="p-8 bg-white/95 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <motion.div
                  className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-700 mb-1">{formData.operators.length}</div>
                  <div className="text-sm font-semibold text-blue-600">Operators</div>
                  {formData.operatorsLoading && (
                    <div className="flex items-center justify-center gap-1 text-xs text-blue-500 mt-1">
                      <Clock className="w-3 h-3 animate-spin" />
                      <span className="animate-pulse">Loading...</span>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Building className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-bold text-emerald-700 mb-1">{formData.buildings.length}</div>
                  <div className="text-sm font-semibold text-emerald-600">Buildings</div>
                  {formData.buildingsLoading && (
                    <div className="flex items-center justify-center gap-1 text-xs text-emerald-500 mt-1">
                      <Clock className="w-3 h-3 animate-spin" />
                      Loading...
                    </div>
                  )}
                </motion.div>

                <motion.div
                  className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Home className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-purple-700 mb-1">{formData.rooms.length}</div>
                  <div className="text-sm font-semibold text-purple-600">Total Rooms</div>
                  {formData.roomsLoading && (
                    <div className="flex items-center justify-center gap-1 text-xs text-purple-500 mt-1">
                      <Clock className="w-3 h-3 animate-spin" />
                      Loading...
                    </div>
                  )}
                </motion.div>

                <motion.div
                  className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-700 mb-1">{formData.getAvailableRooms().length}</div>
                  <div className="text-sm font-semibold text-green-600">Available</div>
                </motion.div>

                <motion.div
                  className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <UserCheck className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="text-3xl font-bold text-orange-700 mb-1">{formData.getOperatorsByType('LEASING_AGENT').length}</div>
                  <div className="text-sm font-semibold text-orange-600">Agents</div>
                </motion.div>
              </div>
            </EnhancedCard>
          </motion.div>

          {/* Form Categories */}
          {categories.map((category, categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + categoryIndex * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-900">{category} Forms</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {FORM_CONFIGS.filter(form => form.category === category).map((form, formIndex) => (
                  <motion.div
                    key={form.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: formIndex * 0.1 }}
                  >
                    <EnhancedCard
                      variant="premium"
                      className="p-6 cursor-pointer group overflow-hidden relative bg-white/95 backdrop-blur-md hover:bg-white/98 transition-all duration-300 hover:shadow-2xl hover:-translate-y-3 interactive-element"
                      onClick={() => setCurrentForm(form.id)}
                    >
                      {/* Background gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${form.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <motion.div
                            className={`w-14 h-14 bg-gradient-to-br ${form.color} rounded-xl flex items-center justify-center text-white shadow-lg`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            {form.icon}
                          </motion.div>
                          <div className="text-right">
                            <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
                              {form.fields} fields
                            </Badge>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                          {form.title}
                        </h3>

                        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                          {form.description}
                        </p>

                        <motion.button
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl transition-all duration-200 hover:-translate-y-1 premium-button relative overflow-hidden"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="relative z-10">Open {form.title.split(' ')[0]}</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                        </motion.button>
                      </div>
                    </EnhancedCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <EnhancedCard variant="premium" className="p-8 bg-white/95 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.button
                  onClick={() => formData.refreshAll()}
                  disabled={formData.operatorsLoading || formData.buildingsLoading || formData.roomsLoading}
                  className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw className={`w-6 h-6 text-blue-600 mx-auto mb-2 ${(formData.operatorsLoading || formData.buildingsLoading || formData.roomsLoading) ? 'animate-spin' : ''}`} />
                  <div className="text-sm font-semibold text-blue-700">Refresh Data</div>
                </motion.button>

                <motion.button
                  onClick={() => setCurrentForm('lead')}
                  className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border-2 border-pink-200 hover:border-pink-300 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Target className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-pink-700">Add Lead</div>
                </motion.button>

                <motion.button
                  onClick={() => setCurrentForm('tenant')}
                  className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 hover:border-orange-300 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <UserCheck className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-orange-700">Add Tenant</div>
                </motion.button>

                <motion.button
                  onClick={() => setCurrentForm('room')}
                  className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Home className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-purple-700">Add Room</div>
                </motion.button>
              </div>
            </EnhancedCard>
          </motion.div>

          {/* Features Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <EnhancedCard variant="gradient" className="p-8 text-white shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3">Premium Form Features</h2>
                <p className="text-blue-100 text-lg">Built for efficiency, designed for excellence</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Smart Defaults</h3>
                  <p className="text-blue-100 leading-relaxed">Pre-populated fields and intelligent suggestions that learn from your patterns</p>
                </motion.div>

                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Real-time Validation</h3>
                  <p className="text-blue-100 leading-relaxed">Instant feedback and error prevention with smart validation rules</p>
                </motion.div>

                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Connected Data</h3>
                  <p className="text-blue-100 leading-relaxed">Automatic relationship handling and seamless data synchronization</p>
                </motion.div>
              </div>
            </EnhancedCard>
          </motion.div>
        </div>
      </div>
    )
  }

  return renderCurrentForm()
}

export default function FormsDashboard() {
  return (
    <FormDataProvider>
      <FormsDashboardContent />
    </FormDataProvider>
  )
}
