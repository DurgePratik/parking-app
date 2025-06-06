import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function PaymentPage() {

const navigation = useNavigation();
   
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const router = useRouter();
  const { spotId, spotName, amount } = useLocalSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loadingWebView, setLoadingWebView] = useState(false);

  

  useEffect(() => {
    const createOrder = async () => {
      try {
        const response = await fetch('http://192.168.236.118:5000/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: Number(amount) }),
        });

        const data = await response.json();
        setOrderId(data.id);
      } catch (error) {
        console.error('Error creating order:', error);
      }
    };

    createOrder();
  }, []);

  const handlePaymentSuccess = async (paymentData: any) => {
    const bookingTime = new Date().toISOString();

    const paymentEntry = {
      spotId,
      spotName,
      amount,
      bookingTime,
      paymentId: paymentData.razorpay_payment_id,
      orderId: paymentData.razorpay_order_id,
      signature: paymentData.razorpay_signature,
    };

    try {
      
      await fetch('http://192.168.236.118:5000/payment-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentEntry),
      });
    } catch (error) {
      console.error('❌ Error saving payment info:', error);
    } finally {
      
      router.replace({
        pathname: '/bookingpage',
        params: { spotId: spotId?.toString() },
      });
    }
  };

  if (!orderId) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  const htmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body>
        <script>
          var options = {
            "key": "rzp_test_Eb20fMVM3hFoPE",
            "amount": "${Number(amount) * 100}",
            "currency": "INR",
            "name": "Car App",
            "description": "Parking Payment for ${spotName}",
            "order_id": "${orderId}",
            "handler": function (response) {
              window.ReactNativeWebView.postMessage(JSON.stringify(response));
            },
            "modal": {
              "ondismiss": function () {
                window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'dismissed' }));
              }
            },
            "theme": {
              "color": "#3399cc"
            }
          };
          var rzp = new Razorpay(options);
          rzp.open();
        </script>
      </body>
    </html>
  `;

  return (
    <View style={{ flex: 1 }}>
      {loadingWebView && (
        <ActivityIndicator
          size="large"
          style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 1 }}
        />
      )}
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        onLoadStart={() => setLoadingWebView(true)}
        onLoadEnd={() => setLoadingWebView(false)}
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.razorpay_payment_id) {
            handlePaymentSuccess(data);
          } else if (data.status === 'dismissed') {
            router.replace('/bookingpage');
          }
        }}
      />
    </View>
  );
}
