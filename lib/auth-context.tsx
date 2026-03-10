'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  login as authLogin,
  logout as authLogout,
  register as authRegister,
  isAuthenticated,
  getAccessToken,
  setTokens,
  clearTokens,
  type LoginRequest,
  type RegisterRequest,
} from '@/lib/auth-api'

type AuthState = {
  isLoggedIn: boolean
  isLoading: boolean
}

type AuthContextValue = AuthState & {
  login: (data: LoginRequest) => Promise<void>
  logout: () => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    isLoading: true,
  })

  useEffect(() => {
    setState((s) => ({
      ...s,
      isLoggedIn: isAuthenticated(),
      isLoading: false,
    }))
  }, [])

  const login = async (data: LoginRequest) => {
    const res = await authLogin(data)
    setTokens(res.token, res.refresh)
    setState({ isLoggedIn: true, isLoading: false })
  }

  const logout = async () => {
    await authLogout()
    setState({ isLoggedIn: false, isLoading: false })
  }

  const register = async (data: RegisterRequest) => {
    await authRegister(data)
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
