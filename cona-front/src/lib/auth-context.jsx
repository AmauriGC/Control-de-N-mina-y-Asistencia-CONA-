import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(undefined)

const MOCK_USERS = [
  { id: '1', email: 'admin@cona.com', password: 'ConaAdmin1', name: 'Admin Sistema', role: 'admin' },
  { id: '2', email: 'empleado@cona.com', password: 'ConaEmp1A2', name: 'María Empleada', role: 'employee', employeeNumber: 'E002' },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const login = async (email, password) => {
    await new Promise((r) => setTimeout(r, 500))
    const foundUser = MOCK_USERS.find((u) => u.email === email && u.password === password)
    if (foundUser) {
      const { password: _omit, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(userWithoutPassword))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
  }

  if (isLoading) return null

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
