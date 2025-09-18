#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <MFRC522.h>
#include <SPI.h>
#include "main.h"
#include "config.h"

String scanCardUrl = String("http://") + SERVER_IP + ":" + SERVER_PORT + ENDPOINT_SCAN;
String nfcLoginUrl = String("http://") + SERVER_IP + ":" + SERVER_PORT + ENDPOINT_LOGIN;


// Define NFC reader
#define SS_PIN  5  
#define RST_PIN 27  
MFRC522 mfrc522(SS_PIN, RST_PIN);

  void setup() {
    Serial.begin(115200);
    SPI.begin();
    mfrc522.PCD_Init();
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    Serial.print("Connecting to WiFi...");
    while (WiFi.status() != WL_CONNECTED) {
      delay(1000);
      Serial.print(".");
    }
    Serial.println("\nConnected to WiFi");
    Serial.print("ESP32 IP Address: ");
    Serial.println(WiFi.localIP());
  }

  void loop() {
    if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial()) {
      String uid = getCardUID();
      Serial.print(uid);
      Serial.println("Scanning Card...");
      String scanResponse = scanCardWithServer(uid);
      Serial.print(scanResponse);

      if (scanResponse == "Existing card detected. Proceeding to validation.") {
        Serial.println("Card already registered.");
        //loginToServer(uid);
      } else if (scanResponse == "New card registered. Redirecting to registration page.") {
          Serial.println("New card detected. Redirecting to registration page.");
        } 
        mfrc522.PICC_HaltA();
    }
    delay(1000);
  }

  // Function to get NFC card UID
  String getCardUID() {
    String uid = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
      if (mfrc522.uid.uidByte[i] < 0x10) {
        uid += "0";  
      }
      uid += String(mfrc522.uid.uidByte[i], HEX);
    }
    uid.toUpperCase(); 
    Serial.println("Scanned Card UID: " + uid);
    return uid;
  }

  // Function to check if NFC card is registered
  String scanCardWithServer(String uid) {
    if (WiFi.status() == WL_CONNECTED) {  
      HTTPClient http;
      http.begin(scanCardUrl);
      http.addHeader("Content-Type", "application/json");
      StaticJsonDocument<200> jsonDoc;
      jsonDoc["nfc_uid"] = uid.c_str();
      String requestBody;
      serializeJson(jsonDoc, requestBody);
      
      int httpResponseCode = http.POST(requestBody);
      Serial.println("httpResponseCode Body Query: " + requestBody);
      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.println("Response : " + response);
        Serial.println("Server Response: " + response);
        
        // Parser la réponse JSON
        DynamicJsonDocument responseDoc(1024);
        deserializeJson(responseDoc, response);
        String status = responseDoc["status"];
        Serial.println("Status :" + status);
        http.end();
        return status;

      } else {
        Serial.println("HTTP Error: " + String(httpResponseCode));
        http.end();
        return "HTTP_ERROR";
      }
    }
    return "WiFi not connected";
  }

  // Function to handle NFC login (no need)
  void loginToServer(String uid) {
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(nfcLoginUrl);
      http.addHeader("Content-Type", "application/json");

      StaticJsonDocument<200> jsonDoc;  
      jsonDoc["nfc_uid"] = uid;
      String requestBody;
      serializeJson(jsonDoc, requestBody);
      int httpResponseCode = http.POST(requestBody);
      String response = http.getString();
      Serial.println("Login Response: " + response);
      http.end();
    }
  }