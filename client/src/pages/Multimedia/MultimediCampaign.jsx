import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  Send,
  Settings,
  Image,
  Video,
  FileText,
  Plus,
  Eye,
  X,
} from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { useNavigate } from "react-router-dom";

function MultimediaCampaign() {
  const [activeTab, setActiveTab] = useState("whatsapp");
  const [campaigns, setCampaigns] = useState({ whatsapp: [], sms: [] });
  const [loading, setLoading] = useState(true);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const navigate = useNavigate();

  // 🧩 Fetch all campaigns for logged-in user
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/multimedia-campaign/history`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await res.json();
        setCampaigns({
          whatsapp: data.whatsappCampaigns || [],
          sms: data.smsCampaigns || [],
        });
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  // 📊 Analytics calculator
  const getAnalytics = (list) => {
    const total = list.length;
    const sent = list.filter((c) => c.status === "sent").length;
    const scheduled = list.filter((c) => c.status === "scheduled").length;
    const failed = list.filter((c) =>
      c.recipients.some((r) => r.status === "failed")
    ).length;

    return {
      total,
      sent,
      scheduled,
      failed,
      successRate: total ? Math.round((sent / total) * 100) : 0,
    };
  };

  const currentCampaigns = campaigns[activeTab];
  const stats = getAnalytics(currentCampaigns);

  const getMediaIcon = (type) => {
    switch (type) {
      case "image":
        return <Image className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // ✅ New Campaign Navigation Handler
  const handleNewCampaign = (type) => {
    setShowNewCampaignModal(false);
    navigate(type === "whatsapp" ? "/whatsapp" : "/sms");
  };

  // ✅ Modal for New Campaign
  const NewCampaignModal = () => (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#c2831f]">
            Create New Campaign
          </h2>
          <button
            onClick={() => setShowNewCampaignModal(false)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-400 mb-8">
          Choose the type of campaign you want to create
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => handleNewCampaign("whatsapp")}
            className="flex-1 p-6 bg-gray-800/40 hover:bg-gray-700/50 border border-gray-600/50 hover:border-[#25D366]/60 rounded-xl transition-all duration-300 flex flex-col items-center text-center group shadow-lg hover:shadow-xl hover:shadow-[#25D366]/10"
          >
            <MessageCircle className="w-8 h-8 text-[#25D366]" />
            <h3 className="text-lg font-semibold text-white mt-4">
              WhatsApp Campaign
            </h3>
          </button>

          <button
            onClick={() => handleNewCampaign("sms")}
            className="flex-1 p-6 bg-gray-800/40 hover:bg-gray-700/50 border border-gray-600/50 hover:border-[#007BFF]/60 rounded-xl transition-all duration-300 flex flex-col items-center text-center group shadow-lg hover:shadow-xl hover:shadow-[#007BFF]/10"
          >
            <Send className="w-8 h-8 text-[#007BFF]" />
            <h3 className="text-lg font-semibold text-white mt-4">
              SMS Campaign
            </h3>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black text-white mt-16 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#c2831f] mb-2">
              Multimedia Campaigns
            </h1>
            <p className="text-gray-400">
              Manage, analyze, and create WhatsApp & SMS marketing campaigns
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/twilio-setup")}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
            >
              <Settings className="w-5 h-5" />
              Twilio Settings
            </button>

            <button
              onClick={() => setShowNewCampaignModal(true)}
              className="px-6 py-3 bg-[#c2831f] hover:bg-[#a66f1a] text-white rounded-lg flex items-center gap-2 font-semibold"
            >
              <Plus className="w-5 h-5" />
              New Campaign
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg border border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`flex-1 px-6 py-3 rounded-md flex items-center justify-center gap-2 ${activeTab === "whatsapp"
                ? "bg-gray-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp Campaigns
          </button>
          <button
            onClick={() => setActiveTab("sms")}
            className={`flex-1 px-6 py-3 rounded-md flex items-center justify-center gap-2 ${activeTab === "sms"
                ? "bg-gray-600 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
          >
            <Send className="w-5 h-5" />
            SMS Campaigns
          </button>
        </div>

        {/* Analytics Section */}
        {loading ? (
          <p className="text-gray-400">Loading analytics...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 text-center">
              <div className="text-2xl font-bold text-[#c2831f]">
                {stats.total}
              </div>
              <div className="text-sm text-gray-400">Total Campaigns</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 text-center">
              <div className="text-2xl font-bold text-green-400">
                {stats.sent}
              </div>
              <div className="text-sm text-gray-400">Sent</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {stats.scheduled}
              </div>
              <div className="text-sm text-gray-400">Scheduled</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 text-center">
              <div className="text-2xl font-bold text-red-400">
                {stats.failed}
              </div>
              <div className="text-sm text-gray-400">Failed</div>
            </div>
          </div>
        )}

        {/* Campaign History Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-[#c2831f]">
            {activeTab === "whatsapp" ? "WhatsApp" : "SMS"} Campaign History
          </h2>

          {currentCampaigns.length === 0 ? (
            <p className="text-gray-500">No campaigns found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400">
                    <th className="py-2 px-4">Name</th>
                    <th className="py-2 px-4">Message</th>
                    <th className="py-2 px-4">Recipients</th>
                    <th className="py-2 px-4">Status</th>
                    <th className="py-2 px-4">Created At</th>
                    <th className="py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCampaigns.map((c) => (
                    <tr key={c.id} className="border-b border-gray-800">
                      <td className="py-2 px-4">{c.name}</td>
                      <td className="py-2 px-4 truncate max-w-xs">
                        {c.message}
                      </td>
                      <td className="py-2 px-4">{c.recipients.length}</td>
                      <td
                        className={`py-2 px-4 font-semibold ${c.status === "sent"
                            ? "text-green-400"
                            : c.status === "scheduled"
                              ? "text-blue-400"
                              : "text-red-400"
                          }`}
                      >
                        {c.status}
                      </td>
                      <td className="py-2 px-4">
                        {new Date(c.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 px-4">
                        <button
                          onClick={() =>
                            alert(JSON.stringify(c.recipients, null, 2))
                          }
                          className="text-[#c2831f] hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" /> View Recipients
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showNewCampaignModal && <NewCampaignModal />}
      </div>
    </DashboardLayout>
  );
}

export default MultimediaCampaign;
