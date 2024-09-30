import { saveSubscription } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await saveSubscription(req.body);
      res.status(200).json({ message: "Subscription saved successfully" });
    } catch (error) {
      console.error("Error saving subscription:", error);
      res.status(500).json({ error: "Error saving subscription" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
