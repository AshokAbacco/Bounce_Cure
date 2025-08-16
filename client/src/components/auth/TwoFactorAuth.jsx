import React, { useState } from 'react';
import { ShieldCheck, QrCode, Smartphone, Key, CheckCircle } from 'lucide-react';
import authService from '../../services/authService';

const TwoFactorAuth = () => {
    const [enabled, setEnabled] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    // Enable 2FA: generate OTP & QR code
    const handleEnable = async () => {
        setLoading(true);
        try {
            const res = await authService.enable2FA();
            setQrCode(res.qrCodeDataURL);
            alert("OTP has been sent to your registered email address. Please check your inbox.");
            setEnabled(true);
        } catch (err) {
            console.error(err);
            alert('Failed to enable 2FA');
        } finally {
            setLoading(false);
        }
    };

    // Verify OTP entered by user
    const handleVerify = async () => {
        if (!otp) {
            alert('Please enter the OTP');
            return;
        }

        setLoading(true);
        try {
            await authService.verify2FA(otp);
            alert('2FA Enabled Successfully!');
            setOtp('');
            setQrCode('');
            setEnabled(false);
        } catch (err) {
            console.error(err);
            alert('Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-gray-400/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/5 rounded-lg backdrop-blur-sm">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Two-Factor Authentication</h2>
                </div>

                {!enabled ? (
                    <div className="space-y-6">
                        {/* Info Section */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-500/10 rounded-full">
                                    <Smartphone className="w-8 h-8 text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        Secure Your Account
                                    </h3>
                                    <p className="text-gray-300 leading-relaxed mb-4">
                                        Add an extra layer of security to your account with two-factor authentication.
                                        You'll need your phone to sign in, making your account much more secure.
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                            <span>Protects against unauthorized access</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                            <span>Works with any authenticator app</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                            <span>Quick and easy setup</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enable Button */}
                        <button
                            onClick={handleEnable}
                            disabled={loading}
                            className="group/btn relative w-full overflow-hidden bg-white/5 hover:bg-white/10 disabled:bg-gray-500/20 border border-white/20 hover:border-white/40 disabled:border-gray-500/20 text-white disabled:text-gray-400 py-4 px-6 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed"
                        >
                            <div className="relative flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                                        <span>Setting up 2FA...</span>
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="w-5 h-5" />
                                        <span>Enable Two-Factor Authentication</span>
                                    </>
                                )}
                            </div>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Setup Instructions */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <QrCode className="w-5 h-5 text-blue-400" />
                                Setup Instructions
                            </h3>
                            <div className="space-y-3 text-gray-300">
                                <p className="flex items-start gap-2">
                                    <span className="flex-shrink-0 w-6 h-6 bg-white/10 rounded-full text-xs flex items-center justify-center font-semibold">1</span>
                                    Download an authenticator app (Google Authenticator, Authy, etc.)
                                </p>
                                <p className="flex items-start gap-2">
                                    <span className="flex-shrink-0 w-6 h-6 bg-white/10 rounded-full text-xs flex items-center justify-center font-semibold">2</span>
                                    Scan the QR code below with your app
                                </p>
                                <p className="flex items-start gap-2">
                                    <span className="flex-shrink-0 w-6 h-6 bg-white/10 rounded-full text-xs flex items-center justify-center font-semibold">3</span>
                                    Enter the 6-digit code from your app
                                </p>
                            </div>
                        </div>

                        {/* QR Code Display */}
                        {qrCode && (
                            <div className="text-center">
                                <div className="inline-block bg-white/5 border border-white/10 rounded-xl p-6">
                                    <img
                                        src={qrCode}
                                        alt="Scan QR code"
                                        className="w-48 h-48 mx-auto rounded-lg bg-white p-2"
                                    />
                                    <p className="text-gray-400 text-sm mt-3">
                                        Scan this QR code with your authenticator app
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* OTP Input */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Verification Code
                            </label>
                            <div className="relative group/input">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 to-gray-400/10 rounded-xl opacity-0 group-focus-within/input:opacity-100 transition duration-300"></div>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                        <Key className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter 6-digit code"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength="6"
                                        className="w-full bg-black/30 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:border-white/30 focus:bg-black/50 focus:outline-none transition-all duration-300 text-center font-mono text-lg tracking-widest"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Verify Button */}
                        <button
                            onClick={handleVerify}
                            disabled={loading || !otp}
                            className="group/btn relative w-full overflow-hidden bg-green-500/10 hover:bg-green-500/20 disabled:bg-gray-500/20 border border-green-500/20 hover:border-green-500/40 disabled:border-gray-500/20 text-green-400 disabled:text-gray-400 py-4 px-6 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed"
                        >
                            <div className="relative flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-400/20 border-t-green-400"></div>
                                        <span>Verifying...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        <span>Verify & Enable 2FA</span>
                                    </>
                                )}
                            </div>
                        </button>

                        {/* Help Text */}
                        <div className="bg-black/20 border border-white/5 rounded-xl p-4">
                            <h4 className="text-sm font-semibold text-white mb-2">Troubleshooting</h4>
                            <ul className="text-xs text-gray-400 space-y-1">
                                <li>• Make sure your device's time is synchronized</li>
                                <li>• Try refreshing the code in your authenticator app</li>
                                <li>• Contact support if you're still having issues</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
};

export default TwoFactorAuth;