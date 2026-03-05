import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Menu, X, Rocket, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useApi } from '../context/ApiContext';

const Navbar = () => {
    const { darkMode, toggleDarkMode } = useTheme();
    const { isConfigured, clearApiKey } = useApi();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Aptitude', path: '/aptitude' },
        { name: 'CSE Core', path: '/cse' },
        { name: 'Mock Interview', path: '/interview' },
        { name: 'Dashboard', path: '/dashboard' }
    ];

    return (
        <nav className="fixed w-full top-0 z-50 transition-colors duration-300 dark:bg-gray-950/80 bg-white/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center space-x-2">
                        <Rocket className="h-8 w-8 text-blue-500" />
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Campus Crack
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`text-sm font-medium transition-colors ${location.pathname === item.path
                                        ? 'text-blue-500'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center space-x-4">
                        {isConfigured && (
                            <button
                                onClick={clearApiKey}
                                className="hidden md:flex items-center space-x-1 text-xs font-bold text-red-500 hover:text-red-600 bg-red-500/10 px-3 py-1.5 rounded-full transition-all"
                                title="Disconnect API Key"
                            >
                                <LogOut className="h-3 w-3" />
                                <span>Logout AI</span>
                            </button>
                        )}

                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
                        </button>

                        <button
                            className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                        {isConfigured && (
                            <button
                                onClick={() => { clearApiKey(); setIsMenuOpen(false); }}
                                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-red-50"
                            >
                                Disconnect API Key
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
