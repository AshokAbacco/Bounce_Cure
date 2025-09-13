import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FreeValidation from './pages/FreeValidation';
import IntegrationPage from './pages/IntegrationPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ForgotPassword from './pages/ForgotPasswordPage';
import Pricing from './pages/Pricing';
import Contact from './components/Contact';
import About from './pages/About';
import Features from './pages/Features';
import BulkVerification from './pages/BulkVerification';
import Chatbot from './pages/ChatBot';
import Dashboard from './pages/Dashboard/Dashboard';
import FaqSection from './pages/FAQSection';
import Settings from './pages/Settings/Settings';
import Contacts from './pages/ContactManagement/ConatctManagement';
import Campaign from './pages/Campaign/Campaign';
import Automation from './pages/Automation/Automation';
import UserAuthentication from './pages/UserAuthentication/UserAuthentication';
import Verification from './pages/Verification/Verification';
import Analytics from './pages/Analytics/Analytics';
import Support from './pages/Support/Support';
import PricingDash from './pages/Pricing/PricingDash';
import PaymentPage from './pages/Pricing/PaymentPage';
import { UserProvider } from "./components/UserContext";
import NewCampaignWindow from './pages/Campaign/Components/NewCampaignWindow';
import CreateCampaign from './pages/Campaign/pages/CreateCampaign';
import EditorPage from './pages/Campaign/pages/EditorPage';
import PhoneValidation from './pages/PhoneValidation/PhoneValidation';
import { Toaster } from 'react-hot-toast';
import { NotificationProvider } from "./components/NotificationContext"; 
import ContactsPage from'./pages/ContactManagement/pages/ContactsPage';
import Leads from './pages/ContactManagement/pages/Leads';
import Deals from './pages/ContactManagement/pages/Deals';
import Tasks from './pages/ContactManagement/pages/Tasks';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmail from "./pages/VerifyEmail";
import Templets from './pages/Campaign/pages/Templets';
import CanvasArea from './pages/Campaign/Components/Editor/CanvasArea';
import { useNavigate } from "react-router-dom";
import SendCampaign from './pages/Campaign/pages/SendCampaign';
import AllTemplates from './pages/Campaign/pages/AllTemplats';
import WatsupCampaign from './pages/WatsupCampaign';
import SMSCampaign from './pages/SMSCampaign';


import MultimediaCampaign from './pages/Multimedia/MultimediCampaign';
import WhatsappCampaign from './pages/Multimedia/WhatsappCampaign';
import SMScampaign from './pages/Multimedia/SMScampaign';
import TermsConditions from './pages/Terms&conditions';
import RefundPolicy from './pages/RefundPolicy';


function App() {
  return (
    <UserProvider>
      <NotificationProvider>
        <Router>
          <Toaster
            position="top-right"
            containerStyle={{
              zIndex: 999999,
              marginTop: "70px",
            }}
            toastOptions={{
              duration: 3500,
              style: {
                background: 'rgba(15, 23, 42, 0.85)',
                fontSize: "16px",
                fontWeight: "600",
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px'
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#0f172a' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#0f172a' } },
            }}
          />

          <Routes>
            <Route path="/services/email-verification" element={<FreeValidation />} />
            <Route path="/services/integrations" element={<IntegrationPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/services/bulk-verification" element={<BulkVerification />} />
            <Route path="/faq" element={<FaqSection />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/email-campaign" element={<Campaign />} />
            <Route path="/automation" element={<Automation />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/auth" element={<UserAuthentication />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/support" element={<Support />} />
            <Route path='/phoneValidation' element={<PhoneValidation/>}/>
            <Route path='/pricingdash' element={<PricingDash />} />
            <Route path='/new-campaign' element={<NewCampaignWindow />} />
            <Route path="/create" element={<CreateCampaign />} />
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/contactsPage" element={<ContactsPage />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/templetes" element={<Templets />} />
            <Route path="/canva" element={<CanvasArea />} />
            <Route path="/send-campaign" element={<SendCampaign />} />
            <Route path="/all-templates" element={<AllTemplates />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/WatsupCampaign" element={<WatsupCampaign />} />
            <Route path="/smscampaign" element={<SMSCampaign />} />
            <Route path="/terms-and-conditions" element={<TermsConditions />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />

            <Route path="/MultimediaCampaign" element={<MultimediaCampaign />} />
            <Route path="/whatsapp" element={<WhatsappCampaign />} />
            <Route path="/sms" element={<SMScampaign />} />

          </Routes>


          <Chatbot />
        </Router>
      </NotificationProvider>
    </UserProvider>
  );
}

export default App;