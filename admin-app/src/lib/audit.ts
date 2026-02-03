import { api } from './api'

export interface AuditEvent {
    action: string
    resource: string
    resourceId?: string
    changes?: Record<string, any>
    timestamp: number
    performedBy?: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    userAgent?: string
    metadata?: Record<string, any>
}

class AuditLogger {
    private events: AuditEvent[] = []

    log(event: Omit<AuditEvent, 'timestamp' | 'userAgent'>) {
        const auditEvent: AuditEvent = {
            ...event,
            timestamp: Date.now(),
            userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'
        }

        this.events.push(auditEvent)

        // Send to backend
        api.createAuditLog(auditEvent).catch(err => {
            console.error('Audit log submission failed:', err)
        })

        // Keep last 100 in memory
        if (this.events.length > 100) {
            this.events.shift()
        }
    }

    getEvents() {
        return this.events
    }
}

export const auditLogger = new AuditLogger()
