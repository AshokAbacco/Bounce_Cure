import React, { useState } from 'react';
import { Mail, Lock, User, CheckCircle, Shield, Zap, Globe, Clock, Phone } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { useNavigate } from "react-router-dom";
const ModernSignup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

    const [focusedField, setFocusedField] = useState('');
    const [isHovered, setIsHovered] = useState(false);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            console.log('Server response:', data);
            // alert("Signup successful! Please check your email for verification.");

            if (res.status === 201) {
                alert("Signup successful!");
                navigate("/login"); // Redirect to login
            } else {
                alert(data.message || "Signup failed");
            }


        } catch (err) {
            console.error('Error submitting form:', err);
        }
    };

    const benefits = [
        { icon: <CheckCircle className="w-5 h-5" />, text: "100 free credits every month" },
        { icon: <Mail className="w-5 h-5" />, text: "Email Provider Integrations" },
        { icon: <Zap className="w-5 h-5" />, text: "Real-Time Results" },
        { icon: <Globe className="w-5 h-5" />, text: "Full API Access with Sandbox" },
        { icon: <Phone className="w-5 h-5" />, text: "24/7 support by phone, email & chat" },
        { icon: <Shield className="w-5 h-5" />, text: "Access to our Deliverability Toolkit" }
    ];

    const companies = [
        { name: "Amazon" },
        { name: "Netflix" },
        { name: "Disney" },
        { name: "HubSpot" }
    ];

    return (
        <PageLayout>
            <div className="min-h-screen bg-black mt-[2%] flex flex-col md:flex-row w-full">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full mix-blend-difference filter blur-xl opacity-5 animate-pulse hidden sm:block"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white rounded-full mix-blend-difference filter blur-xl opacity-5 animate-pulse hidden sm:block"></div>
                    <div className="absolute top-40 left-40 w-60 h-60 bg-white rounded-full mix-blend-difference filter blur-xl opacity-5 animate-pulse hidden sm:block"></div>
                </div>

                <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative z-10">
                    <div className="w-full max-w-md md:max-w-lg">
                        <div className="text-center mt-20 mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-6 transform hover:scale-110 transition-transform duration-300">
                                <Mail className="w-8 h-8 text-black" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                                Bounce Cure
                            </h1>
                            <p className="text-gray-400 text-base sm:text-lg">
                                Create your free account in seconds
                            </p>
                            <div className="w-20 h-1 bg-white mx-auto mt-4 rounded-full"></div>
                        </div>

                        <button
                            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-white font-medium flex items-center justify-center gap-3 hover:bg-white hover:text-black transition-all duration-300 mb-6 group"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center group-hover:bg-black transition-colors duration-300">
                                <span className="text-xs font-bold text-black group-hover:text-white">G</span>
                            </div>
                            <span className={`transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}>
                                Continue with Google
                            </span>
                        </button>

                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-black text-gray-400">or continue with email</span>
                            </div>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative group">
                                    <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'firstName' ? 'text-white' : 'text-white'}`} />
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="First Name"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('firstName')}
                                        onBlur={() => setFocusedField('')}
                                        className="w-full bg-white/5 bg-clip-padding border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300" />
                                </div>
                                <div className="relative group">
                                    <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'lastName' ? 'text-white' : 'text-gray-400'}`} />
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Last Name"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        onFocus={() => setFocusedField('lastName')}
                                        onBlur={() => setFocusedField('')}
                                        className="w-full bg-white/5  border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300"
                                    />
                                </div>
                            </div>

                            <div className="relative group">
                                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-white' : 'text-gray-400'}`} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField('')}
                                    className="w-full bg-white/5 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300"
                                />
                            </div>

                            <div className="relative group">
                                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'password' ? 'text-white' : 'text-gray-400'}`} />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Create Password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField('')}
                                    className="w-full bg-white/5  border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-white focus:bg-white/10 transition-all duration-300"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-white text-black font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-white/25 hover:bg-gray-100"
                            >
                                Create Free Account
                            </button>
                        </form>

                        <p className="text-center text-gray-400 mt-6">
                            Already have an account?{' '}
                            <a href="/login" className="text-white hover:text-gray-300 transition-colors duration-300 underline">
                                Sign in here
                            </a>
                        </p>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center p-6 sm:p-8 relative z-10">
                    <div className="w-full max-w-lg">
                        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-4 border border-white/20">
                                    <Shield className="w-5 h-5 text-white" />
                                    <span className="text-white font-medium text-sm sm:text-base">Premium Business Account</span>
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                                    Unlock Premium Features
                                </h3>
                                <p className="text-gray-300 text-sm sm:text-base">
                                    Get everything you need to validate emails at scale
                                </p>
                            </div>

                            <div className="space-y-4 mb-8">
                                {benefits.map((benefit, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 text-white hover:bg-white/5 p-3 rounded-xl transition-all duration-300 group border border-transparent hover:border-white/10"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="text-white group-hover:scale-110 transition-transform duration-300">
                                            {benefit.icon}
                                        </div>
                                        <span className="group-hover:translate-x-1 transition-transform duration-300 text-sm sm:text-base">
                                            {benefit.text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-white/10 pt-6">
                                <p className="text-white font-semibold mb-4 text-center text-sm sm:text-base">
                                    Trusted by 400,000+ clients worldwide
                                </p>
                                <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
                                    {companies.map((company, index) => (
                                        <div
                                            key={index}
                                            className="font-bold text-base sm:text-lg text-gray-300 hover:text-white hover:scale-110 transition-all duration-300 cursor-default"
                                        >
                                            {company.name}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <div className="inline-flex items-center gap-2 text-gray-400 bg-white/5 rounded-full px-4 py-2 border border-white/10 text-xs sm:text-sm">
                                    <Clock className="w-4 h-4" />
                                    <span>Setup takes less than 2 minutes</span>
                                </div>
                            </div>
                        </div>

                        <div className="absolute top-10 right-10 w-32 h-32 border border-white/10 rounded-full animate-pulse hidden sm:block"></div>
                        <div className="absolute bottom-10 left-10 w-24 h-24 border border-white/5 rounded-full animate-pulse hidden sm:block"></div>
                        <div className="absolute top-1/2 left-0 w-2 h-20 bg-white/20 rounded-full hidden sm:block"></div>
                        <div className="absolute top-1/4 right-0 w-1 h-32 bg-white/10 rounded-full hidden sm:block"></div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default ModernSignup;
