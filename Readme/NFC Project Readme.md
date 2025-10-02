# NFC IMAR Project

**Project:** NFC IMAR project  
**Date:** 2025-09-16  
**Author(s):** MARILL Matéo

This project is a rework of an NFC system originally developed by an IMAR intern. The goal is to read NFC tags using an **ESP32 kit** with an **RFID-RC522 module**, send the data through Wi-Fi, and store it in a backend server.

The intern’s initial implementation included an **Arduino firmware**, a **Flask server**, and an **HTML/CSS web app**. When I inherited the project, I decided to rebuild it from scratch to improve the project and adding features.

---

## Requirements

### Raspberry Pi

On the Raspberry Pi there are a few packages to install but you don't need to bother with this I created Bash files to automate setting up the project.

All you need is to follow [NFC Project Protocol](NFC%20Project%20Protocol.md)

### Arduino

- Arduino IDE
  - Extensions:
    - ArduinoJson
    - MFRC522 by GitHub Community

I decided to change and use Vscode with Platformio extension [Platformio Extension](Platformio%20Extension.md)

---

## Setup & Tools (just for information)

### Backend

- Node.js with Express.js
- MySQL (local database)
- Docker used to run database and services in containers
- Postman used for testing API endpoints

### (local) Frontend

- React (using Vite template)

### (cloud) Frontend

- PHP

### Firmware

- Raspberry Pi 3 with 64-bit OS Lite
- Arduino IDE for ESP32
- RC522 library for NFC module

### Deployment

During this project, I experimented with different deployment methods while programming.

At first, I tried using **Ansible** to automate deployment on the Raspberry Pi.  
However, this approach turned out to be unnecessary for the current scope of the project.

Instead, I created **bash installation scripts**, which are now used for setup and deployment.

---

## Architecture & Design Pattern

The backend follows a **Model → Service → Controller → Route** pattern.  
This structure ensures clear separation of concerns:

- **Models**: Define database structure and ORM logic
- **Services**: Handle business logic and data processing
- **Controllers**: Manage incoming requests and responses
- **Routes**: Define API endpoints and connect them to controllers

---

## Features

- Read NFC tags with ESP32 + RC522
- Send data over Wi-Fi to a backend server on Raspberry Pi
- Organized MVC backend structure for better data flow control
- Local MySQL database
- Cloud database synchronization using POST requests to a PHP API
- React frontend for managing data (tags, users, login information, etc.)
- Php cloud frontend for managing data

---

## Project Structure

Here is the architecture of the git repository : [NFC Project Architecture](NFC%20Project%20Architecture.md)

---

## Cloud Database Communication

Since direct SSH access was not available, communication with the cloud database is handled using a PHP API hosted on the server.

- A helper function sends POST requests with:
  - resource → the database table
  - payload → the content to insert
- The PHP file on the server processes the request and inserts the data into the cloud database (managed via PHPMyAdmin).

This approach allows local-first saving with synchronization to the cloud, improving reliability.

---

## Improvments

### Local vs Cloud Authority

The current system works as follows:

- A user is first created locally (with a local ID).
- The backend then sends a POST request with the user’s information (local ID, name, email) to the cloud.
- The cloud verifies the data and inserts it into its own database, creating a new **cloud ID**.
- This cloud ID is returned to the backend and stored locally, linking the two databases.

**Why it’s good:**

- Provides offline resilience by saving data locally before syncing.
- Ensures validation and consistency when the cloud re-verifies the data.

**Why it’s bad:**

- Increases complexity with dual IDs and synchronization logic.
- Risk of desynchronization if cloud sync fails or is delayed (update : there is a special route http://IP:5000/api/sync/all made for syncing data from Cloud to local).

### Creating Cloud Database

To create Cloud Database I used MySQL script in the database directly, it must be possible to create a code to automate insert through PHP Post request.
I didn't do it because it's not a big database but for future project, it will be better to set up this.

---

## Acknowledgments

- Original NFC project by IMAR intern
- IMAR team for support and server integration guidance
