/**
 * Production-Ready API Client for HomeWiz
 * 
 * This module provides a robust API client with error handling,
 * retry logic, caching, and data synchronization capabilities.
 */

import { z } from 'zod'
import config from './config'
import { collectApiCall, collectError } from './data-collection'
import { BackendFormData } from './data-collection'

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  statusCode?: number
  timestamp?: string
}

// API Error Types
export enum ApiErrorType {
  NETWORK_ERROR = 'network_error',
  TIMEOUT_ERROR = 'timeout_error',
  VALIDATION_ERROR = 'validation_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  AUTHORIZATION_ERROR = 'authorization_error',
  SERVER_ERROR = 'server_error',
  RATE_LIMIT_ERROR = 'rate_limit_error',
  UNKNOWN_ERROR = 'unknown_error'
}

export class ApiError extends Error {
  constructor(
    message: string,
    public type: ApiErrorType,
    public statusCode?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Request Configuration
export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  endpoint: string
  data?: any
  headers?: Record<string, string>
  timeout?: number
  retries?: number
  cache?: boolean
  cacheTtl?: number
  validateResponse?: boolean
}

// Cache Entry
interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
}

/**
 * Production-Ready API Client
 */
export class ApiClient {
  private static instance: ApiClient
  private baseUrl: string
  private defaultHeaders: Record<string, string>
  private cache: Map<string, CacheEntry> = new Map()
  private requestQueue: Map<string, Promise<any>> = new Map()

  private constructor() {
    this.baseUrl = config.api.baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'X-Client-Version': config.app.version,
      'X-Environment': config.environment,
    }

