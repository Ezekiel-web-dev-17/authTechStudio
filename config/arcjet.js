import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { ARCJET_KEY } from "../config/config.js";

const aj = arcjet({
  // Get your site key from https://app.arcjet.com and set it as an environment
  // variable rather than hard coding.
  key: ARCJET_KEY,
  characteristics: ["ip.src"], // Track requests by IP
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
     deny: [
      "CATEGORY:AI",              // AI scrapers, model training crawlers
      "CATEGORY:SPAM",            // Email harvesters, spam bots
      "CATEGORY:MONITOR",         // Uptime monitors that hammer your server
      "CATEGORY:SCRAPER",         // Generic web scrapers
      "CATEGORY:VULN_SCANNER",    // Security scanners looking for exploits
      "CATEGORY:HEADLESS",        // Headless browsers (often used for automation attacks)
      "CATEGORY:MARKETING",       // Bulk marketing crawlers
      "CATEGORY:AI_IMAGE",        // Bots scraping images for AI datasets
      "CATEGORY:MALWARE",         // Bots with malicious fingerprints
  ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE",
      refillRate: 5, // Refill 5 tokens per interval
      interval: 10, // Refill every 10 seconds
      capacity: 10, // Bucket capacity of 10 tokens
    }),
  ],
});

export default aj