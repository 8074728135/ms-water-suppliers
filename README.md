# 💧 MS Water Suppliers - Water Tanker & Drum Logistics Platform

A modern, full-stack water supply and logistics management web application designed for residential, commercial, and construction water delivery operations.

---

## 🌟 Key Features

### 👤 1. Customer Portal
- **Instant Water Booking**: Book water tankers (1,000L to 12,000L) or 200L commercial blue drums.
- **Dynamic Pricing Calculator**: Live fare estimation based on delivery zone, volume, and urgency.
- **Real-Time Order Tracking**: Multi-step visual tracking from *Placed $\rightarrow$ Assigned $\rightarrow$ On Route $\rightarrow$ Delivered*.
- **Address Book & Past Invoices**: Save frequent delivery addresses and download detailed GST/billing receipts.

### 🚚 2. Driver Companion Portal (Mobile-First PWA)
- **Attendance & Duty Management**: Quick toggle for **On Duty** vs **On Leave / Vacation**.
  - Drivers on leave are automatically skipped during auto-assignment.
- **Smart Queue & Trip Workflow**: One-tap progression through *Accept $\rightarrow$ Start Trip $\rightarrow$ Arrived $\rightarrow$ Complete Delivery*.
- **Integrated Payment Collection**: Mark cash or UPI collections directly upon delivery.

### 👑 3. Owner & Dispatch Command Center
- **Live Dispatch Board**: Real-time overview of active deliveries, assigned drivers, and tanker capacities.
- **Intelligent Auto-Assignment**: Automatically matches pending orders with available, on-duty drivers (with full manual reassignment capability).
- **Phone Order Entry**: Fast phone/walk-in order creation tool for customers who call in directly.
- **Customer Khata (Digital Ledger)**: Credit balance tracking, ledger payments, and statement generation.
- **Vehicle & Driver Roster**: Add drivers, manage tanker capacities, and monitor daily trip logs.
- **Financial Analytics & Expense Tracker**: Diesel logs, maintenance records, daily/weekly revenue metrics, and profit margins.

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS with custom glassmorphism & rich color system
- **State & Routing**: React Router v6, Context API, Axios with automatic JWT interceptors
- **Icons & UI**: Lucide React, Hot Toast, Tailwind typography
- **PWA**: `@vite-pwa` with offline caching & installable mobile app support

### Backend
- **Framework**: Spring Boot 3.3 (Java 21)
- **Security**: Spring Security 6 with Stateless JWT Authentication
- **Persistence**: Spring Data JPA / Hibernate with PostgreSQL 16
- **Database Migrations**: Flyway automatic schema versioning
- **Validation**: Jakarta Bean Validation API

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ and npm
- Java 21 JDK
- Maven 3.9+
- PostgreSQL 16 (or Docker)

### 1. Clone the Repository
```bash
git clone https://github.com/8074728135/ms-water-suppliers.git
cd ms-water-suppliers
```

### 2. Start PostgreSQL with Docker (Optional)
```bash
docker compose up -d db
```

### 3. Run Backend API
```bash
cd backend
mvn spring-boot:run
```
> API runs at `http://localhost:8080`

### 4. Run Frontend Development Server
```bash
cd ../frontend
npm install
npm run dev
```
> Web application runs at `http://localhost:5173`

---

## 🔑 Default Demo Accounts

| Role | Mobile Number | Password | Landing Page |
| :--- | :--- | :--- | :--- |
| **Owner / Admin** | `9999999999` | `admin123` | `/owner` |
| **Tanker Driver** | `8888888888` | `driver123` | `/driver` |
| **Customer** | `9876543210` | `password123` | `/customer` |

---

## 📦 Production Deployment (Docker)

To run the entire full-stack system in production with 1 command:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
This deploys:
1. PostgreSQL 16 with persistent volume
2. Spring Boot 3 Backend API (Port 8080)
3. Nginx + React Frontend PWA (Port 80)

---

## 📄 License
This project is proprietary software for **MS Water Suppliers, Hindupur**. All rights reserved.
