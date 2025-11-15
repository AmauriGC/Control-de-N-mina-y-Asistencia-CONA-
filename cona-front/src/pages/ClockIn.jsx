"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Clock as ClockIcon, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import logo from '@/assets/CONA.png'
import { alertConfig } from '@/lib/alert-config'

export default function ClockInPage() {
  const [employeeNumber, setEmployeeNumber] = useState('')
  const [status, setStatus] = useState('idle')
  const [lastRecord, setLastRecord] = useState(null)

  const MOCK_EMPLOYEES = {
    E002: { name: 'María Empleada', schedule: '09:00' },
    E003: { name: 'Juan Pérez', schedule: '08:00' },
    E004: { name: 'Ana García', schedule: '09:00' },
  }

  const getCurrentTime = () => new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
  const checkIfLate = (schedule) => {
    const now = new Date()
    const [sh, sm] = schedule.split(':').map(Number)
    const h = now.getHours(); const m = now.getMinutes()
    return h > sh || (h === sh && m > sm) ? 'late' : 'on-time'
  }
  const handleClockIn = async () => {
    if (!employeeNumber.trim()) {
      await alertConfig.toastError({ title: 'Dato requerido', text: 'Ingresa tu número de empleado' })
      return
    }
    setStatus('loading')
    await new Promise((r) => setTimeout(r, 800))
    const employee = MOCK_EMPLOYEES[employeeNumber.toUpperCase()]
    if (!employee) {
      setStatus('error')
      await alertConfig.toastError({ title: 'No encontrado', text: 'Número de empleado no encontrado' })
      setTimeout(() => { setStatus('idle'); setEmployeeNumber('') }, 2000)
      return
    }
    const hasEntryToday = Math.random() > 0.5
    const recordType = hasEntryToday ? 'salida' : 'entrada'
    const currentTime = getCurrentTime()
    const attendanceStatus = recordType === 'entrada' ? checkIfLate(employee.schedule) : undefined
    const record = { type: recordType, time: currentTime, employeeName: employee.name, status: attendanceStatus }
    setLastRecord(record)
    setStatus('success')
  await alertConfig.toastSuccess({ title: `${recordType === 'entrada' ? 'Entrada' : 'Salida'} registrada`, text: `${employee.name} - ${currentTime}${attendanceStatus === 'late' ? ' (Retardo)' : ''}` })
    setTimeout(() => { setStatus('idle'); setEmployeeNumber(''); setLastRecord(null) }, 3000)
  }
  const handleKeyPress = (e) => { if (e.key === 'Enter') handleClockIn() }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 overflow-hidden ring-1 ring-border bg-card">
            <img src={logo} alt="CONA" className="w-full h-full object-contain p-1" />
          </div>
          <h1 className="text-4xl font-bold text-balance">Registro de Asistencia</h1>
          <p className="text-lg text-muted-foreground">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-3xl font-mono font-bold text-primary">
            {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Ingresa tu número de empleado</CardTitle>
            <CardDescription>El sistema detectará automáticamente si es entrada o salida</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Input type="text" placeholder="Ejemplo: E001" value={employeeNumber} onChange={(e) => setEmployeeNumber(e.target.value.toUpperCase())} onKeyPress={handleKeyPress} disabled={status === 'loading' || status === 'success'} className="text-center text-2xl h-16 tracking-wider font-mono" autoFocus />
              <Button onClick={handleClockIn} disabled={status === 'loading' || status === 'success' || !employeeNumber.trim()} className="w-full h-14 text-lg" size="lg">
                {status === 'loading' && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                {status === 'success' && <CheckCircle2 className="mr-2 h-5 w-5" />}
                {status === 'error' && <AlertCircle className="mr-2 h-5 w-5" />}
                {status === 'idle' && 'Registrar'}
                {status === 'loading' && 'Registrando...'}
                {status === 'success' && 'Registrado'}
                {status === 'error' && 'Error'}
              </Button>
            </div>
            {lastRecord && status === 'success' && (
              <div className="p-6 bg-primary/10 border-2 border-primary rounded-lg space-y-2 text-center">
                <div className="text-5xl font-bold text-primary capitalize">{lastRecord.type}</div>
                <div className="text-3xl font-mono font-bold">{lastRecord.time}</div>
                <div className="text-lg font-medium">{lastRecord.employeeName}</div>
                {lastRecord.status === 'late' && <div className="mt-2 text-destructive font-semibold">⚠️ Retardo detectado</div>}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-sm space-y-2 text-muted-foreground">
              <p className="font-semibold text-foreground">Empleados de prueba:</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(MOCK_EMPLOYEES).map(([number, employee]) => (
                  <p key={number}>{number}: {employee.name}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
