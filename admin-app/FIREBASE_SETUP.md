# Firebase Phone Authentication Setup

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" 
3. Enter project name (e.g., "vadivelu-cars")
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Phone Authentication

1. In your Firebase project, go to **Authentication** → **Sign-in method**
2. Enable **Phone** provider
3. Configure phone authentication settings

## 3. Get Firebase Configuration

1. Go to **Project Settings** → **General**
2. Scroll down to "Firebase SDK snippet" 
3. Copy the configuration values

## 4. Set Up Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# API Configuration
VITE_API_URL=http://localhost:8787
```

## 5. Configure Phone Number Regions

In Firebase Console → Authentication → Sign-in method → Phone:
- Add authorized phone number regions (e.g., India: +91)
- Configure SMS templates if needed

## 6. Test the Setup

1. Start the development server
2. Go to `/login`
3. Enter a phone number (e.g., 9876543210)
4. You should receive an OTP via SMS
5. Enter the OTP to verify

## 7. Production Considerations

- Enable reCAPTCHA for production
- Set up proper SMS quotas
- Configure phone number verification templates
- Monitor authentication usage in Firebase Console

## Troubleshooting

**Common Issues:**
- "reCAPTCHA not ready" → Ensure Firebase config is correct
- "Too many requests" → Firebase rate limiting, wait and retry
- "Invalid phone number" → Check phone format and regions
- "OTP not received" → Check SMS provider settings

**Debug Mode:**
Enable Firebase debug mode in browser console:
```javascript
firebase.auth().settings.appVerificationDisabledForTesting = true;
```
