"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; 
import { Button } from "@/components/ui/button";
import { usePayment } from "@/context/PaymentContext"; 

export default function PremiumPage() {
  const { user, isAuthenticated } = useAuth();
  const { isSubscribed } = usePayment();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  
  const userIsAlreadySubscribed = user ? isSubscribed(user.id) : false;

  const handleSubscribe = async () => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      
      
      const plan_id = "premium_monthly";
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); 

      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          plan_id: plan_id,
          end_date: endDate.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to subscribe.");
      }

      const result = await response.json();
      setMessage(result.message || "Subscription successful!");
      
      
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-4xl font-bold text-center mb-6">Go Premium!</h1>
      <p className="text-center text-lg text-gray-700 mb-8">
        Unlock exclusive resources, advanced analytics, and priority support by
        subscribing to our premium plan.
      </p>

      {userIsAlreadySubscribed && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
          <p className="font-bold">You are already subscribed!</p>
          <p>Enjoy your premium benefits.</p>
        </div>
      )}

      {!userIsAlreadySubscribed && (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Premium Monthly Plan</h2>
          <p className="text-gray-600 mb-4">
            Access all premium features for just $9.99/month.
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-6">
            <li>Unlimited access to paid resources</li>
            <li>Advanced analytics dashboard</li>
            <li>Priority customer support</li>
            <li>Exclusive content library</li>
          </ul>
          <Button
            onClick={handleSubscribe}
            disabled={loading || !isAuthenticated}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {loading ? "Subscribing..." : "Subscribe Now"}
          </Button>
          {!isAuthenticated && (
            <p className="text-sm text-red-500 mt-2 text-center">
              Please log in to subscribe.
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {message && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4" role="alert">
          <p className="font-bold">Success!</p>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}
