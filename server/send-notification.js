#!/usr/bin/env node
import "dotenv/config";
import webPush from "web-push";

const endpoint = process.env.UP_ENDPOINT;
const p256dh = process.env.UP_P256DH;
const auth = process.env.UP_AUTH;
const publicKey = process.env.UP_PUBLIC_KEY;
const privateKey = process.env.UP_PRIVATE_KEY;

const missing = [];
if (!endpoint) missing.push("UP_ENDPOINT");
if (!p256dh) missing.push("UP_P256DH");
if (!auth) missing.push("UP_AUTH");
if (!publicKey) missing.push("UP_PUBLIC_KEY");
if (!privateKey) missing.push("UP_PRIVATE_KEY");

if (missing.length) {
  console.error("Missing required env vars:", missing.join(", "));
  process.exit(1);
}

webPush.setVapidDetails("mailto:example@example.com", publicKey, privateKey);

const type = process.env.UP_TYPE ?? "default";
const silent = process.env.UP_SILENT === "true";

const payload = JSON.stringify({
  id: Date.now(),
  title: silent ? undefined : "UnifiedPush test",
  body: silent ? undefined : "Hello from Node backend",
  type,
  silent,
  meta: {
    sentAt: new Date().toISOString(),
  },
});

try {
  await webPush.sendNotification(
    {
      endpoint,
      keys: {
        p256dh,
        auth,
      },
    },
    payload,
  );
  console.log("Notification sent!");
} catch (err) {
  console.error("Failed to send notification:", err);
  process.exit(1);
}
