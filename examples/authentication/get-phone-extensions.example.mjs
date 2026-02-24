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
// NFON Service Portal API GET example: Retrieve phone extensions
//
// What it does:
// Sends a GET request to retrieve a list of phone extensions for a customer account.
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
// 2. Run: node get-phone-extensions.example.mjs
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
const PATH = `/api/customers/${CUSTOMER_ACCOUNT}/targets/phone-extensions`;
const METHOD = 'GET';

// Step 1: Create RFC 2616-compliant date header
const date = new Date().toUTCString();

// Step 2: Build the StringToSign (GET does not include Content-MD5 or Content-Type)
const stringToSign = `${METHOD}\n${date}\n${PATH}`;

// Step 3: Sign using HMAC-SHA1 with your API secret
const signature = crypto.createHmac('sha1', API_KEY_SECRET).update(stringToSign).digest('base64');

// Step 4: Send the request with fetch
const response = await fetch(`${BASE_URL}${PATH}`, {
  method: METHOD,
  headers: {
    'Authorization': `NFON-API ${API_KEY_ID}:${signature}`,
    'x-nfon-date': date,
    'User-Agent': userAgent
  }
});

if (!response.ok) {
	console.error(`Request failed: ${response.status} ${response.statusText}`);
	process.exit(1);
}

// Step 5: Parse and display response
const text = await response.text();
try {
  console.log(JSON.parse(text));
} catch {
  console.log(text);
}
