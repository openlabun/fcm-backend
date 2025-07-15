// File: index.js
const express = require("express");
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Path to subscriptions file
const SUBS_FILE = path.join(__dirname, "subscriptions.json");
let subscriptions = {};
// Load existing subscriptions
if (fs.existsSync(SUBS_FILE)) {
  try {
    subscriptions = JSON.parse(fs.readFileSync(SUBS_FILE, "utf8"));
  } catch (err) {
    console.error("Error parsing subscriptions.json:", err);
    subscriptions = {};
  }
}
function saveSubscriptions() {
  fs.writeFileSync(SUBS_FILE, JSON.stringify(subscriptions, null, 2));
}

const app = express();
app.use(express.json());

// Initialize Admin SDK with service account
const keyPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(require(keyPath)),
});

// Health-check
app.get("/", (_req, res) => res.send("FCM backend is up."));

// Subscribe endpoint
app.post("/subscribe", async (req, res) => {
  const { token, topic } = req.body;
  if (!token || !topic)
    return res
      .status(400)
      .json({ success: false, error: "token and topic are required" });
  // Track subscription locally
  subscriptions[token] = subscriptions[token] || [];
  if (!subscriptions[token].includes(topic)) {
    subscriptions[token].push(topic);
    saveSubscriptions();
  }
  try {
    await admin.messaging().subscribeToTopic(token, topic);
    res.json({ success: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    res.status(500).json({ success: false, error: err.toString() });
  }
});

// Unsubscribe endpoint
app.post("/unsubscribe", async (req, res) => {
  const { token, topic } = req.body;
  if (!token || !topic)
    return res
      .status(400)
      .json({ success: false, error: "token and topic are required" });
  // Remove subscription locally
  if (subscriptions[token]) {
    subscriptions[token] = subscriptions[token].filter((t) => t !== topic);
    if (subscriptions[token].length === 0) delete subscriptions[token];
    saveSubscriptions();
  }
  try {
    await admin.messaging().unsubscribeFromTopic(token, topic);
    res.json({ success: true });
  } catch (err) {
    console.error("Unsubscribe error:", err);
    res.status(500).json({ success: false, error: err.toString() });
  }
});

// List subscriptions
app.get("/subscriptions", (_req, res) => {
  res.json({ subscriptions });
});

// FCM send endpoint
app.post("/send", async (req, res) => {
  const { topic = "allUsers", message = "" } = req.body;
  let payload = { topic };

  console.log(`Sending to topic: ${topic}`);
  if (topic === "activityUpdate") {
    payload.notification = {
      title: "Activity Update",
      body: "Activity status changed",
    };
    payload.android = {
      notification: { clickAction: "FLUTTER_NOTIFICATION_CLICK" },
    };
    payload.data = { action: "updateActivity" };
  } else if (topic === "activityLocationRequest") {
    payload.data = { action: "sendLocation" };
  } else {
    payload.notification = {
      title: "Notification",
      body: message || "You have a new message",
    };
    payload.data = { action: message };
  }
  try {
    const id = await admin.messaging().send(payload);
    res.json({ success: true, id });
  } catch (err) {
    console.error("Send error:", err);
    res.status(500).json({ success: false, error: err.toString() });
  }
});

// Location logging endpoint
app.post("/location", (req, res) => {
  const { latitude, longitude } = req.body;
  console.log(`Location received: lat=${latitude}, lon=${longitude}`);
  res.json({ success: true });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
