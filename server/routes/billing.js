import express from 'express';
import Stripe from 'stripe';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Use dummy key if not provided for dev mode
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');

router.post('/create-checkout-session', requireAuth, async (req, res) => {
  try {
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

export default router;
