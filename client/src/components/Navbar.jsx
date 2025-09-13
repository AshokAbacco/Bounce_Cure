import React, { useState, useEffect } from "react";
import { Menu, X, Mail, RefreshCw, CheckCircle } from "lucide-react";
import {
  FaEnvelope,
  FaListAlt,
  FaPlug,
  FaInstagram,
  FaWhatsapp,
  FaFacebook,
  FaLinkedin,
  FaYoutube,
  FaSms,
  FaGoogle,
  FaAt,
  FaPlus,
  FaBullhorn,
  FaBroom,
  FaCompressAlt
} from "react-icons/fa";
import { RiTwitterXFill } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import { AtSign } from "lucide-react";
import { CheckSquare, ShieldCheck, FileCheck } from "lucide-react";
import { CopyMinus, Layers } from "lucide-react";
import { Trash2, Eraser, Scissors } from "lucide-react";
import { ListPlus, Send, Users } from "lucide-react";
import { PlusCircle, Database, ListPlus as ListPlusIcon } from "lucide-react";
import { HeartPulse, Cross, Activity } from "lucide-react";

// Bouncing Face Logo Component
const CubeLogo = () => {
  const [currentFace, setCurrentFace] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFace((prev) => (prev + 1) % 13); // Updated to 13 faces
    }, 2000); // Change face every 2 seconds
    return () => clearInterval(interval);
  }, []);
  const faces = [
    // Front Face - Signal Wave
    <div key="front" className="w-10 h-10 bg-black from-[#c2831f] to-yellow-600 rounded-xl flex flex-col items-center justify-center overflow-hidden border border-[#c2831f]">
      <div className="flex items-end space-x-0.5">
        <div className="w-0.5 h-4 bg-white rounded-full animate-wave-1"></div>
        <div className="w-0.5 h-3 bg-white rounded-full animate-wave-2"></div>
        <div className="w-0.5 h-5 bg-white rounded-full animate-wave-3"></div>
        <div className="w-0.5 h-3.5 bg-white rounded-full animate-wave-4"></div>
        <div className="w-0.5 h-4.5 bg-white rounded-full animate-wave-5"></div>
      </div>
      <span className="text-[10px] text-white mt-0.5">Signal</span>
    </div>,
    // Back Face - Mail Icon
    <div key="back" className="w-10 h-10 bg-black rounded-xl flex flex-col items-center justify-center border border-[#c2831f]">
      <Mail className="w-5 h-5 text-white" />
      <span className="text-[10px] text-white mt-0.5">Mail</span>
    </div>,
    // Right Face - @ Symbol
    <div key="right" className="w-10 h-10 bg-black rounded-xl flex flex-col items-center justify-center border border-[#c2831f]">
      <span className="text-xl font-bold text-white">@</span>
      <span className="text-[6px] text-white mt-0.5">Username</span>
    </div>,
    // Top Face - Refresh Icon
    <div key="top" className="w-10 h-10 bg-black rounded-xl flex flex-col items-center justify-center border border-[#c2831f]">
      <RefreshCw className="w-5 h-5 text-white" />
      <span className="text-[10px] text-white mt-0.5">Refresh</span>
    </div>,
    // Data Refresh Face
    <div key="data-refresh" className="w-10 h-10 bg-black rounded-xl flex flex-col items-center justify-center border border-[#c2831f]">
      <Database className="w-5 h-5 text-white" />
      <span className="text-[5px] text-white mt-0.5">Data Refresh</span>
    </div>,
    // Data Validation Face
    <div key="data-validation" className="w-10 h-10 bg-black rounded-xl flex flex-col items-center justify-center border border-[#c2831f]">
      <ShieldCheck className="w-5 h-5 text-white" />
      <span className="text-[7px] text-white mt-0.5">Validation</span>
    </div>,
    // Data Appending Face
    <div key="data-appending" className="w-10 h-10 bg-black rounded-xl flex flex-col items-center justify-center border border-[#c2831f]">
      <ListPlusIcon className="w-5 h-5 text-white" />
      <span className="text-[6px] text-white mt-0.5">Appending</span>
    </div>,
    // Email Campaign Face
    <div key="email-campaign" className="w-10 h-10 bg-black rounded-xl flex flex-col items-center justify-center border border-[#c2831f]">
      <Send className="w-5 h-5 text-white" />
      <span className="text-[5px] text-white mt-0.5">Campaign</span>
    </div>,
    // Lead Generating Face
    <div key="lead-generating" className="w-10 h-10 bg-black rounded-xl flex flex-col items-center justify-center border border-[#c2831f]">
      <Users className="w-5 h-5 text-white" />
      <span className="text-[10px] text-white mt-0.5">Leads</span>
    </div>,
    // Data Cleansing Face
    <div key="data-cleansing" className="w-10 h-10 bg-black rounded-xl flex flex-col items-center justify-center border border-[#c2831f]">
      <Eraser className="w-5 h-5 text-white" />
      <span className="text-[7px] text-white mt-0.5">Cleansing</span>
    </div>,
    // Dedupe Face
    <div key="dedupe" className="w-10 h-10 bg-black rounded-xl flex flex-col items-center justify-center border border-[#c2831f]">
      <CopyMinus className="w-5 h-5 text-white" />
      <span className="text-[8px] text-white mt-0.5">Dedupe</span>
    </div>,
    // Bottom Face - Brand Text (Cure) - Updated Design
    <div
      key="bottom"
      className="w-10 h-10 bg-black rounded-xl flex flex-col items-center justify-center border border-[#c2831f] relative overflow-hidden"
    >
      {/* Animated glowing circular background */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#c2831f]/30 to-yellow-500/20 animate-pulse-slow blur-sm"></div>
      {/* Unique "CURE" emblem */}
      <div className="flex flex-col items-center justify-center z-10">
        {/* Shield-like circle */}
        <div className="relative w-6 h-6 flex items-center justify-center rounded-full border-2 border-yellow-500">
          {/* Diagonal checkmark */}
          <div className="absolute w-0.5 h-3 bg-red-500 rotate-45 origin-bottom-left animate-bounce-check"></div>
          <div className="absolute w-1.5 h-0.5 bg-red-500 rotate-45 origin-bottom-left -translate-x-1 translate-y-1 animate-bounce-check-delay"></div>
        </div>
        {/* CURE text */}
        <span className="text-[7px] font-bold text-yellow-500 mt-1 tracking-wider">CURE</span>
      </div>
      {/* Outer subtle pulse border */}
      <div className="absolute inset-0 rounded-xl border border-red-500/30 animate-pulse-slow"></div>
      {/* Tailwind animations */}
      <style>
        {`
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.1); }
          }
          .animate-pulse-slow {
            animation: pulse-slow 2.5s ease-in-out infinite;
          }
          @keyframes bounce-check {
            0%, 100% { transform: rotate(45deg) scale(1); }
            50% { transform: rotate(45deg) scale(1.2); }
          }
          .animate-bounce-check {
            animation: bounce-check 1.5s ease-in-out infinite;
          }
          @keyframes bounce-check-delay {
            0%, 100% { transform: rotate(45deg) scale(1); }
            50% { transform: rotate(45deg) scale(1.2); }
          }
          .animate-bounce-check-delay {
            animation: bounce-check-delay 1.5s ease-in-out infinite 0.2s;
          }
        `}
      </style>
    </div>,
    // Left Face - Check Circle
    <div key="left"className="w-11 h-11 bg-black rounded-xl flex flex-col items-center justify-center border border-[#c2831f]">
      <CheckCircle className="w-8 h-8 text-green-500" />
      <span className="text-[10px] text-white">Check</span>
    </div>,
  ];

  return (
    <div className="relative w-10 h-10 mt-2 overflow-hidden">
      {faces.map((face, index) => (
        <div
          key={face.key}
          className={`absolute top-0 left-0 w-full h-full flex items-center justify-center transition-all duration-500 ease-in-out ${index === currentFace
            ? 'opacity-100 transform scale-100 translate-y-0 z-10'
            : 'opacity-0 transform scale-95 translate-y-2 z-0'
            }`}
        >
          {face}
        </div>
      ))}
    </div>
  );
};
const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [multimediaOpen, setMultimediaOpen] = useState(false);
  const links = [
    { name: "Home", to: "/" },
    { name: "About", to: "/about" },
    { name: "Features", to: "/features" },
    { name: "Services", to: "/services" },
    { name: "Multimedia", to: "/multimedia" },
    { name: "Pricing", to: "/pricing" },
    { name: "Contact", to: "/contact" },
  ];
  const services = [
    { name: "Email Verification", icon: <FaEnvelope />, to: "/services/email-verification" },
    { name: "Bulk Verification", icon: <FaListAlt />, to: "/services/bulk-verification" },
    { name: "Integrations", icon: <FaPlug />, to: "/services/integrations" },
  ];
  const multimedia = [
    { name: "WhatsApp Campaign", icon: <FaWhatsapp />, to: "/WatsupCampaign" },
    { name: "SMS Campaign", icon: <FaSms />, to: "/SMScampaign" },
    { name: "Facebook Campaign", icon: <FaFacebook />, to: "/WatsupCampaign" },
    { name: "Instagram Campaign", icon: <FaInstagram />, to: "/WatsupCampaign" },
    { name: "Twitter Campaign", icon: <RiTwitterXFill />, to: "/WatsupCampaign" },
    { name: "LinkedIn Campaign", icon: <FaLinkedin />, to: "/WatsupCampaign" },
    { name: "YouTube Ads", icon: <FaYoutube />, to: "/WatsupCampaign" },
    { name: "Google Ads", icon: <FaGoogle />, to: "/WatsupCampaign" },
  ];
  const handleLogoClick = (e) => {
    e.preventDefault();
    navigate('/');
  };
  return (
    <nav className="fixed w-full z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
      <style jsx global>{`
        .nav-link { 
          position: relative; 
          color: white; 
          font-weight: 500; 
          padding-bottom: 4px; 
          transition: color 0.3s ease; 
        }
        .nav-link::after { 
          content: ''; 
          position: absolute; 
          bottom: 0; 
          left: 0; 
          width: 0; 
          height: 2px; 
          background-color: #c2831f; 
          transition: width 0.3s ease; 
        }
        .nav-link:hover { 
          color: #c2831f; 
        }
        .nav-link:hover::after { 
          width: 100%; 
        }
        .multimedia-item { 
          display: flex; 
          align-items: center; 
          color: white; 
          transition: color 0.3s ease; 
        }
        .multimedia-item:hover { 
          color: #c2831f; 
        }
        .multimedia-item svg { 
          color: inherit; 
          transition: color 0.3s ease; 
        }
        @keyframes typewriterBounce { 
          0% { opacity: 0; width: 0; } 
          5% { opacity: 1; width: 0; } 
          20% { width: 100%; opacity: 1; transform: scale(1); } 
          22% { transform: scale(1.1); } 
          25% { opacity: 0; transform: scale(1); } 
          100% { opacity: 0; } 
        }
        @keyframes mailPop { 
          0%, 25% { opacity: 0; transform: scale(0.3); } 
          28% { opacity: 1; transform: scale(1.3); } 
          30% { transform: scale(1); } 
          35% { transform: scale(1.1); } 
          40% { opacity: 0; transform: scale(0.5); } 
          100% { opacity: 0; } 
        }
        @keyframes mailScatter { 
          0% { opacity: 0; transform: translate(0,0) scale(0.5); } 
          10% { opacity: 1; transform: scale(1.2); } 
          100% { opacity: 0; transform: translate(var(--x), var(--y)) scale(0.3); } 
        }
        @keyframes typewriterCure { 
          0%, 40% {
            opacity: 0;
            transform: translateX(100%);
          }
          45% {
            opacity: 1;
            transform: translateX(0);
          }
          50% {
            opacity: 1;
            transform: translateX(0);
          }
          55% {
            opacity: 1;
            transform: translateX(0);
          }
          60% {
            opacity: 0;
            transform: translateX(-100%);
          }
          100% {
            opacity: 0;
            transform: translateX(-100%);
          }
        }
        @keyframes fullTextAppear { 
          0%, 60% {
            opacity: 0;
            transform: scale(0.8);
            filter: blur(4px);
          }
          65% {
            opacity: 1;
            transform: scale(1.2);
            filter: blur(0);
            text-shadow: 0 0 10px rgba(194, 131, 31, 0.7);
          }
          70% {
            transform: scale(0.9);
            text-shadow: 0 0 20px rgba(194, 131, 31, 0.9);
          }
          75% {
            transform: scale(1);
            text-shadow: none;
          }
          95% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        @keyframes wave-1 { 0%, 100% { height: 1rem; opacity: 0.7; } 50% { height: 0.5rem; opacity: 1; } }
        @keyframes wave-2 { 0%, 100% { height: 0.75rem; opacity: 0.7; } 50% { height: 1.25rem; opacity: 1; } }
        @keyframes wave-3 { 0%, 100% { height: 1.25rem; opacity: 0.7; } 50% { height: 0.6rem; opacity: 1; } }
        @keyframes wave-4 { 0%, 100% { height: 0.6rem; opacity: 0.7; } 50% { height: 1rem; opacity: 1; } }
        @keyframes wave-5 { 0%, 100% { height: 1rem; opacity: 0.7; } 50% { height: 0.5rem; opacity: 1; } }
        
        .animate-typewriter-bounce { 
          display: inline-block; 
          overflow: hidden; 
          white-space: nowrap; 
          animation: typewriterBounce 16s linear infinite; 
        }
        .animate-typewriter-cure { 
          display: inline-block; 
          overflow: hidden; 
          white-space: nowrap; 
          animation: typewriterCure 16s linear infinite; 
        }
        .animate-full-text { 
          animation: fullTextAppear 16s ease-in-out infinite; 
        }
        .mail-container { 
          position: relative; 
          display: inline-block; 
        }
        .mail-scatter { 
          position: absolute; 
          top: 0; 
          left: 0; 
          color: #facc15; 
          opacity: 0; 
          font-size: 0.7em; 
          animation: mailScatter 0.6s ease forwards; 
        }
        .animate-wave-1 { animation: wave-1 1.5s ease-in-out infinite 0.1s; }
        .animate-wave-2 { animation: wave-2 1.5s ease-in-out infinite 0.2s; }
        .animate-wave-3 { animation: wave-3 1.5s ease-in-out infinite 0.3s; }
        .animate-wave-4 { animation: wave-4 1.5s ease-in-out infinite 0.2s; }
        .animate-wave-5 { animation: wave-5 1.5s ease-in-out infinite 0.1s; }
        
        /* Simple bounce animation */
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce {
          animation: bounce 2s ease-in-out infinite;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-1 py-2 flex items-center justify-between">
        {/* Logo & Animated Text */}
        <Link
          to="/"
          className="flex flex-col min-w-[300px] cursor-pointer"
          onClick={handleLogoClick}
        >
          <div className="flex items-center">
            {/* Bouncing Face Logo */}
            <div className="animate-bounce z-10">
              <CubeLogo />
            </div>
            {/* Right Text Section */}
            <div className="flex flex-col ml-3">
              <div className="relative w-56 h-8">
                {/* Step 1: Bounce text */}
                <h1 className="absolute text-2xl font-bold bg-gradient-to-r from-[#c2831f] to-yellow-500 bg-clip-text text-transparent animate-typewriter-bounce">
                  B@UNCE
                </h1>
                {/* Step 2: Mail + @ scatter */}
                <div className="absolute inset-0 flex items-center justify-center space-x-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="mail-container"
                      style={{ animationDelay: `${i * 0.3}s` }}
                    >
                      {/* Pop Mail */}
                      <FaAt
                        className="text-[#c2831f]"
                        style={{
                          animation: `mailPop 16s ease-in-out infinite`,
                          animationDelay: `${i * 0.3}s`,
                        }}
                      />
                      {/* Scatter (Mail + @ alternating) */}
                      {[...Array(5)].map((_, j) =>
                        j % 2 === 0 ? (
                          <Mail
                            key={j}
                            className="mail-scatter text-yellow-400"
                            style={{
                              "--x": `${Math.random() * 40 - 20}px`,
                              "--y": `${Math.random() * -30 - 10}px`,
                              animationDelay: `${i * 0.3 + 0.3}s`,
                            }}
                          />
                        ) : (
                          <span
                            key={j}
                            className="mail-scatter text-yellow-400 font-bold text-xs"
                            style={{
                              "--x": `${Math.random() * 40 - 20}px`,
                              "--y": `${Math.random() * -30 - 10}px`,
                              animationDelay: `${i * 0.3 + 0.3}s`,
                            }}
                          >
                            @
                          </span>
                        )
                      )}
                    </div>
                  ))}
                </div>
                {/* Step 3: Cure text - Now sliding from right to left */}
                <h1 className="absolute right-0 text-2xl font-bold bg-gradient-to-r from-[#c2831f] to-yellow-500 bg-clip-text text-transparent animate-typewriter-cure">
                  CURE
                </h1>
                {/* Step 4: Full text bounce */}
                <h1 className="absolute text-2xl font-bold bg-gradient-to-r from-[#c2831f] to-yellow-500 bg-clip-text text-transparent animate-full-text">
                  B<span className="text-yellow-500">@</span>UNCE CURE
                </h1>
              </div>
              {/* Slogan */}
              <p className="text-[#f19c12] text-xs mt-1 opacity-100 animate-bounce">
                Built for Accuracy. Designed for Growth.
              </p>
            </div>
          </div>
        </Link>
        {/* Desktop Menu */}
        <div className="hidden lg:flex space-x-8 items-center">
          {links.map((link) => {
            if (link.name === "Services") {
              return (
                <div key={link.name} className="relative group">
                  <button
                    onClick={() => setServicesOpen(!servicesOpen)}
                    className="nav-link flex items-center cursor-pointer"
                  >
                    {link.name}
                    <svg
                      className={`ml-1 w-4 h-4 transition-transform ${servicesOpen ? "rotate-180" : "rotate-0"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {servicesOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-black/70 backdrop-blur-lg rounded-lg shadow-lg py-2 w-64 border border-white/10 max-h-96 overflow-y-auto">
                      {services.map((item) => (
                        <Link
                          key={item.name}
                          to={item.to}
                          className="flex items-center px-2 py-2 text-white hover:text-[#c2831f] rounded-lg"
                        >
                          <span className="mr-2">{item.icon}</span>
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            } else if (link.name === "Multimedia") {
              return (
                <div key={link.name} className="relative group">
                  <button
                    onClick={() => setMultimediaOpen(!multimediaOpen)}
                    className="nav-link flex items-center cursor-pointer"
                  >
                    {link.name}
                    <svg
                      className={`ml-1 w-4 h-4 transition-transform ${multimediaOpen ? "rotate-180" : "rotate-0"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {multimediaOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-black backdrop-blur-lg rounded-lg shadow-lg py-2 w-64 border border-white/10 max-h-96 overflow-y-auto">
                      {multimedia.map((item) => (
                        <a
                          key={item.name}
                          href={item.to}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="multimedia-item px-4 py-2 rounded-lg"
                        >
                          <span className="mr-2">{item.icon}</span>
                          {item.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            } else {
              return <Link key={link.name} to={link.to} className="nav-link">{link.name}</Link>;
            }
          })}
          <a href="/signup" className="bg-[#c2831f] text-white px-4 py-2 rounded-xl hover:bg-[#a66a1a] transition-colors">
            Sign Up
          </a>
          <a href="/login" className="border border-[#c2831f] text-white px-4 py-2 rounded-xl hover:bg-[#c2831f] transition-colors">
            Sign In
          </a>
        </div>
        {/* Mobile Menu Toggle */}
        <div className="lg:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white p-2 rounded-lg hover:bg-black/20 transition-colors"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden bg-black/40 backdrop-blur-lg px-6 pb-6 shadow-lg border-t border-white/10">
          {links.map((link) => (
            <div key={link.name} className="mt-2">
              {link.name === "Services" ? (
                <>
                  <button
                    onClick={() => setServicesOpen(!servicesOpen)}
                    className="w-full flex justify-between text-white py-2"
                  >
                    {link.name}
                    <span>{servicesOpen ? "-" : "+"}</span>
                  </button>
                  {servicesOpen && services.map((item) => (
                    <Link
                      key={item.name}
                      to={item.to}
                      className="block pl-4 mt-1 text-white py-2 hover:text-[#c2831f]"
                    >
                      {item.name}
                    </Link>
                  ))}
                </>
              ) : link.name === "Multimedia" ? (
                <>
                  <button
                    onClick={() => setMultimediaOpen(!multimediaOpen)}
                    className="w-full flex justify-between text-white py-2"
                  >
                    {link.name}
                    <span>{multimediaOpen ? "-" : "+"}</span>
                  </button>
                  {multimediaOpen && multimedia.map((item) => (
                    <a
                      key={item.name}
                      href={item.to}
                      className="multimedia-item block pl-4 mt-1 py-2"
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </a>
                  ))}
                </>
              ) : (
                <Link
                  to={link.to}
                  className="block text-white py-2 hover:text-[#c2831f]"
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}
          <a href="/signup" className="block bg-[#c2831f] text-white text-center px-4 py-2 mt-3 rounded-xl hover:bg-[#a66a1a] transition-colors">
            Sign Up
          </a>
          <a href="/login" className="block border border-[#c2831f] text-white text-center px-4 py-2 mt-2 rounded-xl hover:bg-[#c2831f] transition-colors">
            Sign In
          </a>
        </div>
      )}
    </nav>
  );
};
export default Navbar;