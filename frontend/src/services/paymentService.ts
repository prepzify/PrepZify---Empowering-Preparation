import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export type PlanId = 'free' | 'pro' | 'pro-plus' | 'elite';

export interface PricingPlan {
  id: PlanId;
  name: string;
  priceLabel: string;
  amount: number;
  period: string;
  durationDays: number;
  description: string;
  features: string[];
  accent?: boolean;
}

interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  plan: {
    id: Exclude<PlanId, 'free'>;
    name: string;
    durationDays: number;
  };
}

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface VerifiedPaymentResponse {
  verified: true;
  paymentId: string;
  orderId: string;
  plan: {
    id: Exclude<PlanId, 'free'>;
    name: string;
    amount: number;
    currency: string;
    durationDays: number;
  };
  subscription: {
    status: 'active';
    startedAt: string;
    expiresAt: string;
  };
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string | null;
    email?: string | null;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    priceLabel: '₹0',
    amount: 0,
    period: '/month',
    durationDays: 0,
    description: 'A light starter plan for weekly practice.',
    features: [
      '1 AI video interview per week',
      'Basic career roadmaps',
      'Limited daily coding',
      '15 AI chats',
      '2 ATS resume analyses per month with basic improvement suggestions',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceLabel: '₹199',
    amount: 19900,
    period: '/month',
    durationDays: 30,
    description: 'For students preparing consistently.',
    features: [
      'Unlimited resume analysis',
      'Custom role preparation roadmaps',
      'Unlimited practice',
      '300 AI chats',
      'Five AI mock interviews each week',
    ],
  },
  {
    id: 'pro-plus',
    name: 'Pro+',
    priceLabel: '₹499',
    amount: 49900,
    period: '/3 months',
    durationDays: 90,
    description: 'A deeper plan for placement season.',
    features: [
      'Includes all Basic and Pro features',
      '20 company-specific interviews',
      'AI-powered code reviews',
      'Third-party integrations',
      'Priority support',
      'Smart analytics and memory',
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    priceLabel: '₹1499',
    amount: 149900,
    period: '/year',
    durationDays: 365,
    description: 'Premium placement readiness with maximum support.',
    features: [
      'Includes all Pro+ features',
      '100 mock interviews',
      'Long-term preparation tracking',
      'Placement readiness score analysis',
      'Priority premium feature access',
    ],
    accent: true,
  },
];

function loadRazorpayScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${RAZORPAY_SCRIPT_URL}"]`
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Razorpay checkout failed to load.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Razorpay checkout failed to load.'));
    document.body.appendChild(script);
  });
}

async function createOrder(plan: PricingPlan): Promise<RazorpayOrderResponse> {
  const user = auth.currentUser;
  const response = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      planId: plan.id,
      userId: user?.uid,
      email: user?.email,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Could not create payment order.');
  }

  return response.json();
}

async function verifyPayment(
  plan: PricingPlan,
  response: RazorpaySuccessResponse
): Promise<VerifiedPaymentResponse> {
  const verifyResponse = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...response,
      planId: plan.id,
    }),
  });

  if (!verifyResponse.ok) {
    const error = await verifyResponse.json().catch(() => ({}));
    throw new Error(error.error || 'Payment verification failed.');
  }

  return verifyResponse.json();
}

async function savePaymentToFirestore(payment: VerifiedPaymentResponse) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Please sign in before upgrading.');
  }

  const paymentRef = doc(db, 'users', user.uid, 'payments', payment.paymentId);
  const subscriptionRef = doc(db, 'users', user.uid, 'subscriptions', 'current');

  await setDoc(paymentRef, {
    userId: user.uid,
    email: user.email,
    provider: 'razorpay',
    status: 'paid',
    planId: payment.plan.id,
    planName: payment.plan.name,
    amount: payment.plan.amount,
    currency: payment.plan.currency,
    razorpayPaymentId: payment.paymentId,
    razorpayOrderId: payment.orderId,
    startedAt: new Date(payment.subscription.startedAt),
    expiresAt: new Date(payment.subscription.expiresAt),
    createdAt: serverTimestamp(),
  });

  await setDoc(subscriptionRef, {
    userId: user.uid,
    status: payment.subscription.status,
    planId: payment.plan.id,
    planName: payment.plan.name,
    provider: 'razorpay',
    paymentId: payment.paymentId,
    orderId: payment.orderId,
    startedAt: new Date(payment.subscription.startedAt),
    expiresAt: new Date(payment.subscription.expiresAt),
    updatedAt: serverTimestamp(),
  });
}

