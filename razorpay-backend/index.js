require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./car-app-b8390-firebase-adminsdk-fbsvc-84dc30fcc9.json'); // Place your downloaded Firebase key file here

const app = express();
app.use(cors());
app.use(express.json());

 
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

 
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


 
app.get('/', (req, res) => {
  res.send('✅ Razorpay + Firebase backend is running');
});

 
app.post('/create-order', async (req, res) => {
  const { amount } = req.body;
  

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100,  
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    });

    console.log('✅ Order created:', order.id);
    res.json(order);
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

 
app.post('/payment-info', async (req, res) => {
  const paymentInfo = req.body;

  try {
    const docRef = await db.collection('payments').add({
      ...paymentInfo,
      timestamp: new Date().toISOString(), 
    });

    console.log('✅ Payment info saved with ID:', docRef.id);
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('❌ Failed to save payment info:', error);
    res.status(500).json({ success: false, error: 'Failed to save payment info' });
  }
});

 
app.listen(5000, '0.0.0.0', () => {
  console.log('🚀 Backend running at http://localhost:5000');
});