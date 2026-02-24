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
// 2. Run: go run post-phone-books.example.go
//
// Requirements:
// - Go 1.13+

package main

import (
	"bytes"
	"crypto/hmac"
	"crypto/md5"
	"crypto/sha1"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

const (
	// TODO: Change these values to match your application
	appName    = "NFON-GitHub-Example" // Replace with your application name
	appVersion = "1.0"                 // Replace with your application version
	baseURL    = "https://portal-api.nfon.net:8090"
)

func main() {
	APIKeyID := os.Getenv("API_KEY_ID")
	APIKeySecret := os.Getenv("API_KEY_SECRET")
	CustomerID := os.Getenv("CUSTOMER_ACCOUNT")
	userAgent := appName + "/" + appVersion + " (" + CustomerID + ")"

	if APIKeyID == "" || APIKeySecret == "" || CustomerID == "" {
		fmt.Println("Error: API_KEY_ID, API_KEY_SECRET, and CUSTOMER_ACCOUNT environment variables must be set")
		os.Exit(1)
	}

	method := "POST"
	path := fmt.Sprintf("/api/customers/%s/phone-books", CustomerID)
	url := baseURL + path
	contentType := "application/json"

	// Step 1: Prepare JSON body
	jsonBody := []byte(`{
		"data": [
			{ "name": "displayName", "value": "John Doe" },
			{ "name": "displayNumber", "value": "+49 (176) 12345678" }
		]
	}`)

	// Step 2: Compute Content-MD5
	md5Sum := md5.Sum(jsonBody)
	contentMD5 := hex.EncodeToString(md5Sum[:])

	// Step 3: Create RFC 2616-compliant date
	date := time.Now().UTC().Format(http.TimeFormat)

	// Step 4: Build StringToSign
	stringToSign := fmt.Sprintf("%s\n%s\n%s\n%s\n%s", method, contentMD5, contentType, date, path)

	// Step 5: Sign with HMAC-SHA1
	h := hmac.New(sha1.New, []byte(APIKeySecret))
	h.Write([]byte(stringToSign))
	signature := base64.StdEncoding.EncodeToString(h.Sum(nil))

	// Step 6: Create POST request
	req, err := http.NewRequest(method, url, bytes.NewReader(jsonBody))
	if err != nil {
		panic(err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("NFON-API %s:%s", APIKeyID, signature))
	req.Header.Set("x-nfon-date", date)
	req.Header.Set("Content-Type", contentType)
	req.Header.Set("Content-MD5", contentMD5)
	req.Header.Set("Content-Length", fmt.Sprintf("%d", len(jsonBody)))
	req.Header.Set("User-Agent", userAgent)

	// Step 7: Execute and print response
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return
	}

	fmt.Println("Status:", resp.Status)
	fmt.Println("Response:", string(body))
}
