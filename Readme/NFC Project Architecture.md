```bash
IMAR_NFC_CLOUD_SYNC
├─ .gitignore
├─ Dockerfile #Docker compose is created in .sh file
├─ backend
│  ├─ backend.js # Main file
│  ├─ config
│  │  ├─ database.js #Database configuration file
│  │  └─ swagger.js #Swagger (API docs) configuration file
│  ├─ controllers #Contains controllers (handle requests and answers)
│  │  ├─ assignController.js
│  │  ├─ authController.js
│  │  ├─ nfcController.js
│  │  ├─ tagController.js
│  │  └─ userController.js
│  ├─ docs #Swagger configuration
│  │  └─ schemas.js
│  ├─ models #Contains models (queries to the local database)
│  │  ├─ assignModel.js
│  │  ├─ logsModel.js
│  │  ├─ tagModel.js
│  │  └─ userModel.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ routes #Contains routes (defining routes and links to the controller)
│  │  ├─ assignRoutes.js
│  │  ├─ authRoutes.js
│  │  ├─ nfcRoutes.js
│  │  ├─ tagRoutes.js
│  │  └─ userRoutes.js
│  ├─ services #Contains services (making the links between models and controllers and implement logic)
│  │  ├─ assignService.js
│  │  ├─ authService.js
│  │  ├─ nfcService.js
│  │  ├─ tagService.js
│  │  └─ userService.js
│  └─ utils
│     ├─ dataGetter.js #Get data from the PHP Page get.php on the cloud server
│     ├─ dataSender.js #Send data to the update.php on the cloud server
│     └─ mailer.js #Manage mailing feature for receiving and sending codes
├─ database #Database related code
│  ├─ createDatabase.js
│  ├─ dropTables.js
│  ├─ initDatabase.js
│  ├─ overviewDatabase.js
│  ├─ package-lock.json
│  └─ package.json
├─ install #Contains bash scripts to setup the project from scratch
│  ├─ docker-installer.sh
│  ├─ setup.sh
│  └─ start.sh
├─ php-server #Contains the content of the folder on the cloud
│  ├─ get.php
│  └─ update.php
└─ notsecrets.env #Contains keys (it's not very secrets because you need to own the Raspberry Pi)
```
