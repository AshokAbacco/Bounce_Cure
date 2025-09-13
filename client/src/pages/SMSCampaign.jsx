import React, { useRef } from "react";
import {
  FaInstagram,
  FaWhatsapp,
  FaFacebook,
  FaLinkedin,
  FaYoutube,
  FaSms,
  FaGoogle,
} from "react-icons/fa";
import { RiTwitterXFill } from "react-icons/ri";
import PageLayout from "../components/PageLayout";

const SmsCampaign = () => {
  const socialMediaCampaigns = [
    {
      id: 1,
      name: "Instagram Campaign",
      icon: <FaInstagram className="text-3xl text-pink-500" />,
      description:
        "Leverage visual storytelling to engage your audience with stunning Instagram content that drives brand awareness and conversions.",
      status: "coming-soon",
    },
    {
      id: 2,
      name: "Twitter Campaign",
      icon: <RiTwitterXFill className="text-3xl text-white" />,
      description:
        "Engage in real-time conversations and build brand awareness with strategic Twitter marketing campaigns.",
      status: "coming-soon",
    },
    {
      id: 3,
      name: "WhatsApp Campaign",
      icon: <FaWhatsapp className="text-3xl text-green-500" />,
      description:
        "Connect directly with customers through personalized WhatsApp marketing campaigns.",
      status: "active",
    },
    {
      id: 4,
      name: "Facebook Campaign",
      icon: <FaFacebook className="text-3xl text-blue-600" />,
      description:
        "Reach your target audience with targeted Facebook advertising campaigns that drive engagement and conversions.",
      status: "coming-soon",
    },
    {
      id: 5,
      name: "LinkedIn Campaign",
      icon: <FaLinkedin className="text-3xl text-blue-700" />,
      description:
        "Build professional connections and generate B2B leads with strategic LinkedIn marketing campaigns.",
      status: "coming-soon",
    },
    {
      id: 6,
      name: "YouTube Ads",
      icon: <FaYoutube className="text-3xl text-red-600" />,
      description:
        "Capture attention with video advertising on the world's largest video platform.",
      status: "coming-soon",
    },
    {
      id: 7,
      name: "SMS Campaign",
      icon: <FaSms className="text-3xl text-blue-500" />,
      description:
        "Reach customers instantly with targeted SMS marketing campaigns.",
      status: "active",
    },
    {
      id: 8,
      name: "Google Ads",
      icon: <FaGoogle className="text-3xl text-blue-500" />,
      description:
        "Appear at the top of search results with strategic Google advertising campaigns.",
      status: "coming-soon",
    },
  ];

  const marqueeRef = useRef(null);

  return (
    <PageLayout>
      <div className="min-h-screen bg-black text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#c2831f] to-yellow-500 bg-clip-text text-transparent animate-pop-disappear">
              Multi Media Campaigns
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Connect with your audience directly through our WhatsApp marketing
              campaigns. Personalized messages that drive engagement and conversions.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-[#c2831f] to-yellow-500 mx-auto"></div>
          </div>

          {/* Campaigns Marquee */}
          <div className="mb-16 relative overflow-hidden">
            <div
              ref={marqueeRef}
              className="flex w-max"
              style={{
                animation: "marquee 30s linear infinite",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.animationPlayState = "paused")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.animationPlayState = "running")
              }
            >
              {[...socialMediaCampaigns, ...socialMediaCampaigns].map(
                (campaign, index) => (
                  <div
                    key={index}
                    className="bg-black border border-[#c2831f] rounded-xl p-6 w-72 flex-shrink-0 mr-6"
                  >
                    <div className="flex items-center mb-4">
                      <div className="mr-3">{campaign.icon}</div>
                      <h3 className="text-lg font-bold text-white">
                        {campaign.name}
                      </h3>
                    </div>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {campaign.description}
                    </p>
                    {campaign.status === "active" ? (
                      <span className="inline-block bg-green-700 text-white text-xs font-bold px-2 py-1 rounded-full">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-block bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-full">
                        COMING SOON
                      </span>
                    )}
                  </div>
                )
              )}
            </div>

            <style>
              {`
                @keyframes marquee {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }

                /* Pop up, disappear, repeat */
                @keyframes popDisappear {
                  0% { transform: scale(0.5); opacity: 0; }
                  20% { transform: scale(1.2); opacity: 1; }
                  50% { transform: scale(1); opacity: 0; }
                  100% { transform: scale(0.5); opacity: 0; }
                }

                .animate-pop-disappear {
                  animation: popDisappear 3s ease-in-out infinite;
                }
              `}
            </style>
          </div>

          {/* Call to Action */}
          <div className="text-center py-12 px-6 bg-gradient-to-r from-[#c2831f]/20 to-yellow-500/20 rounded-2xl border border-[#c2831f]/30">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Boost Your WhatsApp Campaign?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Let our experts create a customized WhatsApp campaign that drives
              real results for your business.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-[#c2831f] hover:bg-[#a66a1a] text-white font-bold py-3 px-8 rounded-lg transition-colors">
                Get Started
              </button>
              <button className="bg-transparent border-2 border-[#c2831f] text-[#c2831f] hover:bg-[#c2831f]/10 font-bold py-3 px-8 rounded-lg transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SmsCampaign;
