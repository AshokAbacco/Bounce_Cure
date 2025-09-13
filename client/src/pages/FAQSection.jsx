import React, { useState } from "react";
import PageLayout from "../components/PageLayout";

const faqs = [
  {
    question: "What is Bounce Cure?",
    answer:
      "Bounce Cure is an all-in-one multi-channel campaign and validation platform. It helps businesses run Email, SMS, WhatsApp, Facebook, Instagram, and YouTube campaigns while ensuring email and phone number validation for maximum deliverability.",
  },
  {
    question: "What makes Bounce Cure different from other tools?",
    answer: (
      <ul className="list-[circle] list-inside space-y-1 marker:text-[#c2831f]">
        <li>Multi-media campaigns (Email + Social + SMS + WhatsApp)</li>
        <li>Built-in email & phone validation</li>
        <li>Integration with APIs (e.g., SendGrid, Twilio, WhatsApp Business, Meta APIs)</li>
        <li>Analytics dashboard to track performance & engagement</li>
      </ul>
    ),
  },
  {
    question: "Does Bounce Cure validate email addresses?",
    answer: (
      <ul className="list-[circle] list-inside space-y-1 marker:text-[#c2831f]">
        <li>Syntax check (valid email format)</li>
        <li>Domain & MX record verification</li>
        <li>Disposable/temporary email detection</li>
        <li>Role-based email detection (info@, sales@, etc.)</li>
        <li>Risk scoring (spam traps, blacklists, etc.)</li>
      </ul>
    ),
  },
  {
    question: "Can I validate phone numbers?",
    answer: (
      <ul className="list-[circle] list-inside space-y-1 marker:text-[#c2831f]">
        <li>Whether the number is active</li>
        <li>Whether it’s mobile or landline</li>
        <li>Carrier & country code</li>
      </ul>
    ),
  },
  {
    question: "What campaigns can I run with Bounce Cure?",
    answer: (
      <ul className="list-[circle] list-inside space-y-1 marker:text-[#c2831f]">
        <li>Email marketing campaigns</li>
        <li>SMS campaigns</li>
        <li>WhatsApp campaigns</li>
        <li>Facebook & Instagram ads</li>
        <li>YouTube ads & video promotions</li>
      </ul>
    ),
  },
  {
    question: "Is Bounce Cure GDPR/CCPA compliant?",
    answer:
      "Yes. Bounce Cure follows global data protection regulations. We only provide and validate contacts that are compliant with opt-in and consent-based marketing rules.",
  },
  {
    question: "Do I need technical knowledge to use Bounce Cure?",
    answer:
      "No. Bounce Cure is designed with a user-friendly dashboard. Campaigns can be launched in a few clicks. For advanced users, API integrations are available.",
  },
  {
    question: "What format will my validated data/list be in?",
    answer:
      "All validated contacts can be downloaded in Excel/CSV format or integrated directly into your CRM/Email Service Provider.",
  },
  {
    question: "Does Bounce Cure integrate with my existing tools?",
    answer: (
      <ul className="list-[circle] list-inside space-y-1 marker:text-[#c2831f]">
        <li>Email APIs (SendGrid, Amazon SES, SMTP, etc.)</li>
        <li>CRMs (HubSpot, Salesforce, Zoho, etc.)</li>
        <li>SMS/WhatsApp APIs (Twilio, WhatsApp Business API, etc.)</li>
      </ul>
    ),
  },
  {
    question: "What pricing plans do you offer?",
    answer: (
      <ul className="list-[circle] list-inside space-y-1 marker:text-[#c2831f]">
        <li>Pay-as-you-go validation (per email/phone validation)</li>
        <li>Monthly subscription for campaigns + validations</li>
        <li>Enterprise plans for bulk campaigns & advanced API usage</li>
      </ul>
    ),
  },
  {
    question: "What is your refund policy?",
    answer:
      "If you face delivery issues due to system error or failed validation, we offer a refund or replacement credits as per our Refund Policy.",
  },
  {
    question: "How do I get started?",
    answer: (
      <ul className="list-[circle] list-inside space-y-1 marker:text-[#c2831f]">
        <li>Sign up on our website.</li>
        <li>Get 500 free verified contacts on new signup.</li>
        <li>Start validating & launching your campaigns instantly.</li>
      </ul>
    ),
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <PageLayout>
      <div className="text-white min-h-screen py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-[#c2831f] mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between cursor-pointer items-center p-5 text-left text-lg font-semibold hover:bg-gray-700 transition-colors duration-200"
                >
                  <span>{faq.question}</span>
                  <span className="text-[#c2831f] text-2xl font-bold">
                    {openIndex === index ? "−" : "+"}
                  </span>
                </button>

                {openIndex === index && (
                  <div className="px-5 pb-5 text-gray-300 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
