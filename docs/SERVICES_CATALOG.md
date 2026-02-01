# 🔧 Vadivelu Cars - Services Catalog

## **1. Mechanical Work**

### **Engine & Drivetrain**
- Engine related work
- Gearbox work
- Clutch work

### **Braking & Suspension**
- Brake work
- Suspension work
- Steering work

### **Electrical & Climate**
- AC work
- Electrical work
- Battery work

### **Body Work**
- All brand car tinker work
- All brand car painting work
- All brand car denting work
- All brand car polishing work

### **Wheels & Tires**
- Wheel alignment work
- Wheel balancing work
- Tyre work

### **Maintenance**
- Water wash work

---

## **2. Car Accessories Installation**

### **Entertainment Systems**
- Music system fitting work
- Android screen fitting work
- Speaker fitting work
- Horn fitting work

### **Safety & Visibility**
- Camera fitting work
- Side mirror fitting work
- Fog lamp fitting work

### **Interior Accessories**
- Foot mat fitting work

---

## **Service Categories for Invoice System**

Use these categories when adding services to the parts catalog:

```sql
-- Add service categories to parts_catalog
INSERT INTO parts_catalog (name, category, default_rate, unit) VALUES
-- Engine Work
('Engine Repair - General', 'Engine', 5000, 'Job'),
('Gearbox Repair', 'Transmission', 8000, 'Job'),
('Clutch Replacement', 'Clutch', 6000, 'Job'),

-- Brake & Suspension
('Brake Service Complete', 'Brakes', 2500, 'Job'),
('Suspension Overhaul', 'Suspension', 7000, 'Job'),
('Steering Repair', 'Steering', 3500, 'Job'),

-- Electrical & AC
('AC Service', 'AC', 3000, 'Job'),
('Electrical Diagnosis', 'Electrical', 1500, 'Job'),
('Battery Replacement', 'Battery', 5000, 'No'),

-- Body Work
('Denting Work', 'Body', 4000, 'Panel'),
('Painting Work', 'Body', 3500, 'Panel'),
('Polishing - Full Car', 'Body', 2000, 'Job'),

-- Wheels
('Wheel Alignment', 'Wheels', 800, 'Job'),
('Wheel Balancing', 'Wheels', 600, 'Job'),
('Tyre Fitting', 'Wheels', 200, 'No'),

-- Accessories
('Music System Installation', 'Accessories', 1500, 'Job'),
('Camera Installation', 'Accessories', 2000, 'Job'),
('Android Screen Installation', 'Accessories', 2500, 'Job'),
('Fog Lamp Installation', 'Accessories', 1000, 'Pair'),
('Side Mirror Replacement', 'Accessories', 1500, 'No');
```

---

## **Quick Add Templates**

Common job combinations to add as templates in the system:

### **Basic Service**
- Engine Oil + Oil Filter + Air Filter
- Labor - General Service
- Water Wash

### **Brake Service**
- Brake Pads (Front/Rear)
- Brake Fluid
- Labor - Brake Service

### **Suspension Overhaul**
- Shock Absorbers × 4
- Lower Arm Bush × 4
- Upper Arm Bush × 4
- Labor - Suspension Work

### **Complete Detailing**
- Water Wash
- Polishing - Full Car
- Interior Cleaning
