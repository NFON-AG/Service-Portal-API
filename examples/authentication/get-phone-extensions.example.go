/**
 * Copyright (c) 2025 NFON AG
 * NFON Service Portal API GET example: Retrieve phone extensions
 *
 * What it does:
 * Sends a GET request to retrieve a list of phone extensions for a customer account.
 *
 * Steps to run:
 * 1. Enter your API_KEY_ID, API_KEY_SECRET, CUSTOMER_ACCOUNT
 * 2. Run: go run get-phone-extensions.example.go
 *
 * Requirements:
 * - Go 1.13+
 */

package main

import (
	"crypto/hmac"
	"crypto/sha1"
	"encoding/base64"
	"fmt"
	"io"
	"net/http"
	"time"
)

const (
	APIKeyID     = "<YourAPIKeyId>"
	APIKeySecret = "<YourAPIKeySecret>"
	CustomerID   = "<YourCustomerAccount>"
	BaseURL      = "https://portal-api.nfon.net:8090"
)

func main() {
	method := "GET"
	path := fmt.Sprintf("/api/customers/%s/targets/phone-extensions", CustomerID)

	// Step 1: Create RFC 2616-compliant date header
	date := time.Now().UTC().Format(http.TimeFormat)

	// Step 2: Build StringToSign (GET does not include Content-MD5 or Content-Type)
	stringToSign := fmt.Sprintf("%s\n%s\n%s", method, date, path)

	// Step 3: Sign using HMAC-SHA1 with your API secret
	h := hmac.New(sha1.New, []byte(APIKeySecret))
	h.Write([]byte(stringToSign))
	signature := base64.StdEncoding.EncodeToString(h.Sum(nil))

	// Step 4: Send the request
	req, err := http.NewRequest(method, BaseURL+path, nil)
	if err != nil {
		panic(err)
	}
	req.Header.Set("Authorization", fmt.Sprintf("NFON-API %s:%s", APIKeyID, signature))
	req.Header.Set("x-nfon-date", date)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	// Step 5: Parse and display response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return
	}

	fmt.Println("Status:", resp.Status)
	fmt.Println("Response:", string(body))
}
