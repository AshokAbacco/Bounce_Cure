// src/components/multimediaCampaign/SchedulePicker.jsx
import React from "react";

export default function SchedulePicker({ value, onChange }) {
    return (
        <div>
            <label className="font-medium">Schedule (optional)</label>
            <input
                type="datetime-local"
                className="mt-2 p-2 border rounded-lg w-full"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
