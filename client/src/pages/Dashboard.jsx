import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, PieChart, TrendingUp, Cpu, Brain, MessageSquare, Trash2, ChevronRight, LayoutDashboard, Clock } from 'lucide-react';

const Dashboard = () => {
    const [aptitudeStats, setAptitudeStats] = useState([]);
    const [interviewStats, setInterviewStats] = useState([]);

    useEffect(() => {
        const apt = JSON.parse(localStorage.getItem('aptitude_stats') || '[]');
        const intv = JSON.parse(localStorage.getItem('interview_stats') || '[]');
        setAptitudeStats(apt);
        setInterviewStats(intv);
    }, []);

    const clearStats = () => {
        if (window.confirm("Are you sure you want to clear your progress?")) {
            localStorage.clear();
            setAptitudeStats([]);
            setInterviewStats([]);
        }
    };

    const totalTests = aptitudeStats.length;
    const avgScore = aptitudeStats.length
        ? (aptitudeStats.reduce((acc, curr) => acc + (curr.score / curr.total), 0) / aptitudeStats.length * 100).toFixed(1)
        : 0;

    const weakTopics = aptitudeStats.reduce((acc, curr) => {
        if (curr.score / curr.total < 0.6) {
            acc[curr.topic] = (acc[curr.topic] || 0) + 1;
        }
        return acc;
    }, {});

    const topWeakTopic = Object.entries(weakTopics).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    return (
        <div className="pt-24 px-4 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-500/10 rounded-2xl">
                        <LayoutDashboard className="h-8 w-8 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black">Performance Dashboard</h2>
                        <p className="text-gray-500 dark:text-gray-400">Track your preparation progress across all categories.</p>
                    </div>
                </div>
                <button
                    onClick={clearStats}
                    className="flex items-center space-x-2 px-6 py-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold"
                >
                    <Trash2 className="h-4 w-4" />
                    <span>Clear Stats</span>
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <motion.div
                    whileHover={{ y: -5 }}
                    className="p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg"><LineChart className="h-5 w-5 text-blue-500" /></div>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-3xl font-black mb-1">{totalTests}</div>
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tests Taken</div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-green-500/10 rounded-lg"><PieChart className="h-5 w-5 text-green-500" /></div>
                        <div className="text-xs font-bold text-green-500">+12%</div>
                    </div>
                    <div className="text-3xl font-black mb-1">{avgScore}%</div>
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Avg. Accuracy</div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-red-500/10 rounded-lg"><Cpu className="h-5 w-5 text-red-500" /></div>
                    </div>
                    <div className="text-3xl font-black mb-1 truncate">{topWeakTopic}</div>
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Weak Focus</div>
                </motion.div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg"><MessageSquare className="h-5 w-5 text-purple-500" /></div>
                    </div>
                    <div className="text-3xl font-black mb-1">{interviewStats.length}</div>
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Interview Rounds</div>
                </motion.div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-gray-500" />
                        <span>Recent Activity</span>
                    </h3>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl overflow-hidden">
                        {aptitudeStats.length + interviewStats.length === 0 ? (
                            <div className="p-20 text-center text-gray-400">NO RECENT ACTIVITY</div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {aptitudeStats.slice().reverse().slice(0, 5).map((test, idx) => (
                                    <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2 bg-blue-500/10 rounded-xl"><Brain className="h-6 w-6 text-blue-500" /></div>
                                            <div>
                                                <div className="font-bold">{test.topic} Test</div>
                                                <div className="text-xs text-gray-500">{new Date(test.date).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase ${test.score / test.total > 0.7 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                                {test.score} / {test.total}
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-gray-300" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Interview Performance */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5 text-purple-500" />
                        <span>Interview Performance</span>
                    </h3>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl p-6">
                        {interviewStats.length === 0 ? (
                            <div className="p-20 text-center text-gray-400">NO INTERVIEW DATA</div>
                        ) : (
                            <div className="space-y-6">
                                {interviewStats.slice().reverse().slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between items-center text-sm font-bold">
                                            <span>Round {interviewStats.length - idx} ({item.topic})</span>
                                            <span className="text-purple-500">{item.score}/10</span>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${item.score * 10}%` }}
                                                className="bg-purple-600 h-full"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
