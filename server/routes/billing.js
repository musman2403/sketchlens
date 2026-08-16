import express from 'express';
import Stripe from 'stripe';
import crypto from 'crypto';
import safepayModule from '@sfpy/node-core';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Stripe is initialized inside routes to ensure env vars are loaded

// Initialize Safepay helper
const getSafepay = () => {
  return safepayModule(process.env.SAFEPAY_SECRET_KEY, {
    authType: 'secret',
    host: 'https://sandbox.api.getsafepay.com'
  });
};

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

// Create Safepay Checkout Session
router.post('/create-safepay-session', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const safepay = getSafepay();
    
    const payment = await safepay.payments.session.setup({
      merchant_api_key: process.env.SAFEPAY_API_KEY,
      intent: "CYBERSOURCE",
      mode: "payment",
      currency: "PKR",
      amount: 300000, // 3000 PKR
    });

    const trackerToken = payment.data.tracker.token;
    
    // Save the tracker token to the user document so we know who is paying when the webhook hits
    user.subscriptionId = trackerToken; // reusing subscriptionId field for simplicity during payment
    await user.save();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const orderId = `order_${Date.now()}`;
    const checkoutUrl = safepay.checkout.createCheckoutUrl({
      env: 'sandbox',
      beacon: trackerToken,
      source: 'custom',
      orderId: orderId,
      cancelUrl: `${clientUrl}/dashboard?canceled=true`,
      redirectUrl: `${clientUrl}/dashboard?success=true`
    });
    
    res.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Safepay checkout error:', error);
    res.status(500).json({ error: 'Failed to create Safepay checkout session' });
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
