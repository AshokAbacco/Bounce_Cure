import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import PageLayout from "../components/PageLayout"; // Adjust path as needed

const RefundPolicy = () => {
    return (
        <PageLayout>
            <div className="relative bg-black text-left font-light text-sm py-8 px-10 min-h-screen max-w-[80vw] m-auto">
                {/* Watermark */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-[120px] font-bold opacity-5 select-none pointer-events-none whitespace-nowrap">
                    REFUND POLICY
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center mb-8">
                    <p className="flex items-center gap-2 font-semibold text-4xl text-white">
                        <FaExclamationTriangle className="text-yellow-400" /> Refund Policy
                    </p>
                </div>

                <div className="relative z-10 text-gray-300 text-lg space-y-6">
                    <p className="text-[#c2831f] font-bold">Effective Date: Sep-1-2025</p>
                    <p className="font-bold">
                        At Bounce Cure, we aim to ensure customer satisfaction while maintaining fairness.
                    </p>

                    {/* Sections */}
                    <div>
                        <h4 className="font-semibold text-[#c2831f]">1. Subscription Fees</h4>
                        <ul className="list-[circle] list-inside ml-5 mt-2 marker:text-[#c2831f]">
                            <li>Subscription fees are non-refundable once payment is processed, except where legally required.</li>
                            <li>If you cancel before your renewal date, you will not be charged for the next billing cycle.</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-[#c2831f]">2. Refund Eligibility</h4>
                        <p>Refunds may only be issued under the following circumstances:</p>
                        <ul className="list-[circle] list-inside ml-5 mt-2 marker:text-[#c2831f]">
                            <li>Duplicate payment made by mistake.</li>
                            <li>Technical failure on Bounce Cure’s platform that prevents you from using core services (validated by our support team).</li>
                            <li>Refund requests must be submitted within 7 business days of the transaction.</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-[#c2831f]">3. Non-Refundable Items</h4>
                        <ul className="list-[circle] list-inside ml-5 mt-2 marker:text-[#c2831f]">
                            <li>Setup fees, onboarding services, or customization costs.</li>
                            <li>Campaign credits already used (emails, SMS, WhatsApp, ads).</li>
                            <li>Trial or promotional plans.</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-[#c2831f]">4. How to Request a Refund</h4>
                        <ul className="list-[circle] list-inside ml-5 mt-2 marker:text-[#c2831f]">
                            <li>Email support at support@bouncecure.com.</li>
                            <li>Provide transaction ID, payment method, and reason.</li>
                            <li>Approved refunds will be processed within 7–14 business days to the original payment method.</li>
                        </ul>
                    </div>

                    {/* Quick Summary */}
                    <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                        <h4 className="font-semibold text-[#c2831f] mb-2">Key Reminders:</h4>
                        <ul className="list-[circle] list-inside ml-5 space-y-1 marker:text-[#c2831f]">
                            <li>All subscription fees are non-refundable</li>
                            <li>Refund requests must be made within 7 days</li>
                            <li>Technical issues must be verified by support</li>
                            <li>Used credits cannot be refunded</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 text-center relative z-10">
                    <p className="italic font-bold text-white text-2xl">
                        For questions regarding refunds, compliance, or data handling, contact our support team.
                    </p>
                </div>
            </div>
        </PageLayout>
    );
};

export default RefundPolicy;
