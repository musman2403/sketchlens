import express from 'express';
import Stripe from 'stripe';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Stripe is initialized inside routes to ensure env vars are loaded

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

export default router;
