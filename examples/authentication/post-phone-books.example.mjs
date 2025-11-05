/**
 * Copyright (c) 2025 NFON AG
 * NFON Service Portal API POST example: Create a phone book entry
 *
 * What it does:
 * Sends a POST request to create a new phone book entry for a customer account.
 *
 * Steps to run:
 * 1. Enter your API_KEY_ID, API_KEY_SECRET, CUSTOMER_ACCOUNT
 * 2. Run: node post-phone-books.example.mjs
 *
 * Requirements:
 * - Node.js 18+
 */

import crypto from 'crypto';

const API_KEY_ID = '<YourAPIKeyId>';
const API_KEY_SECRET = '<YourAPIKeySecret>';
const CUSTOMER_ACCOUNT = '<YourCustomerAccount>';

const BASE_URL = 'https://portal-api.nfon.net:8090';
const PATH = `/api/customers/${CUSTOMER_ACCOUNT}/phone-books`;
const METHOD = 'POST';
const CONTENT_TYPE = 'application/json';

// Step 1: Prepare request body
const bodyObj = {
  data: [
    { name: 'displayName', value: 'John Doe' },
    { name: 'displayNumber', value: '+49 (176) 12345678' }
  ]
};
const body = JSON.stringify(bodyObj);

// Step 2: Compute Content-MD5 (hex-encoded hash of body)
const contentMD5 = crypto.createHash('md5').update(body).digest('hex');

// Step 3: Create RFC 2616-compliant date
const date = new Date().toUTCString();

// Step 4: Build the StringToSign
const stringToSign = `${METHOD}\n${contentMD5}\n${CONTENT_TYPE}\n${date}\n${PATH}`;

// Step 5: Sign with HMAC-SHA1
const signature = crypto.createHmac('sha1', API_KEY_SECRET).update(stringToSign).digest('base64');

// Step 6: Send request
const response = await fetch(`${BASE_URL}${PATH}`, {
  method: METHOD,
  headers: {
    'Authorization': `NFON-API ${API_KEY_ID}:${signature}`,
    'x-nfon-date': date,
    'Content-Type': CONTENT_TYPE,
    'Content-MD5': contentMD5
  },
  body
});

if (!response.ok) {
	console.error(`Request failed: ${response.status} ${response.statusText}`);
	process.exit(1);
}

// Step 7: Parse and display result
const text = await response.text();
try {
  console.log(JSON.parse(text));
} catch {
  console.log(text);
}
