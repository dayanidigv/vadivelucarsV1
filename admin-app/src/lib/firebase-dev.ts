// Development mode Firebase mock for testing without billing
export const sendOTP = async (_phoneNumber: string, _recaptchaVerifier: any) => {
  // Mock OTP for development
  console.log(`Mock OTP sent: 123456`)
  
  // Return mock confirmation result
  return {
    confirm: async (otp: string) => {
      // Accept "123456" as valid OTP for testing
      if (otp === '123456') {
        return {
          user: {
            phoneNumber: '+919876543210',
            uid: 'mock-user-id'
          }
        }
      } else {
        throw new Error('auth/invalid-verification-code')
      }
    }
  }
}

export const verifyOTP = async (confirmationResult: any, otp: string) => {
  return confirmationResult.confirm(otp)
}

export const setupRecaptcha = (_containerId: string) => {
  // Mock reCAPTCHA for development
  console.log('Mock reCAPTCHA setup')
  return {}
}

export const auth = {
  languageCode: 'en'
}
