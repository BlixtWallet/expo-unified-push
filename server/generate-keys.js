#!/usr/bin/env node
import webPush from "web-push";
import fs from "fs";
import path from "path";

const outputPath = path.resolve("vapid-keys.json");
const keys = webPush.generateVAPIDKeys();

fs.writeFileSync(outputPath, JSON.stringify(keys, null, 2));

console.log("Generated VAPID keys:");
console.log(`  publicKey:  ${keys.publicKey}`);
console.log(`  privateKey: ${keys.privateKey}`);
console.log(`Saved to ${outputPath}`);
