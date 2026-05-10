# Fitti: Evolve Your Fitness 🚀

Fitti is a high-performance, premium fitness ecosystem designed to bridge the gap between clients and specialized fitness professionals (Cooks, Doctors, Trainers). Built with a focus on **Real-time Performance**, **Encrypted Communication**, and **Premium Aesthetics**.

---

## 💎 Features

- **🛡️ Multi-Role Dashboards**: Custom-tailored experiences for Admins, Customers, Cooks, Doctors, and Trainers.
- **💬 Secure Nexus Messaging**: End-to-End Encrypted (E2EE) real-time chat powered by `tweetnacl` and Supabase.
- **🎥 Bio-Link Video Sessions**: Encrypted P2P video conferencing via WebRTC for remote consultations.
- **🍱 Nutrition Vault**: Real-time meal planning and macro tracking for cooks and clients.
- **🏥 Biotic History**: Secure medical record management for doctors and health status tracking.
- **🏋️ Hypertrophy Hub**: Dynamic workout plan creation and progress logging.
- **📊 System Telemetry**: Admin-level oversight of all system activities and assignments.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite)
- **Styling**: Vanilla CSS (Premium Glassmorphism + Graph Paper Aesthetics)
- **Icons**: Lucide React
- **Backend/DB**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime (Postgres Changes)
- **Encryption**: TweetNaCl.js (E2EE)
- **Video**: WebRTC (Signaling via Supabase)
- **Hosting**: Vercel Ready

---

## 🔄 Professional Workflow

### 1. Onboarding & Assignment
The **Admin** manages the "Clients Portal," assigning a specific **Cook**, **Doctor**, and **Trainer** to every new Customer. This creates a dedicated professional support squad for each user.

### 2. Personalized Nutrition (Cook Workflow)
The assigned **Cook** creates weekly meal plans tailored to the client's goals. Once saved, these plans automatically trigger **Orders** in the system. The Cook manages the lifecycle from "Preparing" to "Delivered," while the Client tracks their macros in real-time.

### 3. Medical Oversight (Doctor Workflow)
The **Doctor** maintains secure medical records for the client, including health assessments and dietary/workout restrictions. These restrictions are visible to the Cook and Trainer to ensure client safety.

### 4. Performance Coaching (Trainer Workflow)
The **Trainer** designs high-intensity workout structures. They monitor client "System Telemetry" (Progress Logs) like weight, energy levels, and performance metrics, adjusting the plans dynamically.

### 5. Encrypted Consultations
All professionals and clients communicate through the **Nexus Messaging** system. When a face-to-face check-in is needed, professionals can initiate an encrypted **Video Session** directly from the chat.

---

## 🚀 Deployment (Vercel)

1. **Connect Repository**: Link this GitHub repo to your Vercel account.
2. **Environment Variables**: Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. **Site URL**: Ensure your Supabase Auth settings include your Vercel domain as a Redirect URL.

---

## 🎨 Design Philosophy

Fitti utilizes a **Graph Paper Background** and **Glassmorphism** panels to create a "Military-grade" yet "Premium Boutique" feel. The interface uses `Outfit` typography and subtle SVG animations (EKG lines and floating equipment) to maintain a dynamic, high-energy environment.

---
**Evolve Your Fitness.** Developed by [nyxri0f8](https://github.com/nyxri0f8).
