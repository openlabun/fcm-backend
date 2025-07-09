const express = require("express");
const admin = require("firebase-admin");
const path = require("path");

// Load service account key
const serviceAccountPath =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(__dirname, "serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
  databaseURL: "https://fir-2024-14046-default-rtdb.firebaseio.com",
});

const app = express();
app.use(express.json());

// Health-check
app.get("/", (_req, res) => res.send("FCM backend is up."));

// POST /send { message?: string }
app.post("/send", async (req, res) => {
  const { message } = req.body;
  try {
    const r = await admin.messaging().send({
      topic: "allUsers",
      notification: {
        title: "Ping",
        body: message || "Someone pressed the button!",
      },
      data: { increment: "1" },
    });
    return res.json({ success: true, id: r });
  } catch (err) {
    console.error("FCM error:", err);
    return res.status(500).json({ success: false, error: err.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
