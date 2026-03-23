# Expense Tracker

![License](https://img.shields.io/github/license/DEVS-shakti/expense-tracker)
![Last Commit](https://img.shields.io/github/last-commit/DEVS-shakti/expense-tracker)
![Stars](https://img.shields.io/github/stars/DEVS-shakti/expense-tracker)
![Issues](https://img.shields.io/github/issues/DEVS-shakti/expense-tracker)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)

A modern personal finance tracker built with React, Firebase, and Tailwind CSS. Track income and expenses, manage budgets by month, and explore insights with interactive charts.

## Table of Contents

- Overview
- Features
- Demo
- Screenshots
- Screens and Routes
- Tech Stack
- Getting Started
- Environment Variables
- Firebase Setup
- Data Model
- Scripts
- Project Structure
- Deployment
- License

## Overview

Expense Tracker (ExpenseTrack) is a single-page React application with Firebase Authentication and Firestore persistence. It focuses on quick transaction entry, category management, monthly budgets, and clean visual insights.

## Features

- Email and password authentication
- Google sign-in via Firebase Auth
- Dashboard with month selector and summaries
- Transaction list and quick add modal
- Category management for income and expense
- Monthly budgets per category
- Insights with category breakdowns, trends, and budget vs actual
- Profile view with password reset
- Theme switcher (light, dark, system)
- Responsive layout with a collapsible sidebar

## Demo

Add your demo GIF to `public/demo.gif` and update the path below if needed.

![Demo](public/demo.gif)

## Screenshots

Add screenshots to `public/screenshots/` and update the paths below.

| Screen | Preview |
| --- | --- |
| Landing | ![Landing](public/screenshots/landing.png) |
| Dashboard | ![Dashboard](public/screenshots/dashboard.png) |
| Insights | ![Insights](public/screenshots/insights.png) |
| Budgets | ![Budgets](public/screenshots/budgets.png) |

## Screens and Routes

- `/` Landing page
- `/login` Login
- `/register` Register
- `/dashboard` Dashboard overview
- `/dashboard/transactions` Transactions
- `/dashboard/categories` Categories
- `/dashboard/budgets` Budgets
- `/dashboard/insights` Insights
- `/dashboard/profile` Profile

## Tech Stack

| Layer | Tech |
| --- | --- |
| UI | React 19, React Router 7, Tailwind CSS |
| Charts | Recharts |
| Auth | Firebase Authentication |
| Data | Firebase Firestore |
| Tooling | Vite, ESLint, Prettier |

## Getting Started

Prerequisites

- Node.js 18+ (recommended)
- A Firebase project with Auth and Firestore enabled

Install and run

```bash
git clone https://github.com/DEVS-shakti/expense-tracker.git
cd expense-tracker
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Environment Variables

Copy the example file and fill in your Firebase project values.

```bash
copy .env.example .env
```

Environment variables used by the app

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

## Firebase Setup

1. Create a Firebase project.
2. Enable Authentication providers.
3. Enable Firestore (production or test rules as needed).
4. Add your local domain to Firebase Auth authorized domains.
5. Update `.env` with your Firebase config values.

Enabled auth flows used by the app

- Email and password
- Google sign-in

## Data Model

Firestore collections used by the app

- `users/{uid}/transactions`
- `users/{uid}/categories`
- `users/{uid}/budgets/{yyyy-mm}`

Typical transaction fields

- `amount` (number)
- `type` (income or expense)
- `category` (string)
- `description` (string)
- `date` (Date or Firestore Timestamp)

## Scripts

- `npm run dev` Start the Vite dev server
- `npm run build` Build for production
- `npm run preview` Preview the production build
- `npm run lint` Run ESLint

## Project Structure

```text
src/
assets/
components/
  Auth/
  Budget/
  Transaction/
  ui/
  utils/
context/
firebase/
layouts/
pages/
routes/
services/
utils/
App.jsx
main.jsx
index.css
```

## Deployment

Build the app and deploy the `dist/` folder to your hosting provider.

```bash
npm run build
```

You can also use `npm run preview` locally to validate the production build.

## License

MIT. See `LICENSE`.
