const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_type, user_id } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !user_id || !plan_type) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';

    // Verify Signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Payment is valid! Now we insert into Supabase using Service Role Key
    const supabaseUrl = process.env.SUPABASE_URL || 'https://bhdyayvydxwugzghwvrj.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Must be set in Vercel

    if (!supabaseServiceKey) {
      console.warn("WARNING: SUPABASE_SERVICE_ROLE_KEY is not set. Assuming local testing.");
    }

    // Initialize Supabase with Service Role to bypass RLS for inserting
    const supabase = createClient(supabaseUrl, supabaseServiceKey || 'dummy_key', {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Calculate Expiry Date based on plan_type
    let daysToAdd = 30; // default monthly
    if (plan_type === 'quarterly') daysToAdd = 90;
    else if (plan_type === 'half-yearly') daysToAdd = 180;
    else if (plan_type === 'yearly') daysToAdd = 365;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysToAdd);

    // Insert pass
    const { data, error } = await supabase.from('passes').insert({
      user_id: user_id,
      plan_type: plan_type,
      start_date: new Date().toISOString(),
      expiry_date: expiryDate.toISOString(),
      status: 'active',
      payment_id: razorpay_payment_id
    }).select();

    if (error) {
      console.error('Supabase Insert Error:', error);
      return res.status(500).json({ error: 'Database update failed after payment.' });
    }

    res.status(200).json({ success: true, pass: data[0] });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: error.message });
  }
};
