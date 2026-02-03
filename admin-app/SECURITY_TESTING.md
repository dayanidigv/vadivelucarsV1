# Security Testing Recommendations

This document outlines critical security test cases to ensure the robustness of the admin application.

## 1. Authentication Security

These tests verify that the authentication system cannot be bypassed by local storage manipulation or token tampering.

```typescript
// Test token tampering
describe('Auth Security', () => {
  it('should reject tampered tokens', async () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.data'
    localStorage.setItem('token', fakeToken)
    
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should not accept role escalation via localStorage', () => {
    const user = { id: '1', role: 'staff' }
    localStorage.setItem('user', JSON.stringify(user))
    
    // Try to escalate to admin
    localStorage.setItem('user', JSON.stringify({ ...user, role: 'admin' }))
    
    // Should verify with backend, not trust localStorage
    expect(canAccessAdminPanel()).toBe(false)
  })
})
```

## 2. XSS Protection

Verify that user-provided content is sanitized before being rendered, especially in high-risk outputs like PDFs.

```typescript
// Test XSS prevention
describe('XSS Protection', () => {
  it('should sanitize customer names in PDF', () => {
    const maliciousName = '<script>alert("XSS")</script>'
    const customer = { name: maliciousName }
    
    const pdf = render(<InvoicePDF invoice={{ customer }} />)
    expect(pdf.text()).not.toContain('<script>')
  })
})
```

## 3. File Upload Security

Ensure that only valid images are processed and that file size limits are strictly enforced.

```typescript
// Test file upload security
describe('File Upload', () => {
  it('should reject non-image files', async () => {
    const phpFile = new File(
      ['<?php evil(); ?>'],
      'shell.php',
      { type: 'image/jpeg' } // Spoofed
    )
    
    const result = await handleFileSelect(phpFile)
    expect(result.error).toBe('Invalid file type')
  })
  
  it('should reject oversized files', async () => {
    const largeFile = new File(
      [new ArrayBuffer(10 * 1024 * 1024)], // 10MB
      'large.jpg'
    )
    
    const result = await handleFileSelect(largeFile)
    expect(result.error).toBe('File too large')
  })
})
```
