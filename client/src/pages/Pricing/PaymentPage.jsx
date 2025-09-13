import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

export default function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    name = "Pro Plan",
    basePrice = 57.5,
    price = "28.75",
    contacts = 500,
  } = state || {};

  const tax = (price * 0.1).toFixed(2); // 10% tax
  const total = (parseFloat(price) + parseFloat(tax)).toFixed(2);

  // Handle pay button
  const handlePay = () => {
    // Here you can also check if checkbox is checked before navigation
    navigate("/signin", { state: { from: "payment", plan: name, total } });
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white py-10 px-4 md:px-8 font-sans">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/pricingdash"
          className="text-sm text-[#d4af37] hover:underline inline-block"
        >
          ← Back to Pricing
        </Link>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Payment Form */}
        <div className="bg-[#1a1a1a] p-6 sm:p-8 rounded-xl shadow-lg border border-gray-800">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#d4af37] mb-3">
            Complete Your Purchase
          </h2>
          <p className="text-gray-400 mb-5 text-sm">
            You're just a step away from unlocking{" "}
            <span className="text-white font-semibold">{name}</span>. Enjoy
            premium features and priority access.
          </p>

          <div className="space-y-4">
            {/* Card Number */}
            <div>
              <label className="block text-sm mb-1 text-gray-300">
                Card Number
              </label>
              <input
                type="text"
                className="w-full bg-[#111] border border-gray-700 text-white px-3 py-2 rounded"
                placeholder="1234 5678 9012 3456"
              />
            </div>

            {/* Expiry & CVV */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm mb-1 text-gray-300">
                  Expiry Date
                </label>
                <input
                  type="text"
                  className="w-full bg-[#111] border border-gray-700 text-white px-3 py-2 rounded"
                  placeholder="MM/YY"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm mb-1 text-gray-300">CVV</label>
                <input
                  type="text"
                  className="w-full bg-[#111] border border-gray-700 text-white px-3 py-2 rounded"
                  placeholder="3 digits"
                />
              </div>
            </div>

            {/* Payment Gateways */}
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-300 mb-2">
                Or pay with:
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Razorpay */}
                <button className="cursor-pointer flex-1 bg-[#ffffff0d] hover:bg-[#ffffff1a] border border-gray-600 py-2 rounded text-sm flex justify-center items-center transition-transform hover:scale-105">
                  <div className="bg-white p-2 rounded w-24 h-10 flex items-center justify-center shadow-md">
                    <img
                      src="/payment/razorpay.png"
                      alt="Razorpay"
                      className="w-20 h-auto object-contain"
                    />
                  </div>
                </button>

                {/* Stripe */}
                <button className="cursor-pointer flex-1 bg-[#ffffff0d] hover:bg-[#ffffff1a] border border-gray-600 py-2 rounded text-sm flex justify-center items-center transition-transform hover:scale-105">
                  <div className="bg-white p-2 rounded w-24 h-10 flex items-center justify-center shadow-md">
                    <img
                      src="/payment/stripe.png"
                      alt="Stripe"
                      className="w-20 h-auto object-contain"
                    />
                  </div>
                </button>

                {/* PayPal */}
                <button className="cursor-pointer flex-1 bg-[#ffffff0d] hover:bg-[#ffffff1a] border border-gray-600 py-2 rounded text-sm flex justify-center items-center transition-transform hover:scale-105">
                  <div className="bg-white p-2 rounded w-24 h-10 flex items-center justify-center shadow-md">
                    <img
                      src="/payment/pay pal.png"
                      alt="PayPal"
                      className="w-20 h-auto object-contain"
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-[#1a1a1a] p-6 sm:p-8 rounded-xl shadow-lg border border-gray-800 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#d4af37] mb-4">
              Purchase Summary
            </h3>

            <ul className="text-sm space-y-3">
              <li className="flex justify-between border-b border-gray-800 pb-2">
                <span>Plan:</span>
                <span className="text-white font-medium">{name}</span>
              </li>
              <li className="flex justify-between">
                <span>Contacts:</span>
                <span>{contacts}</span>
              </li>
              <li className="flex justify-between">
                <span>Base Price:</span>
                <span>${basePrice}</span>
              </li>
              <li className="flex justify-between text-green-400">
                <span>50% Discount Applied:</span>
                <span>- ${(basePrice - price).toFixed(2)}</span>
              </li>
              <li className="flex justify-between">
                <span>Tax (10%):</span>
                <span>${tax}</span>
              </li>
              <hr className="my-3 border-gray-700" />
              <li className="flex justify-between text-lg font-bold text-white">
                <span>Total:</span>
                <span>${total}</span>
              </li>
            </ul>
          </div>

          <div className="mt-6">
            <div className="flex items-start mb-4">
              <input type="checkbox" id="agree" className="mr-2 mt-1" />
              <label htmlFor="agree" className="text-sm text-gray-400">
                I agree to the{" "}
                <span className="underline text-white">Terms of Service</span>{" "}
                and <span className="underline text-white">Privacy Policy</span>.
              </label>
            </div>
            <button
              onClick={handlePay}
              className="w-full bg-[#d4af37] hover:bg-[#eac94d] text-black font-bold py-2 rounded transition cursor-pointer"
            >
              Pay ${total}
            </button>
          </div>
        </div>
      </div>

      {/* Support */}
      <div className="text-center mt-10 text-sm text-gray-500">
        <p>
          Need help?{" "}
          <span className="underline text-white cursor-pointer">
            Contact support
          </span>
        </p>
      </div>
    </div>
  );
}
