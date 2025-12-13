import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import { getToken } from "../utils/auth";
import { CheckCircle2, X, Loader, CreditCard, Smartphone } from "lucide-react";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Inner component that uses Stripe hooks
function PaymentForm({ courseId, courseName, coursePrice, courseImage, onSuccess, onClose, enrollmentId, lecturerId }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // No need to fetch payment intent here anymore - it's created in parent

  // Step 2: Handle Payment Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError("Payment system not ready. Please try again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Confirm payment with Stripe (supports cards, UPI, wallets, etc.)
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message);
        setLoading(false);
        return;
      }

      const { paymentIntent, error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href, // Required but not used since we handle manually
        },
        redirect: "if_required", // Don't redirect, handle in same page
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Step 3: Confirm payment on backend
        const token = getToken();
        const confirmResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/payment/confirm-payment`,
          {
            paymentIntentId: paymentIntent.id,
            enrollmentId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (confirmResponse.data.success) {
          setSuccess(true);
          
          // Notifications are now sent server-side in the backend
          // This ensures reliability even if frontend fails
          console.log('Enrollment confirmed. Notifications sent by server.');
          
          // Call parent callback after success
          setTimeout(() => {
            if (onSuccess) onSuccess(confirmResponse.data.enrollment);
          }, 2000);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed. Please try again.");
      console.error("Payment error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Payment Successful!
          </h2>
          <p className="text-center text-gray-600 mb-6">
            You are now enrolled in <span className="font-semibold">{courseName}</span>
          </p>
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Payment form
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Complete Payment</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Course Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          {courseImage && (
            <img
              src={courseImage}
              alt={courseName}
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
          )}
          <h3 className="font-semibold text-gray-800 mb-2">{courseName}</h3>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Price:</span>
            <span className="text-2xl font-bold text-blue-600">₹{coursePrice}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Payment Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Payment Details
            </label>
            <div className="border border-gray-300 rounded-lg p-4 bg-white">
              <PaymentElement
                options={{
                  layout: "tabs",
                  defaultValues: {
                    billingDetails: {
                      email: "", // You can pre-fill from user context
                    },
                  },
                }}
              />
            </div>
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800 font-semibold mb-1 flex items-center gap-1">
                <Smartphone className="w-4 h-4" />
                Test Payment Methods:
              </p>
              <ul className="text-xs text-blue-700 space-y-1 ml-5">
                <li>• Card: 4242 4242 4242 4242 (Visa)</li>
                <li>• Card: 5555 5555 5555 4444 (Mastercard)</li>
                <li>• Any future expiry date and CVC</li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !stripe}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin" />
                Processing Payment...
              </>
            ) : (
              `Pay ₹${coursePrice}`
            )}
          </button>
        </form>

        {/* Info */}
        <p className="text-xs text-gray-500 text-center mt-4">
          🔒 Your payment is secure and encrypted by Stripe.
        </p>
      </div>
    </div>
  );
}

// Main component that wraps with Elements provider
export default function EnrollmentPayment({ courseId, courseName, coursePrice, courseImage, isOpen, onClose, onSuccess, lecturerId }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [enrollmentId, setEnrollmentId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const createPaymentIntent = async () => {
      try {
        const token = getToken();
        if (!token) {
          console.error("No authentication token found");
          return;
        }
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/payment/create-payment-intent`,
          { courseId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          setClientSecret(response.data.clientSecret);
          setEnrollmentId(response.data.enrollmentId);
        }
      } catch (err) {
        console.error("Error creating payment intent:", err);
        // Check if already enrolled
        if (err.response?.data?.message?.includes("already") || err.response?.data?.message?.includes("Already")) {
          alert("You are already enrolled in this course!");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else if (err.response?.status === 401) {
          console.error("Unauthorized - please login again");
          alert("Please login again to continue");
        } else {
          console.error("Payment Intent Error:", err.response?.data || err.message);
          alert("Error creating payment: " + (err.response?.data?.message || err.message));
        }
      }
    };

    createPaymentIntent();
  }, [isOpen, courseId]);

  if (!isOpen) return null;

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe",
      variables: {
        colorPrimary: "#2563eb",
        colorBackground: "#ffffff",
        colorText: "#1f2937",
        colorDanger: "#dc2626",
        fontFamily: "system-ui, sans-serif",
        borderRadius: "8px",
      },
    },
  };

  return (
    <>
      {clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <PaymentForm
            courseId={courseId}
            courseName={courseName}
            coursePrice={coursePrice}
            courseImage={courseImage}
            onClose={onClose}
            onSuccess={onSuccess}
            enrollmentId={enrollmentId}
            lecturerId={lecturerId}
          />
        </Elements>
      )}
    </>
  );
}
