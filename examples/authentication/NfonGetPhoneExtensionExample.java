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
// 2. Compile and run: java NfonGetPhoneExtensionExample.java
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

public class NfonGetPhoneExtensionExample {

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

        String method = "GET";
        String path = "/api/customers/" + CUSTOMER_ID + "/targets/phone-extensions";

        // Step 1: Create RFC 2616-compliant date
        String date = ZonedDateTime.now().format(DateTimeFormatter.RFC_1123_DATE_TIME);

        // Step 2: Build StringToSign
        String stringToSign = method + "\n" + date + "\n" + path;

        // Step 3: Sign using HMAC-SHA1 with API secret
        Mac mac = Mac.getInstance("HmacSHA1");
        mac.init(new SecretKeySpec(API_KEY_SECRET.getBytes(), "HmacSHA1"));
        String signature = Base64.getEncoder().encodeToString(mac.doFinal(stringToSign.getBytes()));

        // Step 4: Send the request using Java 11 HttpClient
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + path))
                .method(method, HttpRequest.BodyPublishers.noBody())
                .header("Authorization", "NFON-API " + API_KEY_ID + ":" + signature)
                .header("x-nfon-date", date)
                .version(HttpClient.Version.HTTP_1_1)
                .build();

        HttpClient client = HttpClient.newHttpClient();
        try {
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            // Step 5: Parse and display response
            System.out.println("Status: " + response.statusCode());
            System.out.println("Response: " + response.body());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