const showMockCheckoutOverlay = (orderId: string, amount: number, planName: string): Promise<RazorpaySuccessResponse> => {
  return new Promise((resolve, reject) => {
    const overlay = document.createElement('div');
    overlay.id = 'mock-checkout-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: inherit;
      color: #eff1f6;
    `;

    overlay.innerHTML = `
      <div style="
        background: #1e1e24;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 28px;
        padding: 32px;
        max-width: 420px;
        width: 100%;
        text-align: center;
        box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        animation: mockFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      ">
        <style>
          @keyframes mockFadeIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          #mock-success-btn:hover { background-color: #ffa726 !important; transform: scale(1.02); }
          #mock-cancel-btn:hover { background-color: rgba(255,255,255,0.05) !important; color: #fff !important; }
        </style>
        
        <div style="display: flex; justify-content: center; margin-bottom: 24px;">
          <div style="background: rgba(255, 152, 0, 0.1); width: 64px; height: 64px; border-radius: 22px; display: flex; align-items: center; justify-content: center; color: #ff9800; border: 1px solid rgba(255, 152, 0, 0.2);">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          </div>
        </div>
        
        <h3 style="font-size: 20px; font-weight: 900; margin-bottom: 6px; tracking-tight: -0.02em; color: #fff;">PrepZify Checkout</h3>
        <p style="font-size: 11px; color: #ff9800; margin-bottom: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em;">Developer Sandbox Mode</p>
        
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 20px; border-radius: 20px; margin-bottom: 28px; text-align: left; font-size: 13px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #9da2b0; font-weight: 500;">Plan Selected:</span>
            <span style="font-weight: 800; color: #fff;">${planName}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #9da2b0; font-weight: 500;">Amount:</span>
            <span style="font-weight: 900; color: #ff9800; font-family: monospace; font-size: 15px;">₹${(amount / 100).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-t: 1px solid rgba(255,255,255,0.05); pt-10; margin-top: 10px;">
            <span style="color: #9da2b0; font-weight: 500;">Order ID:</span>
            <span style="font-family: monospace; font-size: 11px; color: #9da2b0; opacity: 0.7;">${orderId}</span>
          </div>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <button id="mock-success-btn" style="
            background: #ff9800;
            color: #000;
            font-weight: 900;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            padding: 16px;
            border-radius: 18px;
            border: none;
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          ">Complete Simulated Payment</button>
          
          <button id="mock-cancel-btn" style="
            background: transparent;
            color: #9da2b0;
            font-weight: 800;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            padding: 14px;
            border-radius: 18px;
            border: 1px solid rgba(255,255,255,0.08);
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          ">Cancel Checkout</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const successBtn = overlay.querySelector('#mock-success-btn') as HTMLButtonElement;
    const cancelBtn = overlay.querySelector('#mock-cancel-btn') as HTMLButtonElement;

    successBtn.addEventListener('click', () => {
      const paymentId = `pay_mock_${Math.random().toString(36).substring(2, 11)}`;
      const signature = `sig_mock_${Math.random().toString(36).substring(2, 11)}`;
      document.body.removeChild(overlay);
      resolve({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      });
    });

    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(overlay);
      reject(new Error('Payment cancelled.'));
    });
  });
};

export async function startRazorpayPayment(plan: PricingPlan) {
  const user = auth.currentUser;
  const key = import.meta.env.VITE_RAZORPAY_KEY_ID;

  if (!user) {
    throw new Error('Please sign in before upgrading.');
  }

  if (plan.id === 'free') {
    throw new Error('Free plan does not require payment.');
  }

  const order = await createOrder(plan);

  const isMockKey = !key || key === 'rzp_test_your_key_id' || key.includes('dummy');

  if (isMockKey) {
    try {
      const mockResponse = await showMockCheckoutOverlay(order.orderId, order.amount, plan.name);
      const verifiedPayment = await verifyPayment(plan, mockResponse);
      await savePaymentToFirestore(verifiedPayment);
      return verifiedPayment;
    } catch (error) {
      throw error;
    }
  }

  await loadRazorpayScript();
  const RazorpayCheckout = window.Razorpay;
  if (!RazorpayCheckout) {
    throw new Error('Razorpay checkout is unavailable.');
  }

  return new Promise<VerifiedPaymentResponse>((resolve, reject) => {
    const checkout = new RazorpayCheckout({
      key,
      amount: order.amount,
      currency: order.currency,
      name: 'PrepZify',
      description: `${plan.name} plan`,
      order_id: order.orderId,
      prefill: {
        name: user.displayName,
        email: user.email,
      },
      notes: {
        planId: plan.id,
        userId: user.uid,
      },
      theme: {
        color: '#ff9800',
      },
      handler: async (response) => {
        try {
          const verifiedPayment = await verifyPayment(plan, response);
          await savePaymentToFirestore(verifiedPayment);
          resolve(verifiedPayment);
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled.')),
      },
    });

    checkout.open();
  });
}
