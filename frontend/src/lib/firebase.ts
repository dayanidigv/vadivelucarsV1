import { initializeApp } from 'firebase/app'
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

// Firebase configuration - Get from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Configure Firebase Auth for phone auth
auth.languageCode = 'en'

// Setup reCAPTCHA verifier
export const setupRecaptcha = (containerId: string) => {
  return new RecaptchaVerifier(auth, containerId, {
    'size': 'invisible',
    'callback': () => {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
      console.log('reCAPTCHA verified')
    },
    'expired-callback': () => {
      // Response expired. Ask user to solve reCAPTCHA again.
      console.log('reCAPTCHA expired')
    }
  })
}

// Send OTP to phone number
export const sendOTP = async (phoneNumber: string, recaptchaVerifier: any) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
    return confirmationResult
  } catch (error) {
    console.error('Error sending OTP:', error)
    throw error
  }
}

// Verify OTP
export const verifyOTP = async (confirmationResult: any, otp: string) => {
  try {
    const result = await confirmationResult.confirm(otp)
    return result.user
  } catch (error) {
    console.error('Error verifying OTP:', error)
    throw error
  }
}

export default app
