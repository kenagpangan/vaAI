import React, { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function Home() {
  const { data: session } = useSession();
  const userId = session?.user?.email || ''; // Use unique user identifier

  const [taskType, setTaskType] = useState('');
  const [brief, setBrief] = useState('');
  const [price, setPrice] = useState(null);
  const [paid, setPaid] = useState(false);
  const [result, setResult] = useState(null);

  const calculatePrice = () => {
    const basePrice = 5;
    const lengthFactor = brief.length / 100;
    const calculatedPrice = parseFloat((basePrice + lengthFactor).toFixed(2));
    setPrice(calculatedPrice);
  };

  const handlePayment = async () => {
    if (!price || !userId) return;
    const stripe = await stripePromise;

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: price * 100, userId }),
    });

    const { id } = await response.json();

    if (!stripe || !id) {
      console.error('Stripe or session ID missing');
      return;
    }

    const result = await stripe.redirectToCheckout({ sessionId: id });
    if (result.error) console.error(result.error.message);
  };

  const fetchAIResponse = async () => {
    if (!userId) return;
    const response = await fetch('/api/ai-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brief, taskType, userId }),
    });
    const data = await response.json();
    setResult(data.result);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const session_id = urlParams.get('session_id');

    if (!session_id || !userId) return;

    fetch(`/api/verify-payment?session_id=${session_id}&userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.verified) {
          setPaid(true);
          setResult(data.result);
        }
      });
  }, [userId]);

  if (!session) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to AutoProVA</h1>
        <p className="mb-4">Please sign in to get started with your AI-powered project assistant.</p>
        <Button onClick={() => signIn()}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Welcome, {session.user.name}</h1>
      <Button className="mb-4" variant="outline" onClick={() => signOut()}>
        Sign Out
      </Button>

      <Card className="mb-4">
        <CardContent className="space-y-4">
          <select
            className="w-full p-2 border rounded"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
          >
            <option value="">Select Task Type</option>
            <option value="writing">Writing</option>
            <option value="design">Design Brief</option>
            <option value="research">Research Summary</option>
          </select>

          <Textarea
            placeholder="Enter task details..."
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
          />

          <Button onClick={calculatePrice}>Get Quote</Button>

          {price && !paid && (
            <div className="text-lg font-semibold">
              Task Price: ${price.toFixed(2)}
              <Button className="ml-4" onClick={handlePayment}>
                Pay Now
              </Button>
            </div>
          )}

          {paid && !result && <p className="text-blue-500">Processing your task with AI...</p>}

          {result && (
            <div className="mt-4 p-4 bg-green-100 rounded">
              <h2 className="text-xl font-bold">Result:</h2>
              <p>{result}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}