"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, User, Calendar } from 'lucide-react'
import { attendanceService } from '@/employee/service/attendanceService'
import { alertConfig } from '@/lib/alert-config'

export default function AttendanceCheckIn() {
  const [employeeKey, setEmployeeKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastCheckIn, setLastCheckIn] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!employeeKey.trim()) {
      alertConfig.error('Por favor ingresa tu número de empleado')
      return
    }

    setLoading(true)
    
    try {
      const result = await attendanceService.checkInOut(employeeKey.trim())
      
      if (result.success) {
        setLastCheckIn(result.data)
        setEmployeeKey('')
        
        const isCheckOut = result.data.checkOutTime
        const message = isCheckOut 
          ? `¡Hasta mañana, ${result.data.employeeName}! Salida registrada correctamente.`
          : `¡Buen día, ${result.data.employeeName}! Entrada registrada correctamente.`
        
        alertConfig.success(message)
      } else {
        alertConfig.error(result.message)
      }
    } catch (error) {
      alertConfig.error('Error al procesar la asistencia')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      PRESENT: { label: 'A tiempo', variant: 'default', icon: CheckCircle },
      LATE: { label: 'Retardo', variant: 'destructive', icon: Clock },
      ABSENT: { label: 'Falta', variant: 'destructive', icon: Clock }
    }

    const config = statusConfig[status] || statusConfig.PRESENT
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo y título */}
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <div className="text-white font-bold text-2xl">CONA</div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Control de Asistencia</h1>
          <p className="text-gray-600 mt-2">
            Ingresa tu número de empleado para registrar tu entrada o salida
          </p>
        </div>

        {/* Información de fecha y hora actual */}
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-4 text-center">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  {new Date().toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
            <div className="text-center mt-2">
              <div className="text-2xl font-bold text-gray-900">
                {new Date().toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit', 
                  second: '2-digit' 
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulario de check-in/out */}
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2">
              <User className="h-5 w-5" />
              Número de empleado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="12345"
                  value={employeeKey}
                  onChange={(e) => setEmployeeKey(e.target.value)}
                  className="text-center text-lg h-12 border-2 focus:border-blue-500"
                  maxLength={5}
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Registrar
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Último registro */}
        {lastCheckIn && (
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur">
            <CardHeader className="pb-4">
              <CardTitle className="text-center text-lg">Último registro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center">
                <div className="font-semibold text-lg">{lastCheckIn.employeeName}</div>
                <div className="text-sm text-gray-600">#{lastCheckIn.employeeKey}</div>
              </div>
              
              <div className="flex justify-center">
                {getStatusBadge(lastCheckIn.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600">Entrada</div>
                  <div className="font-semibold">
                    {lastCheckIn.checkInTime || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Salida</div>
                  <div className="font-semibold">
                    {lastCheckIn.checkOutTime || '-'}
                  </div>
                </div>
              </div>

              {lastCheckIn.hoursWorked && (
                <div className="text-center pt-2 border-t">
                  <div className="text-sm text-gray-600">Horas trabajadas</div>
                  <div className="font-semibold">
                    {Math.floor(lastCheckIn.hoursWorked)}h {Math.round((lastCheckIn.hoursWorked % 1) * 60)}m
                  </div>
                  {lastCheckIn.dailySalary && (
                    <div className="text-sm text-green-600 font-medium mt-1">
                      Salario del día: ${lastCheckIn.dailySalary.toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instrucciones */}
        <div className="text-center text-sm text-gray-600 bg-white/50 rounded-lg p-4">
          <p className="font-medium mb-2">¿Cómo funciona?</p>
          <ul className="space-y-1">
            <li>• Primera vez del día: registra tu <strong>entrada</strong></li>
            <li>• Segunda vez del día: registra tu <strong>salida</strong></li>
            <li>• El sistema calcula automáticamente tus horas y salario</li>
          </ul>
        </div>
      </div>
    </div>
  )
}