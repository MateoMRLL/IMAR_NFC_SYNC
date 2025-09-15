# Backend README

Short description: This backend follows the MVC pattern, structured as Route → Controller → Service → Model.

## Configuration

---

Create a `.env` file at the project root under `IMAR_NFC/` and add your environment variables:

    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=password
    DB_NAME=database_name

## Project Structure

```bash

backend/ #backend NFC project
├── routes/ # Route definitions
│ └── ...
├── controllers/ # Controller logic
│ └── ...
├── services/ # Business logic and communication with models
│ └── ...
├── models/ # Schemas and models
│ └── ...
├── utils/
│ └── mailer.js # Mailer configuration
│ └── dataSender.js # Send data to update.php
│ └── dataGetter.js # Get data to get.php
├── docs/ # Swagger configuration
│ └── schemas.js
├── config/ # Swagger and database configuration
│ └── database.js
│ └── swagger.js
├── backend.js # Application entry point
├── package.json
└── package-lock.json

database/
├── createDatabase.js # Create database
├── dropTables.js # Drop tables
├── initDatabase.js # Creates tables
└── overviewDatabase.js # Show database

php-server/ #This folder is not important for the project because it's already online and the RPI only need backend to work
├── get.php # PHP GET listener for the server
├── update.php #PHP POST listener for the server
└── nfc_project/ # Work in progress (frontend project)


raspberry-setup/ #This folder is important for setting up the project from scratch
├── docker-installer.sh # Download docker and docker-compose
├── setup.php # Setting up portainer, npm, node, mysql container...
└── nfc_project/ # Work in progress (frontend project)

.env # You must create .env file
.gitignore
Dockerfile # Dockerfile Setup
docker-compose.yml #Docker compose setup
README.md

```

---

## Running the Application

---

For this project I'm using Docker to deploy the backend on the Raspberry Pi.
I made an ansible script to automatize deployement (see the general readme).

The server will be accessible at `http://rpi_ip_address:PORT`.

And it's possible to access routes documentation using `http://rpi_ip_address:SWAGGER_PORT` (in order to test routes using Postman for example).
