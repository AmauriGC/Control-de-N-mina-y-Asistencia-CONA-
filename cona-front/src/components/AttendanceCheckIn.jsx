"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, Calendar } from 'lucide-react'
import { attendanceService } from '@/employee/service/attendanceService'
import alertConfig from '@/lib/alert-config'
import Logo from '@/components/Logo'

export default function AttendanceCheckIn() {
  const [employeeKey, setEmployeeKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastCheckIn, setLastCheckIn] = useState(null)
  const [now, setNow] = useState(() => new Date())
  // Toasts se muestran con SweetAlert2 (alertConfig) para mantener el estilo global

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!employeeKey.trim()) {
      await alertConfig.toastError({ title: 'Número requerido', text: 'Ingresa tu número de empleado' })
      return
    }

    setLoading(true)
    
    try {
      const result = await attendanceService.checkInOut(employeeKey.trim())
      
      if (result.success) {
        setLastCheckIn(result.data)
        setEmployeeKey('')

        const hasBoth = !!result.data.checkInTime && !!result.data.checkOutTime
        const isCheckOut = !!result.data.checkOutTime && !hasBoth
        const completedMsg = `Registro de asistencia completado. Gracias, ${result.data.employeeName}.`
        const message = isCheckOut
          ? `Salida registrada correctamente. ¡Hasta mañana, ${result.data.employeeName}!`
          : `Entrada registrada correctamente. ¡Buen día, ${result.data.employeeName}!`

        await alertConfig.toastSuccess({
          title: hasBoth ? 'Asistencia completada' : 'Registro exitoso',
          text: hasBoth ? completedMsg : message,
        })
      } else {
        await alertConfig.toastError({ title: 'Error', text: result.message || 'Error al procesar la asistencia' })
      }
    } catch (error) {
      if (error?.status === 422 && error?.message) {
        await alertConfig.toastInfo({ title: 'Asistencia ya registrada', text: error.message })
      } else {
        await alertConfig.toastError({ title: 'Error', text: 'Error al procesar la asistencia' })
      }
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
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna izquierda: Logo + Fecha y hora */}
        <div className="flex flex-col items-center gap-6">
          <Logo className="mx-auto w-60 h-60 overflow-hidden" imgClassName="w-full h-full object-contain p-2 rounded-[420px]" />
          <Card className="w-full bg-white/70">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2 text-center">
                <Calendar className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {now.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="text-center mt-2">
                <div className="text-3xl font-bold text-gray-900">
                  {now.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: Título + Formulario + Último registro + Instrucciones */}
        <div className="space-y-6">
          {/* Formulario de check-in/out */}
          <Card className="shadow-sm">
           <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Control de Asistencia</h1>
            <p className="text-gray-600 mt-2">
              Ingresa tu número de empleado para registrar tu entrada o salida
            </p>
          </div>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    label="Número de Empleado"
                    type="text"
                    placeholder="Número de empleado"
                    value={employeeKey}
                    onChange={(e) => setEmployeeKey(e.target.value)}
                    maxLength={10}
                    disabled={loading}
                    className="text-center"
                    autoComplete="off"
                  />
                </div>
                <Button type="submit" size="lg" loading={loading} className="w-full">
                  <Clock className="h-4 w-4" />
                  Registrar
                </Button>
              </form>
            </CardContent>
             <div className="text-center text-sm text-gray-600 bg-white/50 rounded-lg p-4">
            <p className="font-medium mb-2">¿Cómo funciona?</p>
            <ul className="space-y-1">
              <li>• Primera vez del día: registra tu <strong>entrada</strong></li>
              <li>• Segunda vez del día: registra tu <strong>salida</strong></li>
              <li>• El sistema calcula automáticamente tus horas y salario</li>
            </ul>
          </div>
          </Card>
        </div>
      </div>
    </div>
  )
}