# 📋 Vadivelu Cars - Requirements Document

## Business Profile

**Shop Name**: Vadivelu Cars  
**Contact**: 89036 26677, 80125 26677  
**Business Type**: Automotive Repair & Service  
**Target**: Walk-in customers + some regulars

### Key Metrics
- **Daily Volume**: 1-2 customers
- **Average Invoice**: ₹50,000
- **Items per Invoice**: ~30 (complex jobs!)
- **Main Services**: Oil service & suspension work
- **Computer Literacy**: Low (owner + future manager)

---

## ✅ Must-Have Features

### 1. Invoice Management
- [x] Create invoice with 30+ items easily
- [ ] **Voice search** for parts (speak instead of type)
- [ ] **Recently used parts** at top
- [ ] **"Repeat last service"** quick button
- [ ] **Photo capture** for damage documentation
- [ ] Real-time calculation
- [ ] WhatsApp share invoice instantly
- [ ] Track payment (cash/UPI/card)
- [ ] Payment pending alerts

### 2. Offline Support ⚡ CRITICAL
- [ ] Work without internet
- [ ] Sync when online
- [ ] Local data storage
- [ ] Offline indicator

### 3. Customer Portal
- [ ] Phone OTP login (Firebase)
- [ ] View invoice history
- [ ] Download PDF invoices
- [ ] See payment status
- [ ] Update contact info
- [ ] Submit feedback/complaints
- [ ] Chat with shop

### 4. WhatsApp Integration
- [ ] Send invoice PDF
- [ ] Payment reminders
- [ ] Insurance reminders
- [ ] Quick chat button

### 5. Landing Page
- [ ] Shop details & services
- [ ] Call/WhatsApp buttons
- [ ] Testimonials
- [ ] Gallery
- [ ] Google Maps
- [ ] Highlight: Free pickup/drop, Express service, Field work

### 6. Reports
- [ ] Monthly revenue
- [ ] Parts usage report
- [ ] Pending payments

### 7. Mobile-First UX
- [ ] **HUGE buttons** (56px minimum)
- [ ] Works on phone (one-handed)
- [ ] Works on tablet
- [ ] Large fonts (18px+)
- [ ] Simple navigation

---

## ❌ Not Needed (Don't Build)

- ❌ Online appointment booking (just call)
- ❌ Quote request form
- ❌ Multiple staff logins (only owner for now)
- ❌ Stock/inventory management
- ❌ Expense tracking
- ❌ Payment gateway (UPI details only)
- ❌ Before/after gallery (just regular gallery)

---

## 🎨 Design Requirements

### Visual Hierarchy
1. **XL Buttons** - Easy to tap with greasy hands
2. **Voice Input** - Speak part names
3. **Photo First** - Document work visually
4. **One-Tap Actions** - Minimal clicks
5. **High Contrast** - Visible in bright/dim shop

### Typography
- Minimum font: 16px (18px preferred)
- Button text: 18px
- Headers: 24px+

### Touch Targets
- Buttons: 56px × 56px minimum
- Inputs: 52px height
- Spacing: 16px between interactive elements

### Colors
- High contrast for visibility
- Clear status indicators (paid/unpaid)
- Error states prominent

---

## 🔧 Technical Stack

### Current (Keep)
- **Frontend**: React + TypeScript + Vite + Tailwind
- **Backend**: Cloudflare Workers + Hono
- **Database**: Supabase (PostgreSQL)
- **PDF**: @react-pdf/renderer

### Add
- **Auth**: Firebase (phone OTP)
- **Offline**: Service Worker + IndexedDB
- **Photos**: Supabase Storage
- **WhatsApp**: URL scheme (wa.me)

---

## 📊 User Workflow

### Creating Invoice (Target: < 5 minutes for 30 items)

```
1. Customer arrives → Take damage photos (30 sec)
2. Search customer by phone (5 sec)
3. Select vehicle (2 sec)
4. Voice search: "oil filter" → Tap to add (5 sec/item)
   OR Use "Same as last service" template (15 sec total)
5. Review items, adjust quantities (1 min)
6. Enter payment details (30 sec)
7. Generate PDF + Share WhatsApp (10 sec)
```

**Total: 3-5 minutes** (vs 15-20 minutes manual!)

---

## 🚀 Success Criteria

### Performance
- Invoice creation: < 5 minutes (30 items)
- Offline mode: Works 100% without internet
- Mobile response: < 1 second for all actions
- PDF generation: < 3 seconds

### Usability
- **Can be used one-handed** on phone
- **Dad can use without help** after 1-hour training
- **Zero errors** in calculations
- **No data loss** if internet drops

### Business Impact
- Save 10-15 minutes per invoice
- Reduce calculation errors to zero
- Enable customer self-service
- Professional PDF invoices
- Automated payment reminders

---

## 📱 Device Support

### Primary: Phone (Current)
- Portrait mode
- One-hand usage
- Voice input
- Camera access

### Secondary: Tablet (Planned)
- Landscape mode
- Split-screen
- Larger catalog view
- Keyboard support

### Future: Desktop
- Full features
- Keyboard shortcuts
- Advanced reports
- Bulk operations

---

## 🎯 Launch Checklist

Before going live:

- [ ] Dad can create invoice without help
- [ ] Offline mode tested
- [ ] WhatsApp sharing works
- [ ] PDF matches paper bill format
- [ ] Payment tracking accurate
- [ ] Customer portal functional
- [ ] Landing page live
- [ ] Training completed
- [ ] Backup strategy in place
- [ ] Emergency contact (you!) available

---

## 📞 Deployment Support

**Week 1-2**: Daily check-ins  
**Week 3-4**: Every 2 days  
**Month 2+**: On-demand support

**Emergency Contact**: You (for first month)

---

## 💡 Future Enhancements (After Launch)

1. Manager account (when hired)
2. Desktop version (if needed)
3. Inventory tracking (if business grows)
4. Expense tracking (if needed)
5. Service appointment booking (online)
6. Loyalty program
7. WhatsApp chatbot for common queries

---

## 📝 Notes

- Start simple, add complexity later
- Focus on speed and reliability
- Make it impossible to make mistakes
- Every feature must save time or reduce errors
- If dad doesn't use it in first week, remove it
