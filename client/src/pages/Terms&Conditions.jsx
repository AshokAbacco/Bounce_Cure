import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import PageLayout from "../components/PageLayout"; // Adjust path as needed

const TermsConditions = () => {
  return (
    <PageLayout>
      <div className="relative bg-black text-middle font-light text-sm py-8 px-10 leading-relaxed min-h-screen max-w-[80vw] m-auto">
        {/* Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-[120px] font-bold opacity-5 select-none pointer-events-none whitespace-nowrap">
          TERMS & CONDITIONS
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center mb-8">
          <p className="flex items-center gap-2 font-semibold text-4xl text-white">
            <FaExclamationTriangle className="text-yellow-400" /> Terms & Conditions
          </p>
        </div>

        <div className="relative z-10 text-gray-300 space-y-6 text-lg">
          <p className="font-bold text-[#c2831f]">Effective Date: [Insert Date]</p>
          <p className="font-bold">
            Welcome to Bounce Cure (“we,” “our,” “us”). By accessing or using our platform, you agree to comply with and be bound by these Terms & Conditions (“Terms”). Please read them carefully.
          </p>

          {/* Sections */}
          <div>
            <h4 className="font-semibold text-[#c2831f]">1. Service Overview</h4>
            <ul className="list-[circle] list-inside ml-5 mt-2 marker:text-[#c2831f]">
              <li>Email campaign services</li>
              <li>WhatsApp, SMS, and social media campaign tools (Facebook, Instagram, YouTube, etc.)</li>
              <li>Email and phone number validation services</li>
              <li>Reporting and analytics</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#c2831f]">2. User Responsibilities</h4>
            <ul className="list-[circle] list-inside ml-5 mt-2 marker:text-[#c2831f]">
              <li>You agree to use Bounce Cure only for lawful purposes and in compliance with applicable laws (including GDPR, CAN-SPAM, and other data protection regulations).</li>
              <li>You are responsible for the content you upload, send, or distribute through the platform.</li>
              <li>You must not use Bounce Cure for spam, harassment, fraudulent activity, or distribution of prohibited content.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#c2831f]">3. Account & Access</h4>
            <ul className="list-[circle] list-inside ml-5 mt-2 marker:text-[#c2831f]">
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>Bounce Cure reserves the right to suspend or terminate accounts found violating these Terms.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#c2831f]">4. Payments & Subscription</h4>
            <ul className="list-[circle] list-inside ml-5 mt-2 marker:text-[#c2831f]">
              <li>All fees are billed as per the selected plan and are non-refundable except as outlined in our Refund Policy.</li>
              <li>Bounce Cure may update its pricing with prior notice.</li>
              <li>Subscriptions renew automatically unless canceled before the renewal date.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#c2831f]">5. Data & Privacy</h4>
            <ul className="list-[circle] list-inside ml-5 mt-2 marker:text-[#c2831f]">
              <li>We do not sell your data.</li>
              <li>You retain ownership of your campaign data, but you grant us a limited license to process and transmit it for providing services.</li>
              <li>Our services rely on third-party integrations (e.g., SendGrid, API providers). We are not responsible for their outages or errors.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#c2831f]">6. Limitations of Liability</h4>
            <ul className="list-[circle] list-inside ml-5 mt-2 marker:text-[#c2831f]">
              <li>Bounce Cure is provided “as is” without warranties of any kind.</li>
              <li>We are not liable for indirect, incidental, or consequential damages resulting from service use.</li>
              <li>Campaign deliverability, open rates, and ad performance are influenced by many factors outside our control.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#c2831f]">7. Termination</h4>
            <ul className="list-[circle] list-inside ml-5 mt-2 marker:text-[#c2831f]">
              <li>You may cancel your account at any time.</li>
              <li>We may suspend or terminate your access if you breach these Terms.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#c2831f]">8. Governing Law</h4>
            <p className="mt-1 ">These Terms are governed by the laws of [US & India Jurisdiction].</p>
          </div>

          <div className="mt-8 text-center relative z-10">
            <p className="italic font-bold text-white text-2xl">
              For questions regarding refunds, compliance, or data handling, contact our support team.
            </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default TermsConditions;
