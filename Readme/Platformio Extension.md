# VSCode Project Setup with PlatformIO

**Project:** NFC IMAR project  
**Date:** 2025-09-16  
**Author(s):** MARILL Matéo

## Steps to Follow

- [ ] **Install PlatformIO**

  - Go to the VSCode marketplace and install the PlatformIO extension.

- [ ] **Create a New Project**

  - Select `Create New Project`.
  - Enter the **project name** and choose the **board: DOIT DEVKIT V1**.
  - Wait for the project generation.

- [ ] **Add Libraries**

  - Go to `PIO Home > Libraries`.
  - Add the following libraries to the project (Arduino):
    - **ArduinoJSON** by Benoît Blanchon  
      [Official site](https://arduinojson.org/?utm_source=meta&utm_medium=library.properties)
    - **MFRC522** by Miguel Balboa  
      [GitHub](https://github.com/miguelbalboa/rfid)

  > If you can't find the libraries in PlatformIO, you can add them directly at the end of the `platformio.ini` file:

```ini
lib_deps =
    bblanchon/ArduinoJson@^7.4.2
    miguelbalboa/MFRC522@^1.4.12
```

- [ ] **Build** using the play icon
- [ ]