    // Add demo mode header if enabled
    if (config.app.demoMode) {
      this.defaultHeaders['X-Demo-Mode'] = 'true'
    }
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }
    return ApiClient.instance
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  /**
   * Remove authentication token
   */
  removeAuthToken(): void {
    delete this.defaultHeaders['Authorization']
  }

  /**
   * Make API request with retry logic and error handling
   */
  async request<T = any>(requestConfig: RequestConfig): Promise<ApiResponse<T>> {
    const {
      method,
      endpoint,
      data,
      headers = {},
      timeout = config.api.timeout,
      retries = 3,
      cache = false,
      cacheTtl = 300000, // 5 minutes
      validateResponse = true,
    } = requestConfig

    const url = `${this.baseUrl}${endpoint}`
    const cacheKey = `${method}:${url}:${JSON.stringify(data)}`
    const startTime = Date.now()

    // Check cache for GET requests
    if (method === 'GET' && cache) {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        collectApiCall(endpoint, method, 200, Date.now() - startTime)
        return {
          success: true,
          data: cached,
          message: 'Retrieved from cache',
        }
      }
    }

    // Check if same request is already in progress
    if (this.requestQueue.has(cacheKey)) {
      return this.requestQueue.get(cacheKey)!
    }

    // Create request promise
    const requestPromise = this.executeRequest<T>({
      url,
      method,
      data,
      headers: { ...this.defaultHeaders, ...headers },
      timeout,
      retries,
      validateResponse,
    })

    // Add to queue
    this.requestQueue.set(cacheKey, requestPromise)

    try {
      const response = await requestPromise

      // Cache successful GET responses
      if (method === 'GET' && cache && response.success) {
        this.setCache(cacheKey, response.data, cacheTtl)
      }

      const duration = Date.now() - startTime
      collectApiCall(endpoint, method, response.statusCode || 200, duration)

      return response
    } catch (error) {
      const duration = Date.now() - startTime
      const statusCode = error instanceof ApiError ? (error.statusCode ?? 0) : 0
      collectApiCall(endpoint, method, statusCode, duration)
      collectError(error as Error, `api_request_${endpoint}`)
      throw error
    } finally {
      // Remove from queue
      this.requestQueue.delete(cacheKey)
    }
  }

  /**
   * Execute HTTP request with retry logic
   */
  private async executeRequest<T>(config: {
    url: string
    method: string
    data?: any
    headers: Record<string, string>
    timeout: number
    retries: number
    validateResponse: boolean
  }): Promise<ApiResponse<T>> {
    const { url, method, data, headers, timeout, retries, validateResponse } = config
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(url, {
          method,
          headers,
          body: data ? JSON.stringify(data) : undefined,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Handle different response types
        if (!response.ok) {
          const errorType = this.getErrorType(response.status)
          const errorMessage = await this.extractErrorMessage(response)
          
          throw new ApiError(
            errorMessage || `Request failed with status ${response.status}`,
            errorType,
            response.status
          )
        }

        // Parse response
        const responseData = await this.parseResponse(response)

        // Validate response if required
        if (validateResponse && !this.isValidResponse(responseData)) {
          throw new ApiError(
            'Invalid response format',
            ApiErrorType.VALIDATION_ERROR,
            response.status
          )
        }

        return {
          success: true,
          data: responseData,
          statusCode: response.status,
          timestamp: new Date().toISOString(),
        }
      } catch (error) {
        lastError = error as Error

        // Don't retry on certain errors
        if (
          error instanceof ApiError &&
          (error.type === ApiErrorType.AUTHENTICATION_ERROR ||
           error.type === ApiErrorType.AUTHORIZATION_ERROR ||
           error.type === ApiErrorType.VALIDATION_ERROR)
        ) {
          break
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    // All retries failed
    throw lastError || new ApiError('Request failed after all retries', ApiErrorType.UNKNOWN_ERROR)
  }

  /**
   * Parse API response
   */
  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      return response.json()
    }
    
    if (contentType?.includes('text/')) {
      return response.text()
    }
    
    return response.blob()
  }

  /**
   * Extract error message from response
   */
  private async extractErrorMessage(response: Response): Promise<string> {
    try {
      const errorData = await response.json()
      return errorData.message || errorData.error || 'Unknown error'
    } catch {
      return `HTTP ${response.status} ${response.statusText}`
    }
  }

  /**
   * Determine error type from status code
   */
  private getErrorType(statusCode: number): ApiErrorType {
    if (statusCode === 401) return ApiErrorType.AUTHENTICATION_ERROR
    if (statusCode === 403) return ApiErrorType.AUTHORIZATION_ERROR
    if (statusCode === 429) return ApiErrorType.RATE_LIMIT_ERROR
    if (statusCode >= 400 && statusCode < 500) return ApiErrorType.VALIDATION_ERROR
    if (statusCode >= 500) return ApiErrorType.SERVER_ERROR
    return ApiErrorType.UNKNOWN_ERROR
  }

  /**
   * Validate API response format
   */
  private isValidResponse(data: any): boolean {
    // Basic validation - can be enhanced based on API contract
    return data !== null && data !== undefined
  }

  /**
   * Cache management
   */
  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    })
  }

  private getFromCache(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }

  // Convenience methods for common HTTP operations
  async get<T = any>(endpoint: string, options?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'GET', endpoint, ...options })
  }

  async post<T = any>(endpoint: string, data?: any, options?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'POST', endpoint, data, ...options })
  }

  async put<T = any>(endpoint: string, data?: any, options?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PUT', endpoint, data, ...options })
  }

  async patch<T = any>(endpoint: string, data?: any, options?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PATCH', endpoint, data, ...options })
  }

  async delete<T = any>(endpoint: string, options?: Partial<RequestConfig>): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'DELETE', endpoint, ...options })
  }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance()

// Utility functions for common API operations
export const submitFormData = async (formData: BackendFormData): Promise<ApiResponse> => {
  return apiClient.post('/api/applications', formData, {
    validateResponse: true,
    retries: 3,
  })
}

export const uploadFile = async (file: File, category: string): Promise<ApiResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('category', category)

  return apiClient.request({
    method: 'POST',
    endpoint: '/api/files/upload',
    data: formData,
    headers: {}, // Let browser set Content-Type for FormData
    validateResponse: true,
  })
}

export const getBuildings = async (): Promise<ApiResponse> => {
  return apiClient.get('/api/buildings', {
    cache: true,
    cacheTtl: 600000, // 10 minutes
  })
}

export const getRooms = async (buildingId?: string): Promise<ApiResponse> => {
  const endpoint = buildingId ? `/api/rooms?building_id=${buildingId}` : '/api/rooms'
  return apiClient.get(endpoint, {
    cache: true,
    cacheTtl: 300000, // 5 minutes
  })
}

// Types are already exported above
