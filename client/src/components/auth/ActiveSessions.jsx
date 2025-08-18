import React, { useEffect, useState } from 'react';
import authService from '../../services/authService';
import { Monitor, LogOut, MapPin } from 'lucide-react';

const ActiveSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await authService.getActiveSessions();
                console.log('Active sessions response:', res.data);
                setSessions(res.data.data);
            } catch (err) {
                console.error("Failed to fetch sessions:", err);
                setError("Failed to load active sessions.");
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    const logoutSession = async (id) => {
        try {
            await authService.logoutSession(id);
            setSessions(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error("Failed to logout session:", err);
            alert("Could not log out session. Please try again.");
        }
    };

    return (
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-gray-400/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/5 rounded-lg backdrop-blur-sm">
                        <Monitor className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Active Sessions</h2>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white"></div>
                        <span className="ml-3 text-gray-300">Loading sessions...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                        <p className="text-red-400 font-medium">{error}</p>
                    </div>
                )}

                {!loading && sessions.length === 0 && (
                    <div className="text-center py-12">
                        <Monitor className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
                        <p className="text-gray-400 text-lg">No active sessions found</p>
                        <p className="text-gray-500 text-sm mt-1">Your account has no active sessions</p>
                    </div>
                )}

                <div className="space-y-3">
                    {sessions.map((session) => (
                        <div key={session.id} className="group/item relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-white/5 to-gray-400/5 rounded-xl opacity-0 group-hover/item:opacity-100 transition duration-300"></div>
                            <div className="relative bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-black/20 rounded-lg">
                                            <Monitor className="w-5 h-5 text-gray-300" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white text-xs">
                                                {session.device || "Unknown Device"}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <span className="text-gray-400 text-sm">
                                                    {session.ipAddress || "IP not available"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => logoutSession(session.id)}
                                        className="group/btn relative overflow-hidden bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-white hover:text-red-400 px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ml-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span className="font-medium text-sm">Logout</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ActiveSessions;