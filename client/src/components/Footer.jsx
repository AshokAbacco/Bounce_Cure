import React, { useState } from "react";
import { FaTwitter, FaFacebookF, FaLinkedinIn, FaGithub } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { GoHeartFill } from "react-icons/go";

const Footer = () => {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  // Scroll to top handler for selected links
  const handleNavClick = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="">
      <footer className="relative bg-black text-white overflow-hidden ">
        {/* Complex Animated Wave Background */}
        <div className="absolute inset-0">
          {/* Wave Layer 1 */}
          <svg
            className="absolute bottom-0 w-full h-full opacity-20"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path fill="white" className="wave-animate-1">
              <animate
                attributeName="d"
                values="M0,60 C150,80 350,40 500,60 C650,80 850,40 1000,60 C1100,70 1150,70 1200,60 L1200,120 L0,120 Z;
                        M0,60 C150,100 350,20 500,80 C650,100 850,20 1000,40 C1100,50 1150,90 1200,60 L1200,120 L0,120 Z;
                        M0,60 C150,40 350,80 500,40 C650,60 850,80 1000,80 C1100,90 1150,50 1200,60 L1200,120 L0,120 Z;
                        M0,60 C150,80 350,40 500,60 C650,80 850,40 1000,60 C1100,70 1150,70 1200,60 L1200,120 L0,120 Z"
                dur="12s"
                repeatCount="indefinite"
              />
            </path>
          </svg>

          {/* Wave Layer 2 */}
          <svg
            className="absolute bottom-0 w-full h-full opacity-30"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path fill="white" className="wave-animate-2">
              <animate
                attributeName="d"
                values="M0,70 C200,90 400,50 600,70 C800,90 1000,50 1200,70 L1200,120 L0,120 Z;
                        M0,70 C200,110 400,30 600,90 C800,110 1000,30 1200,70 L1200,120 L0,120 Z;
                        M0,70 C200,50 400,90 600,50 C800,70 1000,90 1200,70 L1200,120 L0,120 Z;
                        M0,70 C200,90 400,50 600,70 C800,90 1000,50 1200,70 L1200,120 L0,120 Z"
                dur="8s"
                repeatCount="indefinite"
              />
            </path>
          </svg>

          {/* Wave Layer 3 */}
          <svg
            className="absolute bottom-0 w-full h-full opacity-40"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path fill="white" className="wave-animate-3">
              <animate
                attributeName="d"
                values="M0,50 C300,70 600,30 900,50 C1050,60 1150,40 1200,50 L1200,120 L0,120 Z;
                        M0,50 C300,30 600,70 900,30 C1050,20 1150,80 1200,50 L1200,120 L0,120 Z;
                        M0,50 C300,90 600,10 900,70 C1050,80 1150,20 1200,50 L1200,120 L0,120 Z;
                        M0,50 C300,70 600,30 900,50 C1050,60 1150,40 1200,50 L1200,120 L0,120 Z"
                dur="10s"
                repeatCount="indefinite"
              />
            </path>
          </svg>

          {/* Wave Layer 4 */}
          <svg
            className="absolute bottom-0 w-full h-full opacity-60"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path fill="white" className="wave-animate-4">
              <animate
                attributeName="d"
                values="M0,90 C400,70 800,110 1200,90 L1200,120 L0,120 Z;
                        M0,90 C400,110 800,70 1200,90 L1200,120 L0,120 Z;
                        M0,90 C400,50 800,130 1200,90 L1200,120 L0,120 Z;
                        M0,90 C400,70 800,110 1200,90 L1200,120 L0,120 Z"
                dur="6s"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        </div>

        {/* Floating particles - Top only */}
        <div className="absolute inset-x-0 top-0 h-1/3 overflow-hidden">
          <div className="floating-particle absolute top-5 left-8 w-2 h-2 bg-white rounded-full opacity-40"></div>
          <div
            className="floating-particle absolute top-10 right-12 w-1.5 h-1.5 bg-white rounded-full opacity-60"
            style={{ animationDelay: "1.2s" }}
          ></div>
          <div
            className="floating-particle absolute top-6 left-1/4 w-1 h-1 bg-white rounded-full opacity-30"
            style={{ animationDelay: "2.5s" }}
          ></div>
          <div
            className="floating-particle absolute top-12 right-1/3 w-2 h-2 bg-white rounded-full opacity-50"
            style={{ animationDelay: "0.8s" }}
          ></div>
          <div
            className="floating-particle absolute top-4 left-1/2 w-1.5 h-1.5 bg-white rounded-full opacity-40"
            style={{ animationDelay: "1.8s" }}
          ></div>
          <div
            className="floating-particle absolute top-8 left-3/4 w-2 h-2 bg-white rounded-full opacity-35"
            style={{ animationDelay: "3s" }}
          ></div>
          <div
            className="floating-particle absolute top-14 right-1/5 w-1 h-1 bg-white rounded-full opacity-45"
            style={{ animationDelay: "2.2s" }}
          ></div>
          <div
            className="floating-particle absolute top-20 left-1/5 w-1 h-1 bg-white rounded-full opacity-45"
            style={{ animationDelay: "2.2s" }}
          ></div>
          <div
            className="floating-particle absolute top-24 right-1/4 w-1.5 h-1.5 bg-white rounded-full opacity-50"
            style={{ animationDelay: "3.5s" }}
          ></div>
          <div
            className="floating-particle absolute top-28 left-2/3 w-2 h-2 bg-white rounded-full opacity-30"
            style={{ animationDelay: "4s" }}
          ></div>
        </div>

        {/* Footer Content */}
        <div className="relative z-20 px-8 py-20">
          {/* Logo */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-46 h-16 rounded-full mb-4 hover:scale-110 transition-transform duration-300">
              <img src="../rasul-1.png" alt="Icon" className="object-contain" />
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex justify-center space-x-6 mb-12">
            {[
              { to: "#", icon: <FaTwitter size={24} /> },
              { to: "#", icon: <FaFacebookF size={24} /> },
              { to: "#", icon: <FaLinkedinIn size={24} /> },
              { to: "#", icon: <FaGithub size={24} /> },
            ].map((item, index) => (
              <Link
                key={index}
                to={item.to}
                className="group relative bg-white text-black rounded-full p-4 transition-all duration-500 hover:scale-110 hover:rotate-12 backdrop-blur-sm hover:bg-black hover:text-white"
              >
                {item.icon}
                <div className="absolute inset-0 rounded-full bg-black scale-0 group-hover:scale-90 transition-transform duration-300 -z-10"></div>
              </Link>
            ))}
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap justify-center gap-8 text-lg ">
            {[
              { label: "Home", path: "/" },
              { label: "About", path: "/about" },
              { label: "Integrations", path: "/services/integrations" },
              { label: "FAQ", path: "/faq" },
              { label: "Contact", path: "/contact" },
              { label: "Terms&Conditions", path: "/terms-and-conditions", scrollTop: true },
              { label: "Refund Policy", path: "/refund-policy", scrollTop: true },
            ].map(({ label, path, scrollTop }) => (
              <button
                key={label}
                onClick={() =>
                  scrollTop ? handleNavClick(path) : navigate(path)
                }
                className="relative group font-medium hover:text-gray-300 transition-all duration-300 cursor-pointer"
              >
                {label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
              </button>
            ))}
          </nav>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mt-8"></div>

          {/* Copyright */}
          <div className="text-center text-black text-sm tracking-wide">
            ©2025 Bounce Cure | All Rights Reserved | Crafted with
            <GoHeartFill className="inline text-red-500 ml-1 text-lg" />
          </div>
        </div>

        {/* CSS for particles */}
        <style jsx>{`
          @keyframes floatParticles {
            0%,
            100% {
              transform: translateY(0px) rotate(0deg);
              opacity: 0.4;
            }
            25% {
              transform: translateY(-20px) rotate(90deg);
              opacity: 0.8;
            }
            50% {
              transform: translateY(-40px) rotate(180deg);
              opacity: 0.6;
            }
            75% {
              transform: translateY(-20px) rotate(270deg);
              opacity: 0.8;
            }
          }
          .floating-particle {
            animation: floatParticles 8s ease-in-out infinite;
          }
        `}</style>
      </footer>
    </div>
  );
};

export default Footer;
