import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ApiProvider } from './context/ApiContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Aptitude from './pages/Aptitude';
import CSECore from './pages/CSECore';
import MockInterview from './pages/MockInterview';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <ApiProvider>
      <ThemeProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/aptitude" element={<Aptitude />} />
                <Route path="/cse" element={<CSECore />} />
                <Route path="/interview" element={<MockInterview />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </main>

            <footer className="py-12 px-4 text-center text-gray-400 text-sm border-t border-gray-100 dark:border-gray-800 mt-20">
              <p>&copy; 2026 Campus Crack - AI Driven Placement Platform</p>
              <p className="mt-2 text-xs">Developed by ⚡Shetty</p>
            </footer>
          </div>
        </Router>
      </ThemeProvider>
    </ApiProvider>
  );
}

export default App;
