import React, { useState, useRef, useEffect } from 'react';
import { Check, Mail, Users, TrendingUp, Star, ArrowRight, Zap, Gift } from 'lucide-react';
import PageLayout from "../components/PageLayout";
import { useNavigate } from "react-router-dom";

const CircularSlider = ({ min, max, value, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());
  const sliderRef = useRef(null);
  
  useEffect(() => {
    setTempValue(value.toString());
  }, [value]);
  
  const getAngleFromCenter = (event) => {
    if (!sliderRef.current) return 0;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = event.clientX - centerX;
    const y = event.clientY - centerY;
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    angle = (angle + 90 + 360) % 360;
    return angle;
  };
  
  const angleToValue = (angle) => {
    angle = Math.max(0, Math.min(360, angle));
    const percent = angle / 360;
    let newValue = Math.round(min + percent * (max - min));
    return Math.min(newValue, max);
  };
  
  const valueToAngle = (value) => {
    const percent = (value - min) / (max - min);
    return percent * 360;
  };
  
  const handleMouseDown = (e) => {
    setIsDragging(true);
    updateValue(e);
  };
  
  const handleMouseMove = (e) => {
    if (isDragging) {
      updateValue(e);
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const updateValue = (e) => {
    const angle = getAngleFromCenter(e);
    const newValue = angleToValue(angle);
    onChange(newValue);
  };
  
  const handleInputChange = (e) => {
    setTempValue(e.target.value);
  };
  
  const handleBlur = () => {
    setIsEditing(false);
    const newValue = parseInt(tempValue) || min;
    const clampedValue = Math.min(Math.max(newValue, min), max);
    onChange(clampedValue);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);
  
  const currentAngle = valueToAngle(value);
  const radius = 80;
  const thumbX = radius * Math.cos((currentAngle - 90) * (Math.PI / 180));
  const thumbY = radius * Math.sin((currentAngle - 90) * (Math.PI / 180));
  
  return (
    <div 
      ref={sliderRef}
      className="relative w-48 h-48 mx-auto cursor-pointer"
      onMouseDown={handleMouseDown}
    >
      <svg width="100%" height="100%" viewBox="-100 -100 200 200">
        <circle
          cx="0"
          cy="0"
          r="80"
          fill="none"
          stroke="#c2831f"
          strokeWidth="10"
          strokeOpacity="0.2"
        />
        <circle
          cx="0"
          cy="0"
          r="80"
          fill="none"
          stroke="#c2831f"
          strokeWidth="10"
          strokeDasharray={`${(currentAngle / 360) * 502.4} 502.4`}
          transform="rotate(-90)"
        />
        <circle
          cx={thumbX}
          cy={thumbY}
          r="15"
          fill="#c2831f"
          stroke="white"
          strokeWidth="2"
        />
        <text
          x="0"
          y="-90"
          textAnchor="middle"
          fill="#c2831f"
          fontSize="12"
          fontWeight="bold"
        >
          {max}
        </text>
        <text
          x="0"
          y="90"
          textAnchor="middle"
          fill="#c2831f"
          fontSize="12"
          fontWeight="bold"
        >
          {min}
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {isEditing ? (
          <input
            type="number"
            value={tempValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
            className="text-4xl font-bold bg-transparent border-none outline-none text-center w-full text-white"
            autoFocus
            min={min}
            max={max}
          />
        ) : (
          <div 
            className="text-4xl font-bold cursor-pointer text-white"
            onClick={() => setIsEditing(true)}
          >
            {value}
          </div>
        )}
      </div>
      <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-gray-400">
        Click number to edit
      </div>
    </div>
  );
};

const Pricing = () => {
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [slots, setSlots] = useState(100);
  const [selectedIntegrations, setSelectedIntegrations] = useState([]);
  const navigate = useNavigate();
  
  // Base pricing for all plans including Enterprise
  const basePricing = {
    monthly: { 
      free: 0,
      proPlan: 32.5, 
      growthPlan: 140.8,
      enterprise: 299.99
    },
    quarterly: { 
      free: 0,
      proPlan: 29.25, 
      growthPlan: 126.72,
      enterprise: 269.99  // 10% discount for quarterly
    },
    annually: { 
      free: 0,
      proPlan: 26.00, 
      growthPlan: 112.64,
      enterprise: 239.99  // 20% discount for annual
    }
  };
  
  const integrations = [
    { id: 'salesforce', name: 'Salesforce', price: 15 },
    { id: 'hubspot', name: 'HubSpot', price: 12 },
    { id: 'pipedrive', name: 'Pipedrive', price: 10 },
    { id: 'zapier', name: 'Zapier', price: 8 },
    { id: 'slack', name: 'Slack', price: 5 },
    { id: 'gmail', name: 'Gmail', price: 7 }
  ];
  
  const calculateSlotPrice = (basePrice, slotCount) => {
    const additionalSlots = Math.max(0, slotCount - 50);
    const slotPrice = billingPeriod === 'monthly' ? 0.5 : billingPeriod === 'quarterly' ? 0.45 : 0.4;
    return basePrice + (additionalSlots * slotPrice);
  };
  
  const integrationCosts = selectedIntegrations.reduce((total, integrationId) => {
    const integration = integrations.find(i => i.id === integrationId);
    const multiplier = billingPeriod === 'monthly' ? 1 : billingPeriod === 'quarterly' ? 3 : 12;
    return total + (integration ? integration.price * multiplier : 0);
  }, 0);
  
  const toggleIntegration = (integrationId) => {
    setSelectedIntegrations(prev => 
      prev.includes(integrationId) ? prev.filter(id => id !== integrationId) : [...prev, integrationId]
    );
  };
  
  const currentPricing = basePricing[billingPeriod];
  const freePrice = currentPricing.free + integrationCosts;
  const proPrice = calculateSlotPrice(currentPricing.proPlan, slots) + integrationCosts;
  const growthPrice = calculateSlotPrice(currentPricing.growthPlan, slots) + integrationCosts;
  // Enterprise price includes base price + integration costs
  const enterprisePrice = currentPricing.enterprise + integrationCosts;
  
  const formatPeriod = () => {
    switch (billingPeriod) {
      case 'monthly': return 'month';
      case 'quarterly': return 'quarter';
      case 'annually': return 'year';
      default: return 'month';
    }
  };
  
  // Function to handle navigation to payment or login based on plan
  const handlePlanSelection = (planName, planPrice) => {
    // For Free plan, navigate directly to login (no payment needed)
    if (planName === "Free Plan") {
      navigate("/login", {
        state: {
          planName,
          planPrice,
          billingPeriod: formatPeriod(),
        },
      });
    } else {
      // For paid plans, navigate to payment page
      navigate("/payment", {
        state: {
          planName,
          planPrice,
          billingPeriod: formatPeriod(),
        },
      });
    }
  };
  
  return (
    <PageLayout>
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4" style={{ color: '#c2831f' }}>Pricing Calculator</h1>
            <p className="text-xl text-gray-300">Calculate pricing based on your needs</p>
          </div>
          
          {/* Billing Toggle */}
          <div className="flex justify-center mb-8 ">
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-1 border border-[#c2831f]/30 ">
              {['monthly', 'quarterly', 'annually'].map((period) => (
                <button
                  key={period}
                  onClick={() => setBillingPeriod(period)}
                  className={`px-6 py-3 rounded-lg font-medium ${billingPeriod === period 
                    ? 'bg-[#c2831f] text-white' 
                    : 'text-gray-300 hover:text-white '}`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                  {period === 'annually' && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">Save 20%</span>}
                </button>
              ))}
            </div>
          </div>
          
          {/* Customization Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Slots Selector */}
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-[#c2831f]/30">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-[#c2831f]/20 rounded-xl mr-4">
                  <Users className="w-6 h-6 text-[#c2831f]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Account Slots</h3>
                  <p className="text-gray-400 text-sm">Drag to adjust or click number to edit</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center">
                <CircularSlider 
                  min={50} 
                  max={5000} 
                  value={slots} 
                  onChange={setSlots} 
                />
                <div className="mt-6 flex items-center justify-center gap-4">
                  <button 
                    onClick={() => setSlots(prev => Math.max(50, prev - 10))}
                    className="px-4 py-2 bg-[#c2831f]/20 rounded-lg hover:bg-[#c2831f]/30 cursor-pointer"
                  >
                    -10
                  </button>
                  <button 
                    onClick={() => setSlots(prev => Math.min(5000, prev + 10))}
                    className="px-4 py-2 bg-[#c2831f]/20 rounded-lg hover:bg-[#c2831f]/30 cursor-pointer"
                  >
                    +10
                  </button>
                </div>
                <p className="text-gray-400 text-sm mt-4">First 50 slots included</p>
              </div>
            </div>
            
            {/* Integrations */}
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-[#c2831f]/30">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-[#c2831f]/20 rounded-xl mr-4">
                  <Zap className="w-6 h-6 text-[#c2831f]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Integrations</h3>
                  <p className="text-gray-400 text-sm">Connect with your favorite tools</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {integrations.map((integration) => (
                  <button
                    key={integration.id}
                    onClick={() => toggleIntegration(integration.id)}
                    className={`p-4 rounded-xl border flex flex-col items-center ${selectedIntegrations.includes(integration.id)
                      ? 'border-[#c2831f] bg-[#c2831f]/10'
                      : 'border-gray-700 hover:border-[#c2831f]/50'}`}
                  >
                    <div className="text-sm font-medium">{integration.name}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      ${integration.price}/{formatPeriod() === 'month' ? 'mo' : formatPeriod() === 'quarter' ? 'qtr' : 'yr'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Free Plan */}
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl border border-[#c2831f]/30 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Gift className="w-8 h-8 text-[#c2831f] mr-3" />
                  <h3 className="text-xl font-bold">Free Plan</h3>
                  <span className="ml-2 bg-green-900 text-green-400 text-xs px-2 py-1 rounded-full">
                    Always Free
                  </span>
                </div>
                <div className="mb-4">
                  <div className="text-3xl font-bold">${freePrice.toFixed(2)}</div>
                  <div className="text-gray-400 text-sm">per {formatPeriod()}</div>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                    <span>50 slots (fixed)</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                    <span>Basic features</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                    <span>Community support</span>
                  </li>
                </ul>
                <button
                  onClick={() => handlePlanSelection("Free Plan", freePrice)}
                  className="w-full py-3 bg-[#c2831f] text-white rounded-xl font-medium flex items-center justify-center"
                >
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
            
            {/* Pro Plan */}
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl border-2 border-[#c2831f] overflow-hidden relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-[#c2831f] text-white px-4 py-1 rounded-b-lg text-sm font-medium">
                Most Popular
              </div>
              <div className="p-6 pt-10">
                <div className="flex items-center mb-4">
                  <Users className="w-8 h-8 text-[#c2831f] mr-3" />
                  <h3 className="text-xl font-bold">Pro Plan</h3>
                </div>
                <div className="mb-4">
                  <div className="text-3xl font-bold">${proPrice.toFixed(2)}</div>
                  <div className="text-gray-400 text-sm">per {formatPeriod()}</div>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                    <span>{slots} slots</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                    <span>25 candidates/slot</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                    <span>Team collaboration</span>
                  </li>
                </ul>
                <button
                  onClick={() => handlePlanSelection("Pro Plan", proPrice)}
                  className="w-full py-3 bg-[#c2831f] text-white rounded-xl font-medium flex items-center justify-center"
                >
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
            
            {/* Growth Plan */}
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl border border-[#c2831f]/30 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="w-8 h-8 text-[#c2831f] mr-3" />
                  <div>
                    <h3 className="text-xl font-bold">Growth Plan</h3>
                    <span className="text-xs bg-[#c2831f]/20 text-[#c2831f] px-2 py-1 rounded-full">
                      Advanced
                    </span>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-3xl font-bold">${growthPrice.toFixed(2)}</div>
                  <div className="text-gray-400 text-sm">per {formatPeriod()}</div>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                    <span>{slots} slots</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                    <span>200 candidates/slot</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                    <span>Account manager</span>
                  </li>
                </ul>
                <button
                  onClick={() => handlePlanSelection("Growth Plan", growthPrice)}
                  className="w-full py-3 bg-[#c2831f] text-white rounded-xl font-medium flex items-center justify-center"
                >
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
            
            {/* Enterprise Plan */}
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl border border-[#c2831f]/30 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Star className="w-8 h-8 text-[#c2831f] mr-3" />
                  <div>
                    <h3 className="text-xl font-bold">Enterprise</h3>
                    <span className="text-xs bg-[#c2831f]/20 text-[#c2831f] px-2 py-1 rounded-full">
                      Best Value
                    </span>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-3xl font-bold">${enterprisePrice.toFixed(2)}</div>
                  <div className="text-gray-400 text-sm">per {formatPeriod()}</div>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                    <span>Unlimited slots</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                    <span>Unlimited candidates</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                    <span>Dedicated support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-[#c2831f] mr-2" />
                    <span>Full API access</span>
                  </li>
                </ul>
                <button
                  onClick={() => handlePlanSelection("Enterprise Plan", enterprisePrice)}
                  className="w-full py-3 bg-[#c2831f] text-white rounded-xl font-medium flex items-center justify-center"
                >
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Summary */}
          {(selectedIntegrations.length > 0 || slots > 50) && (
            <div className="max-w-2xl mx-auto bg-black/30 backdrop-blur-lg rounded-2xl border border-[#c2831f]/30 p-8 mb-12">
              <h3 className="text-xl font-bold mb-4" style={{ color: '#c2831f' }}>Pricing Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Base slots (50):</span>
                  <span>Included</span>
                </div>
                {slots > 50 && (
                  <div className="flex justify-between ">
                    <span>Additional slots ({slots - 50}):</span>
                    <span>${((slots - 50) * (billingPeriod === 'monthly' ? 0.5 : billingPeriod === 'quarterly' ? 0.45 : 0.4)).toFixed(2)}</span>
                  </div>
                )}
                {selectedIntegrations.length > 0 && (
                  <div className="flex justify-between">
                    <span>Integrations ({selectedIntegrations.length}):</span>
                    <span>${integrationCosts.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-[#c2831f]/30 pt-3 font-bold ">
                  <div className="flex justify-between">
                    <span>Total additional cost:</span>
                    <span style={{ color: '#c2831f' }}>
                      ${(integrationCosts + Math.max(0, slots - 50) * (billingPeriod === 'monthly' ? 0.5 : billingPeriod === 'quarterly' ? 0.45 : 0.4)).toFixed(2)} per {formatPeriod()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* CTA */}
          <div className="text-center py-8">
            <div className="flex justify-center gap-4">
              <button className="px-8 py-3 bg-[#c2831f] text-white rounded-xl font-medium">
                Start Free Trial
              </button>
              <button className="px-8 py-3 bg-black border border-[#c2831f] text-white rounded-xl font-medium">
                Email Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Pricing;