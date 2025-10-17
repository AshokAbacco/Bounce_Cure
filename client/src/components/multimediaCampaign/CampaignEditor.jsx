//src/components/multimediaCampaign/CampaignEditor.jsx
import React, { useState } from "react";
import RecipientInput from "./RecipientInput";
import MessageComposer from "./MessageComposer";
import MediaUploader from "./MediaUploader";
import SchedulePicker from "./SchedulePicker";
import CampaignPreview from "./CampaignPreview";

export default function CampaignEditor({ channel = "sms" }) {
    const [recipients, setRecipients] = useState([]);
    const [message, setMessage] = useState("");
    const [mediaUrl, setMediaUrl] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSend = async () => {
        setIsSending(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/multimedia-campaign/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    channel,
                    recipients,
                    message,
                    mediaUrl,
                    schedule, // ✅ make sure this is included
                }),
            });

            const data = await res.json();
            console.log("Response:", data);

            if (res.ok) {
                setSuccess(true);
            } else {
                setError(data.error || "Failed to send campaign");
            }
        } catch (err) {
            console.error("Error:", err);
            setError(err.message || "Request failed");
        } finally {
            setIsSending(false);
        }
    };


    return (
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6 space-y-6">
            <h2 className="text-2xl font-bold capitalize">{channel} Campaign</h2>

            <RecipientInput recipients={recipients} onChange={setRecipients} />

            <MessageComposer
                channel={channel}
                message={message}
                onChange={setMessage}
            />

            {channel !== "sms" && (
                <MediaUploader mediaUrl={mediaUrl} onChange={setMediaUrl} />
            )}

            <SchedulePicker value={schedule} onChange={setSchedule} />

            <CampaignPreview
                recipients={recipients}
                message={message}
                mediaUrl={mediaUrl}
                onSend={handleSend}
                isSending={isSending}
                error={error}
                success={success}
            />
        </div>
    );
}
