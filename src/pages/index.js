import { useState, useEffect } from 'react';

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function Home() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          setRegistration(reg);
          return reg.pushManager.getSubscription();
        })
        .then(sub => {
          if (sub) {
            setIsSubscribed(true);
            setSubscription(sub);
            // Send the existing subscription to the server
            sendSubscriptionToServer(sub);
          }
        })
        .catch(console.error);
    }
  }, []);

  const subscribeToNotifications = async () => {
    try {
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });
      setSubscription(sub);
      setIsSubscribed(true);
      sendSubscriptionToServer(sub);
    } catch (error) {
      console.error('Failed to subscribe the user: ', error);
    }
  };

  const sendSubscriptionToServer = async (sub) => {
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sub),
      });
      if (!response.ok) {
        throw new Error('Bad status code from server.');
      }
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('Error sending subscription to server:', error);
    }
  };

  const handleTestNotification = async () => {
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }
      console.log('Test notification sent successfully');
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  return (
    <div>
      <h1>Push Notification Demo</h1>
      {!isSubscribed ? (
        <button onClick={subscribeToNotifications}>Subscribe to Notifications</button>
      ) : (
        <>
          <p>You are subscribed to notifications!</p>
          <button onClick={handleTestNotification}>Send Test Notification</button>
        </>
      )}
    </div>
  );
}