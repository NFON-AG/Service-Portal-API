# NFON Service Portal API Usage Manual

- [Introduction](#introduction)
  - [What You Can Do With This API](#what-you-can-do-with-this-api)
  - [Terms of Use](#terms-of-use)
  - [Important Notes](#important-notes)
  - [Support \& Feedback](#support--feedback)
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [API Credentials](#api-credentials)
- [Authentication](#authentication)
  - [Required Headers](#required-headers)
  - [Build the Authorization Header](#build-the-authorization-header)
  - [Build the Signature](#build-the-signature)
- [User-Agent Header](#user-agent-header)
  - [Why is this required?](#why-is-this-required)
  - [Implementation](#implementation)
- [Examples](#examples)
  - [GET/DELETE Request](#getdelete-request)
  - [POST/PUT Request](#postput-request)
- [Postman Collection](#postman-collection)
  - [What’s Included](#whats-included)
  - [Download the Postman Collection](#download-the-postman-collection)
  - [How to Use It](#how-to-use-it)
  - [Troubleshooting Tips](#troubleshooting-tips)

## Introduction

The NFON Service Portal API allows you to view and modify PBX-related (Private Branch Exchange) configurations at account level. 
It powers the backend of the official [NFON Admin Portal](https://admin.nfon.com/) and is now available to external developers for advanced and automated integration needs.

### What You Can Do With This API

Whether you're building tools for your IT team, integrating telephony with third-party services, or managing extensions at scale, this API helps you do more with less manual work.

#### Example use cases include:

- Mass provisioning of PBX extensions
- Syncing extensions and devices with Active Directory
- Automating conference bridge creation and updates
- Integrating external PBX management tools

---

### Terms of Use

By accessing and using the NFON Service Portal API, you agree to the [terms of use](https://www.nfon.com/en/legal/gtc-sla/).

---

### Important Notes

API endpoints may change:
- Please subscribe to `API Breaking Changes` on the [NFON Status page](https://status.nfon.com) for updates.
- Please refer to the [latest API documentation](https://nfon-ag.github.io/Service-Portal-API-Specification).

---

### Support & Feedback

NFON is committed to helping you integrate successfully with our APIs. Depending on the type of request or issue, please use the following channels:

#### Feature Requests

Got ideas to improve the API? Submit feature suggestions via Airfocus:

- [Submit in German language](https://nfon.airfocus.com/share/forms/a429ddf7abf54f6afed82d5a7327e030)
- [Submit in English language](https://nfon.airfocus.com/share/forms/648a1c17a224aa6e8937f8393f4bc21c)

#### Development Help

For best practices, implementation guidance, and community support:

- Join the [NFON Partner Portal](https://partners.nfon.com/)
- Contact your assigned sales representative  

#### Issues & Bugs

For technical issues or suspected bugs, please contact NFON Support directly.

> [!TIP]
> Before submitting a support ticket, please test your use case using the **[Postman Collection](#postman-collection)** and include any relevant request/response output when contacting NFON Support. This improves our ability to assist and continuously improves the collection for all users. Make sure to remove any credentials or sensitive data before sending your support request.

## Quick Start

**Try the API in Minutes:** If you’re new to the NFON Service Portal API, the fastest way to see results is to use our [Postman Collection](#postman-collection) with your requested [API Credentials](https://www.nfon.com/en/integrations/portal-api).

All endpoints require [HMAC-based authentication](#build-the-authorization-header), which can be complex to set up manually — the [Postman Collection](#postman-collection) handles it for you.

## API Endpoints

Check the official [API documentation](https://nfon-ag.github.io/Service-Portal-API-Specification) for latest endpoint references.

- **Base URL**: https://portal-api.nfon.net:8090/ 
- **Architecture**: RESTful API
- **Data Format**: JSON

## API Credentials

To use the NFON Service Portal API, you must first obtain an **API Key ID** and **API Key Secret**.

You can request access on our [NFON Service Portal API product page](https://www.nfon.com/en/integrations/portal-api)
## Authentication

### Required Headers

  - `Authorization` header:
    - Custom HTTP scheme based on a keyed-HMAC (Hash Message Authentication Code)
    - Example: `Authorization: NFON-API <APIKeyId>:<Signature>`

  - `Content-MD5` header:
    - Matching the Content-MD5 in the [signature](#build-the-signature). For `POST` and `PUT` requests only.
    - Example: `a39730b7d46d6c38f1f28c832ea18e12`

  - `Content-Type` header:
    -  Matching the Content-Type in the [signature](#build-the-signature). Required for `POST` and `PUT` requests only.
    -  Example: `application/json`

  - `x-nfon-date` header:
    -  Current date/time in [RFC 2616 format] matching the [date/time the signature](#build-the-signature).
    -  Must be within **±15 minutes** of NFON server time to prevent replay attacks.
    -  Example: `x-nfon-date: Sun, 06 Aug 2025 14:32:00 GMT`

---

### Build the Authorization Header

The NFON Service Portal API uses a custom Authorization HTTP header for secure access to each endpoint.
While the header format is simple in appearance, the signature component requires precise construction.
This section gives you a clear, beginner-friendly overview before diving into implementation.

#### Basic Format

Every API request must include an Authorization header in the following format:

```http
Authorization: NFON-API <APIKeyId>:<Signature>
```

Here’s what each part means:

| Component     | Description                                                                |
| ------------- | -------------------------------------------------------------------------- |
| `NFON-API`    | A fixed prefix identifying the authentication scheme                       |
| `<APIKeyId>`  | The **API Key ID** assigned to you by NFON (not the secret)                |
| `:`           | A required separator between the Key ID and the signature                  |
| `<Signature>` | A cryptographic hash derived from request data and your **API Key Secret** |

> [!TIP]
> The `<Signature>` is the most complex part. 
> It must be calculated using specific request elements and a secure hashing algorithm.
> We’ll break that down in the next section.

##### Example

```http
Authorization: NFON-API 3697ad86-fa77-4b25-9373-02dce48530ff:frJIUN8DYpKDtOLCwo//yllqDzg=
```

---

### Build the Signature

To authenticate with the NFON Service Portal API, you must generate a signature that securely represents the request.
This signature ensures the integrity and authenticity of your request using HMAC encryption.

#### Signature Process Summary

1. **Construct StringToSign** – Concatenate specific request components into a single string.
2. **Hash the StringToSign** – Use HMAC-SHA1 with your API Key Secret as the key.
3. **Base64 encode the hash** – Convert the hash result into a Base64-encoded string.
4. **Add to Authorization Header** 


#### 1. Construct `StringToSign`

To authenticate a request, you must construct a StringToSign that is used to generate the HMAC-SHA1 signature.

```
StringToSign =
  HTTP-Method + "\n" +
  Content-MD5 + "\n" +
  Content-Type + "\n" +
  Date + "\n" +
  Encoded-Resource-Path
```

Each line is separated by a newline character (`\n`).
However, if a field is not required for a given request, it must be completely omitted from the string — including the newline.

| **Element**             | **Description**                                                                                                                                                                                                              | **Examples**                                                                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HTTP-Method`           | The HTTP method of the request, written in **uppercase**.                                                                                                                                                                    | `GET`, `POST`, `PUT`, `DELETE`                                                                                                                        |
| `Content-MD5`           | Required for `POST` and `PUT`: the **hex-encoded MD5 hash** of the request body. <br>Omit entirely (do not include or leave blank) for `GET` and `DELETE`. <br>👉 **Exception**: Omit if the request contains an audio file. | `a39730b7d46d6c38f1f28c832ea18e12`                                                                                                                    |
| `Content-Type`          | Required for `POST` and `PUT`: the exact MIME type of the body. <br>Omit for `GET` and `DELETE`. <br>👉 **Exception**: Omit if the request contains an audio file.                                                           | `application/json`, `audio/x-wav`                                                                                                                     |
| `Date`                  | The current date/time in [RFC 2616 format](https://www.ietf.org/rfc/rfc2616.txt): `Day, DD Mon YYYY HH:MM:SS GMT`. Must be within **±15 minutes** of NFON server time.                                                       | `Tue, 06 Aug 2025 14:32:00 GMT`                                                                                                                       |
| `Encoded-Resource-Path` | The full API resource path, including the query string if present. Special characters must be **URL-encoded** (`+`, `/`, `=`).                                                                                                                 | `/api/customers/K1234/phone-books`<br>`/api/customers/K1234/device-types/Base%20Device`<br>`/api/customers/K1234/phone-books?search=I%20Am%20Encoded` |

#### 2. Hash the `StringToSign`

Once you’ve constructed the StringToSign with the required request elements, the next step is to create a signature that securely verifies the request.

The signature is calculated using the **HMAC-SHA1** algorithm with your `APIKeySecret` as the signing key.

##### Formula

```text
signature = HMAC_SHA1(StringToSign, API_KEY_SECRET)
```

#### 3. Base64 encode the hash

After generating the binary HMAC-SHA1 signature, the final step before sending your request is to Base64 encode the hash. 

This encoding converts the raw binary output into a text format that can be safely included in HTTP headers.

##### Formula

```text
signatureBase64 = Base64Encode(signature)
```

#### Important Notes

- Omit Unused Fields: If a field is not required for your request, do not include it at all in the StringToSign — no empty strings, no placeholder newlines.
- Do Not Reorder Fields: The order of included fields must match the expected order (as shown above).
- Exact Match Required: Values in the StringToSign must match the actual request headers and body exactly (case-sensitive, encoded, etc.).
- Audio Upload Exception: For requests including audio file content, omit both Content-MD5 and Content-Type, regardless of HTTP method.

#### Common Signature Errors 

- Incorrect field order or inclusion in StringToSign
- Mismatched values between headers and StringToSign
- Using MD5/Base64 encoding incorrectly
- Signature expired (timestamp is outside ±15 minutes)
- Special characters are not URL-encoded (`+`, `/`, `=`)

## User-Agent Header

When integrating with the NFON Service Portal API, please include a User-Agent header in all HTTP requests with the following format:

```
<productname>/<productversion> (<K-Account>)
```

Example:
```
my-crm-app/1.5.1 (KXXXX)
```

### Why is this required?

Including your application name, version, and account in the User-Agent helps NFON's technical support team:

- Quickly identify your application in case of issues or unusual activity
- Provide faster support by understanding which integration is affected
- Contact you proactively if we detect any problems with your integration

### Implementation

All code examples in this repository include configurable constants at the top of each file:

```go
const (
    appName    = "NFON-GitHub-Example"  // Replace with your application name
    appVersion = "1.0"                          // Replace with your application version
)
```

Simply update these values to match your application before deploying to production.

## Examples

Below you’ll find working examples for API operations using various programming languages.
These are designed to help you get started quickly and understand how to authenticate and interact with the NFON Service Portal API.

> [!TIP]
> **Cannot find your programming language of choice?** We recommend using an **AI assistant** to rewrite the examples in other programming languages.

### GET/DELETE Request 

#### GET example: Retrieve phone extensions

- [with Go (Golang)](./examples/authentication/get-phone-extensions.example.go)
- [with Java](./examples/authentication/NfonGetPhoneExtensionExample.java)
- [with Node.js / Javascript](./examples/authentication/get-phone-extensions.example.mjs)

#### GET example: Pseudocode
```text
Method: GET
Path: /api/customers/K1234/phone-books

Step 1: Prepare request elements
  httpMethod = "GET"
  date = current date in RFC 2616 format
  path = "/api/customers/K1234/phone-books"

Step 2: Build StringToSign
  stringToSign = httpMethod + "\n" +
                 date + "\n" +
                 path

Step 3: Generate Signature
  signature = HMAC_SHA1(stringToSign, API_KEY_SECRET)
  signatureBase64 = Base64Encode(signature)

Step 4: Send request
  Set header "Authorization" to: "NFON-API API_KEY_ID:signatureBase64"
  Set header "x-nfon-date" to: date
  Set header "User-Agent" to: "my-app/1.0 (KXXXX)"
  Send GET request to https://portal-api.nfon.net:8090 + path
```

### POST/PUT Request

#### POST example: Create a phone book entry

- [with Go (Golang)](./examples/authentication/post-phone-books.example.go)
- [with Java](./examples/authentication/NfonPostPhoneBooksExample.java)
- [with Node.js / Javascript](./examples/authentication/post-phone-books.example.mjs)

#### Pseudocode

```text
Method: POST
Path: /api/customers/K1234/phone-books
Body: {
		"data": [
			{ "name": "displayName", "value": "John Doe" },
			{ "name": "displayNumber", "value": "+49 (176) 12345678" }
		]
	}

Step 1: Prepare request elements
  httpMethod = "POST"
  body = JSON.stringify(data)
  contentMD5 = MD5_HEX(body)     # hex-encoded hash of the body
  contentType = "application/json"
  date = current date in RFC 2616 format
  path = "/api/customers/K1234/phone-books"

Step 2: Build StringToSign
  stringToSign = httpMethod + "\n" +
                 contentMD5 + "\n" +
                 contentType + "\n" +
                 date + "\n" +
                 path

Step 3: Generate Signature
  signature = HMAC_SHA1(stringToSign, API_KEY_SECRET)
  signatureBase64 = Base64Encode(signature)

Step 4: Send request
  Set header "Authorization" to: "NFON-API API_KEY_ID:signatureBase64"
  Set header "x-nfon-date" to: date
  Set header "Content-Type" to: contentType
  Set header "Content-MD5" to: contentMD5
  Set header "User-Agent" to: "my-app/1.0 (KXXXX)"
  Send POST request to https://portal-api.nfon.net:8090 + path with body
```

## Postman Collection

NFON offers a comprehensive **Postman Collection** to help you explore and test the Service Portal API easily. It includes **350+ predefined request examples** across all supported endpoints.

### What’s Included

- Prebuilt requests for nearly every API operation
- A sample Postman Environment file
- Useful for debugging, development, and learning the API

---

### Download the Postman Collection

- Download the [Postman Collection](./postman/nfon-service-portal-api.postman_collection.json)
- Download the sample [Postman Environment](./postman/nfon-service-portal-api.postman_environment.json)

---

### How to Use It

**1. Install Postman**

- Download from [postman.com](https://www.postman.com/downloads/)

**2. Import the Collection**

- Open Postman → [`Import`](https://learning.postman.com/docs/designing-and-developing-your-api/importing-an-api/) → select the downloaded collection file

**3. Import the Environment**

- Repeat the import process for the environment file. The imported environment name is `Production Client Account`

**4. Configure Environment Variables**
> [!WARNING]
> **Use only the “Current Value” column in the environment editor** — avoid the “Initial Value” field, as it syncs to the Postman cloud and might expose sensitive values.

- `apiKey` – your NFON API Key ID
- `apiSecret` – your API Key Secret
- `customerId` – your K-Account (Kxxxx), S-Account (Sxxxx) or C-Account (Cxxxx)

Learn more about [Postman Environments](https://learning.postman.com/docs/sending-requests/variables/environment-variables/)

**5. Select the Environment**

- Use the `Production Client Account` environment dropdown (top-right in Postman) to activate the imported environment

**6. Send Your First Request**

- Try the General → API Version request
  - If it returns 403 Forbidden, check your environment values and ensure you selected the correct environment. 
  - Also confirm that your system clock is correct, as the NFON Service Portal API requires timestamps within ±15 minutes.

**7. Explore More**
- For example:
  `Targets` → `/api/customers/{{customerId}}/targets/`
- Just click `Send` to run the requests

---

### Troubleshooting Tips
If you get unexpected responses (e.g. 403, 401), verify:
- The `Production Client Account` environment is selected
- `apiKey`, `apiSecret`, and `customerId` are set correctly
- The time on your machine is synced (for date header validity)

