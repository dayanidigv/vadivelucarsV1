# Firebase Billing Setup for Phone Authentication

## ❌ Current Error: BILLING_NOT_ENABLED

Phone authentication in Firebase requires a paid plan (Blaze Plan) because it uses SMS services.

## 🔧 Solutions

### Option 1: Enable Firebase Billing (Recommended for Production)

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**
3. **Go to Settings → Billing**
4. **Click "Upgrade"** → Choose **Blaze Plan** (Pay-as-you-go)
5. **Add payment method** (credit card)

**Costs:**
- SMS OTP: ~$0.0075 per message (India)
- First 10,000 auth operations/month: Free
- You only pay for what you use

### Option 2: Development Mode (For Testing)

Use the mock Firebase implementation:

1. **In `CustomerLoginWithOTP.tsx`**:
   ```typescript
   // Replace this line:
   import { setupRecaptcha, sendOTP, verifyOTP } from '@/lib/firebase'
   
   // With this:
   import { setupRecaptcha, sendOTP, verifyOTP } from '@/lib/firebase-dev'
   ```

2. **Test with mock OTP**:
   - Enter any phone number
   - Use OTP: `123456`
   - No billing required

### Option 3: Alternative Phone Auth Services

Consider using:
- **Twilio Verify API**
- **AWS SNS**
- **MessageBird**
- **SendGrid**

## 🚀 Production Checklist

After enabling billing:

1. **Enable Phone Auth** in Firebase Console
2. **Configure SMS templates**
3. **Set up phone number regions** (India: +91)
4. **Enable reCAPTCHA enforcement**
5. **Test with real phone numbers**

## 💡 Development Workflow

```bash
# Development (no billing)
npm run dev
# Use firebase-dev mock

# Production (with billing)
npm run build
# Use real Firebase
```

## 🔒 Security Considerations

- Always use real Firebase in production
- Enable reCAPTCHA enforcement
- Monitor SMS usage in Firebase Console
- Set up billing alerts

## 📞 Support

If you need help:
- Firebase Billing Documentation
- Firebase Support Console
- Alternative: Contact developer for setup assistance
