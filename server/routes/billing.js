import express from 'express';
import Stripe from 'stripe';
import crypto from 'crypto';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Stripe is initialized inside routes to ensure env vars are loaded

// Safepay config
const SAFEPAY_SANDBOX_URL = 'https://sandbox.api.getsafepay.com';
const SAFEPAY_SANDBOX_CHECKOUT = 'https://sandbox.api.getsafepay.com';

router.post('/create-checkout-session', requireAuth, async (req, res) => {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');
    const user = await User.findById(req.user.userId);
    
    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'SketchLens Pro',
              description: 'Unlimited AI sketch generations',
            },
            unit_amount: 999, // $9.99/month
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      client_reference_id: user._id.toString(),
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Mock endpoint for dev testing since setting up actual webhooks locally can be complex
router.post('/mock-upgrade', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    user.isPro = true;
    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upgrade user' });
  }
});

// Create Safepay Checkout Session (using direct REST API)
router.post('/create-safepay-session', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    // Step 1: Create a payment session via Safepay REST API
    const initResponse = await fetch(`${SAFEPAY_SANDBOX_URL}/order/v1/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SFPY-MERCHANT-SECRET': process.env.SAFEPAY_SECRET_KEY
      },
      body: JSON.stringify({
        client: process.env.SAFEPAY_API_KEY,
        amount: 3000,
        currency: 'PKR',
        environment: 'sandbox'
      })
    });

    const initData = await initResponse.json();
    console.log('Safepay init response:', JSON.stringify(initData, null, 2));

    if (!initResponse.ok) {
      console.error('Safepay init failed:', initData);
      return res.status(500).json({ error: 'Failed to initialize Safepay payment', details: initData });
    }

    const trackerToken = initData.data?.token || initData.token;

    if (!trackerToken) {
      console.error('No tracker token in Safepay response:', initData);
      return res.status(500).json({ error: 'No payment token received from Safepay' });
    }

    // Save the tracker token to the user so we can match on webhook
    user.subscriptionId = trackerToken;
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const orderId = `order_${Date.now()}`;
    
    // Step 2: Construct the checkout URL (matches @sfpy/node-sdk format)
    const params = new URLSearchParams({
      beacon: trackerToken,
      order_id: orderId,
      source: 'custom',
      redirect_url: `${clientUrl}/dashboard`,
      cancel_url: `${clientUrl}/dashboard?canceled=true`,
      env: 'sandbox',
      webhooks: 'true'
    });

    const checkoutUrl = `${SAFEPAY_SANDBOX_CHECKOUT}/checkout/pay?${params.toString()}`;
    console.log('Safepay checkout URL:', checkoutUrl);
    
    res.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Safepay checkout error:', error);
    res.status(500).json({ error: 'Failed to create Safepay checkout session' });
  }
});

// Verify Safepay payment and upgrade user
router.post('/verify-safepay', requireAuth, async (req, res) => {
  try {
    const { tracker } = req.body;
    if (!tracker) {
      return res.status(400).json({ error: 'Tracker token is required' });
    }

    // Verify payment status with Safepay API
    const verifyResponse = await fetch(`${SAFEPAY_SANDBOX_URL}/order/v1/${tracker}`, {
      method: 'GET',
      headers: {
        'X-SFPY-MERCHANT-SECRET': process.env.SAFEPAY_SECRET_KEY
      }
    });

    const verifyData = await verifyResponse.json();
    console.log('Safepay verify response:', JSON.stringify(verifyData, null, 2));

    const state = verifyData?.data?.state || verifyData?.state;

    if (state === 'TRACKER_ENDED' || state === 'PAYMENT_COMPLETE' || state === 'DELIVERED') {
      const user = await User.findById(req.user.userId);
      if (user && !user.isPro) {
        user.isPro = true;
        user.subscriptionId = tracker;
        await user.save();
        console.log(`User ${user._id} upgraded to Pro via Safepay verification!`);
      }
      return res.json({ success: true, isPro: true });
    }

    res.json({ success: false, state, message: 'Payment not yet confirmed' });
  } catch (error) {
    console.error('Safepay verify error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});
// Verify Stripe payment and upgrade user
router.post('/verify-stripe', requireAuth, async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid') {
      const user = await User.findById(req.user.userId);
      if (user && !user.isPro) {
        user.isPro = true;
        user.subscriptionId = session.subscription;
        user.stripeCustomerId = session.customer;
        await user.save();
        console.log(`User ${user._id} upgraded to Pro via Stripe frontend verification!`);
      }
      return res.json({ success: true, isPro: true });
    }

    res.json({ success: false, status: session.payment_status, message: 'Payment not yet confirmed' });
  } catch (error) {
    console.error('Stripe verify error:', error);
    res.status(500).json({ error: 'Failed to verify Stripe payment' });
  }
});
export const stripeWebhookHandler = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy'
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    try {
      const userId = session.client_reference_id;
      const stripeCustomerId = session.customer;
      const subscriptionId = session.subscription;

      if (userId) {
        await User.findByIdAndUpdate(userId, {
          isPro: true,
          stripeCustomerId: stripeCustomerId,
          subscriptionId: subscriptionId
        });
        console.log(`User ${userId} upgraded to Pro via webhook!`);
      }
    } catch (err) {
      console.error('Error upgrading user in webhook:', err);
    }
  }

  res.send();
};

export const safepayWebhookHandler = async (req, res) => {
  const signature = req.headers['x-sfpy-signature'] || req.headers['x-signature'];
  const payload = req.body;
  const webhookSecret = process.env.SAFEPAY_WEBHOOK_SECRET || 'dummy_safepay_secret';

  try {
    // Verify signature
    const hmac = crypto.createHmac('sha256', webhookSecret);
    const digest = hmac.update(payload).digest('hex');
    
    // In production we should strictly verify this, for development if the secret is dummy we bypass
    if (webhookSecret !== 'dummy_safepay_secret' && signature !== digest) {
      console.error('Safepay webhook signature mismatch');
      return res.status(400).send('Invalid signature');
    }

    const event = JSON.parse(payload.toString('utf8'));

    // Assuming event contains tracker token and status
    if (event.state === 'PAYMENT_COMPLETE' || event.state === 'TRACKER_ENDED' || event.type === 'payment.completed') {
      const trackerToken = event.tracker?.token || event.token;
      
      if (trackerToken) {
        // Find user by the tracker token we saved earlier
        const user = await User.findOne({ subscriptionId: trackerToken });
        if (user) {
          user.isPro = true;
          await user.save();
          console.log(`User ${user._id} upgraded to Pro via Safepay webhook!`);
        }
      }
    }

    res.send();
  } catch (err) {
    console.error('Safepay webhook error:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

export default router;
