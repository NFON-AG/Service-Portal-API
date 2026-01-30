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
// NFON Service Portal API POST example: Create phone book entry
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
// 2. Compile and run: java NfonPostPhoneBooksExample.java
//
// Requirements:
// - Java 11+

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.*;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.security.MessageDigest;

public class NfonPostPhoneBooksExample {

    private static final String API_KEY_ID = System.getenv("API_KEY_ID");
    private static final String API_KEY_SECRET = System.getenv("API_KEY_SECRET");
    private static final String CUSTOMER_ID = System.getenv("CUSTOMER_ACCOUNT");
    private static final String BASE_URL = "https://portal-api.nfon.net:8090";

    public static void main(String[] args) throws Exception {

        if (API_KEY_ID == null || API_KEY_ID.isEmpty() || 
            API_KEY_SECRET == null || API_KEY_SECRET.isEmpty() || 
            CUSTOMER_ID == null || CUSTOMER_ID.isEmpty()) {
            System.err.println("Error: API_KEY_ID, API_KEY_SECRET, and CUSTOMER_ACCOUNT environment variables must be set");
            System.exit(1);
        }

        String method = "POST";
        String path = "/api/customers/" + CUSTOMER_ID + "/phone-books";
        String contentType = "application/json";

        // Step 1: Prepare JSON body
        String body = """
            {
              "data": [
                { "name": "displayName", "value": "John Doe" },
                { "name": "displayNumber", "value": "+49 (176) 12345678" }
              ]
            }
            """;

        // Step 2: Compute hex-encoded MD5 of body
        MessageDigest md5 = MessageDigest.getInstance("MD5");
        String contentMD5 = bytesToHex(md5.digest(body.getBytes()));

        // Step 3: Create RFC 2616-compliant date
        String date = ZonedDateTime.now().format(DateTimeFormatter.RFC_1123_DATE_TIME);

        // Step 4: Build StringToSign
        String stringToSign = method + "\n" + contentMD5 + "\n" + contentType + "\n" + date + "\n" + path;

        // Step 5: Sign with HMAC-SHA1
        Mac mac = Mac.getInstance("HmacSHA1");
        mac.init(new SecretKeySpec(API_KEY_SECRET.getBytes(), "HmacSHA1"));
        String signature = Base64.getEncoder().encodeToString(mac.doFinal(stringToSign.getBytes()));

        // Step 6: Build and send request
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + path))
                .method(method, HttpRequest.BodyPublishers.ofString(body))
                .header("Authorization", "NFON-API " + API_KEY_ID + ":" + signature)
                .header("x-nfon-date", date)
                .header("Content-Type", contentType)
                .header("Content-MD5", contentMD5)
                .version(HttpClient.Version.HTTP_1_1)
                .build();

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(java.time.Duration.ofSeconds(5))
                .build();

        try {
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
 
            // Step 7: Print result
            System.out.println("Status: " + response.statusCode());
            System.out.println("Response: " + response.body());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes)
            sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
