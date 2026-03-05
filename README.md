# Campus Crack - AI Driven Placement Platform

A fully responsive modern web application for CSE students to prepare for campus placements, powered by Google Gemini AI.

## Features
- **Aptitude Section**: Practice Quant, Logical, and Verbal reasoning with AI-generated questions.
- **CSE Core Subjects**: Master DBMS, OS, Networking, OOPS, and DSA Theory.
- **Mock Interview**: Get real-time technical interview questions and intelligent feedback/scoring.
- **Performance Tracker**: Monitor your test history, average accuracy, and identify weak topics.
- **Dark/Light Mode**: Fully responsive, clean, and modern UI.

## Tech Stack
- **Frontend**: React.js, Tailwind CSS, Framer Motion, Lucide Icons, Axios, React Router.
- **Backend**: Node.js, Express, @google/generative-ai.
- **AI**: Google Gemini API (model: gemini-1.5-flash).

## Setup Instructions

### 1. Prerequisites
- Node.js installed on your machine.
- A Google Gemini API Key. [Get one here](https://aistudio.google.com/app/apikey).

### 2. Backend Setup
1. Navigate to the `server` folder:
   ```bash
   cd server
   ```
2. Create/Open `.env` file and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   PORT=5000
   ```
3. Run the server:
   ```bash
   npm start
   ```
   (Note: Use `node index.js` if `npm start` is not defined in scripts).

### 3. Frontend Setup
1. Navigate to the `client` folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### 4. Open in Browser
Visit `http://localhost:5173` to start practicing!

## Important Notes
- Ensure the backend is running on port 5000 for the frontend to communicate with it.
- Your Gemini API key should never be exposed in the frontend. All AI processing happens in the backend.
- Local performance data is stored in your browser's `localStorage`.
