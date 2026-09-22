# Digital Heroes

A modern subscription-based platform that combines golf performance tracking, charitable giving, and monthly reward draws.

## 🌐 Live Demo

https://digital-heroes-pearl.vercel.app/

## ✨ Features

### 👤 User Features
- User signup and login
- Charity selection during signup
- Monthly and yearly subscriptions
- Razorpay test-mode payment integration
- Subscription status and renewal tracking
- Subscription cancellation
- Stableford score management
- Latest 5 scores with date validation
- Monthly draw participation
- Draw number matching
- Winner proof submission
- Winner verification and payment status
- Independent charity donations
- Personal dashboard with live account data

### ❤️ Charity
- Charity directory
- Search charities
- Featured charities
- Charity profile information
- Official charity website links
- Minimum 10% subscription contribution
- Configurable contribution percentage

### 🎯 Draw System
- Monthly draws
- Random number generation
- Algorithmic/weighted number generation
- Draw simulation
- Draw publishing
- 5, 4 and 3 number match detection
- Prize pool distribution
- Jackpot rollover
- Multiple winner handling

### 🛠️ Admin Features
- Admin dashboard
- User and subscription management
- Charity management
- Draw creation and simulation
- Random and algorithmic draw generation
- Draw publishing
- Winner verification
- Winner payment status management
- Reports and analytics

## 💰 Prize Distribution

| Match | Prize Pool |
|------|------------|
| 5 Matches | 40% |
| 4 Matches | 35% |
| 3 Matches | 25% |

If there is no 5-match winner, the jackpot amount rolls over to the next draw.

## 🧰 Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Lucide React

### Backend / Database
- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Storage
- Supabase Edge Functions
- PostgreSQL Functions and Triggers

### Payments
- Razorpay Test Mode

### Deployment
- Vercel
- GitHub

## 📁 Project Structure

```text
digital-heroes/
├── src/
│   ├── components/
│   ├── lib/
│   │   └── supabase.js
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminUsers.jsx
│   │   ├── AdminCharities.jsx
│   │   ├── AdminReports.jsx
│   │   ├── AdminWinners.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Scores.jsx
│   │   ├── Charities.jsx
│   │   ├── Subscribe.jsx
│   │   ├── Draws.jsx
│   │   └── Donate.jsx
│   ├── App.jsx
│   └── index.css
├── .env
├── package.json
├── vite.config.js
└── README.md