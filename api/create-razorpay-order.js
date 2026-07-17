const Razorpay = require('razorpay');

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { amount, receipt } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    // Initialize Razorpay. 
    // Keys should be set in Vercel Environment Variables:
    // RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder', // Fallback for local testing
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
    });

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
      currency: 'INR',
      receipt: receipt || `rcpt_${Date.now()}`
    };

    const order = await instance.orders.create(options);
    
    if (!order) {
      return res.status(500).json({ error: 'Failed to create order' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Razorpay order error:', error);
    res.status(500).json({ error: error.message });
  }
};
