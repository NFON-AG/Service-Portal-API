// Copyright 2025 NFON AG
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
//
// NFON Service Portal API POST example: Create a phone book entry
//
// What it does:
// Sends a POST request to create a new phone book entry for a customer account.
//
// Steps to run:
// 1. Set environment variables:
//    Linux/macOS:        export API_KEY_ID='<YOUR API KEY ID>'
//                        export API_KEY_SECRET='<YOUR API KEY SECRET>'
//                        export CUSTOMER_ACCOUNT='<YOUR CUSTOMER ACCOUNT>'
//    Windows CMD:        set API_KEY_ID=<YOUR API KEY ID>
//                        set API_KEY_SECRET=<YOUR API KEY SECRET>
//                        set CUSTOMER_ACCOUNT=<YOUR CUSTOMER ACCOUNT>
//    Windows PowerShell: $env:API_KEY_ID='<YOUR API KEY ID>'
//                        $env:API_KEY_SECRET='<YOUR API KEY SECRET>'
//                        $env:CUSTOMER_ACCOUNT='<YOUR CUSTOMER ACCOUNT>'
// 2. Run: node post-phone-books.example.mjs
//
// Requirements:
// - Node.js 18+

import crypto from 'crypto';

// TODO: Change these values to match your application
const appName = 'NFON-GitHub-Example';  // Replace with your application name
const appVersion = '1.0';               // Replace with your application version

const API_KEY_ID = process.env.API_KEY_ID;
const API_KEY_SECRET = process.env.API_KEY_SECRET;
const CUSTOMER_ACCOUNT = process.env.CUSTOMER_ACCOUNT;

if (!API_KEY_ID || !API_KEY_SECRET || !CUSTOMER_ACCOUNT) {
  console.error('Error: API_KEY_ID, API_KEY_SECRET, and CUSTOMER_ACCOUNT environment variables must be set');
  process.exit(1);
}

const userAgent = `${appName}/${appVersion} (${CUSTOMER_ACCOUNT})`;

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
    'Content-MD5': contentMD5,
    'User-Agent': userAgent
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
