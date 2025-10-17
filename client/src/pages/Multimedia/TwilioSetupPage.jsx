import React, { useState, useEffect } from "react";

export default function TwilioSetupPage() {
    const [form, setForm] = useState({
        accountSid: "",
        authToken: "",
        whatsappNumber: "",
        smsNumber: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/twilio/config`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                const data = await res.json();
                if (data?.accountSid) setForm(data);
            } catch (err) {
                console.error("Failed to fetch config:", err);
            }
        };
        fetchConfig();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/twilio/setup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) setMessage("✅ Twilio configuration saved successfully!");
            else setMessage(`❌ Error: ${data.error}`);
        } catch (err) {
            console.error("Setup error:", err);
            setMessage("⚠️ Failed to save configuration.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Twilio Setup</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {["accountSid", "authToken", "whatsappNumber", "smsNumber"].map((field) => (
                    <div key={field}>
                        <label className="block font-medium text-gray-700 capitalize">{field}</label>
                        <input
                            type="text"
                            name={field}
                            value={form[field] || ""}
                            onChange={handleChange}
                            className="w-full mt-1 p-2 border rounded-md"
                            placeholder={`Enter your ${field}`}
                        />
                    </div>
                ))}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 mt-4 rounded-md text-white font-semibold ${loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                >
                    {loading ? "Saving..." : "Save Configuration"}
                </button>
            </form>

            {message && <p className="mt-4 text-center font-medium">{message}</p>}
        </div>
    );
}
