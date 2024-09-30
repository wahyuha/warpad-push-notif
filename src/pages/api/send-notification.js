import webpush from 'web-push';
import { getSubscriptions } from '../../lib/db';

const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
};

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const subscriptions = await getSubscriptions();
      const payload = JSON.stringify({
        title: 'Test Notification',
        body: 'This is a test notification.'
      });

      const results = await Promise.all(
        subscriptions.map(subscription =>
          webpush.sendNotification(subscription, payload)
            .catch(error => ({ error }))
        )
      );

      const successCount = results.filter(result => !result.error).length;
      res.status(200).json({ message: `Sent ${successCount} notifications` });
    } catch (error) {
      console.error('Error sending notifications:', error);
      res.status(500).json({ error: 'Error sending notifications' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}