# **AfterThought 📝**

AI-powered journaling with behavioral insights

Afterthought is a journaling app that helps users reflect between therapy sessions by capturing not just what they write, but how they write. By analyzing timing, pauses, backspaces, and recurring themes, the app surfaces gentle, non-clinical insights and adaptive writing prompts.

Users stay fully in control of what insights remain private or are shared with a therapist.

# Features

   Freeform journaling (multiple entries per day)

   Daily AI-generated prompts (regenerated on refresh)

   Mood tracking with calendar view

   Access to all journals from the current day

   AI-powered reflections with private/shared toggles

   End-of-session summaries with simulated “Send” action

# AI Feedback Loop

   User behavior → AI interpretation → UX change

# Tracked signals:

   App open/close times

   Typing pauses and backspaces

   Writing speed and hesitation

   Repeated content themes


# Gemini analyzes aggregated behavioral data to:

   Detect hesitation or avoidance patterns

   Generate gentle follow-up prompts (one at a time)

   Adapt prompt tone and frequency

   No diagnoses. No clinical language.

# Tech Stack

   Frontend:

   * React

   * Tailwind

   * Framer

   * TypeScript

   Backend:

   * SQLite

   * Node.js
   
   * Express.js

   * Google Gemini 2.5 Pro


# Running the Project

## Frontend
cd frontend
npm install
npm run dev


Runs at http://localhost:8080

Create frontend/.env.local:

VITE_API_BASE_URL=http://localhost:3001

## Backend
cd backend
npm install
node server.js


Create backend/.env:

GEMINI_API_KEY=your_api_key_here


Get an API key from https://makersuite.google.com/app/apikey
