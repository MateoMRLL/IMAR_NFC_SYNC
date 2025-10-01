# Project Setup and Deployment Protocol

**Project:** NFC IMAR project  
**Date:** 2025-09-16  
**Author(s):** MARILL Matéo

---

## 1. Objective

Set up the complete environment for the project so that backend, frontend, and services run correctly.

---

## 2. Prerequisites

- Ensure you have access to the hardware: computer, Raspberry Pi (RPI), router.
- Prepare supported OS: Linux or Windows.
- Install base software if needed: Raspberry Pi OS Imager.
- SD Reader Card

---

## 3. Actions to Perform

> All ids in capslocks are in `notsecrets.env` : username and passwords require to have access to the raspberry PI.

### 3.1 Prepare Environment

- [ ] Power up the router and check access via `http://192.168.100.1/`
  - **Username:** `ROUTER_USER`
  - **Password:** ROUTER_PASS`
- [ ] Flash Raspberry Pi **OS Lite 64 bits ** on SD card.
  - Configure RPI using **Raspberry PI OS Imager** or using your own flashing method (use `raspi-config` for a simple UI to configure raspberry pi after first login):
    - **Hostname:** `RPI_HOSTNAME`
    - **Username:** RPI_USER`
    - **Password:** RPI_PASS`
  - Configure Wi-Fi:
    - **SSID** and **Password:** check `Wireless/Wireless Security Settings` via `http://192.168.100.1`
    - It's also possible to use your own wifi sharing, make sure to configure de Raspberry for it by changing wifi SSID and password (create a `wpa_applicant.conf` file or use `raspi-config`)
  - Configure SSH:
    - Enable it (with password, we will set up it later with SSH Key)
  - Configure language and keyboard (at least for the first login)
- [ ] Insert SD card, connect RPI to a screen and keyboard, and power it on.
- [ ] Login to the RPI using `RPI_USER` and `RPI_PASS`
  - If you don't remember the password, follow [Reset Protocol](Raspberry%20PI%20tips.md#raspberry-pi-password-reset-protocol)
- [ ] Basic verifications on the RPI:
  ```bash
  sudo apt update
  sudo apt upgrade -y #Stay in front of the computer sometimes it asks for confirmation
  sudo apt install openssh-server -y #Sometimes you don't need it but in case do the command
  sudo apt install git -y
  ```
- [ ] SSH Setup:
  - Get the RPI local IP address using `http://192.168.100.1`if you are on this wifi network. If you are using your own wifi connection just make sure to have Raspberry Pi IP local address (ex : your own Wifi network).
  - On your computer use your terminal and `ssh RPI_USER@RPI_IP` and login using `RPI_PASS`
  - type yes
  - then you can add your public SSH Key to the RPI (if you have never set up SSH, follow [SSH](SSH.md))
  - On your computer write on a terminal : `ssh-copy-id RPI_USER@RPI_IP`to send your public key to the RPI and when it's required type your `RPI_PASS`. Now you can unplug your screen.

### 3.2 Git Clone the project

- [ ] Git clone :
  - `git clone "https://github.com/MateoMRLL/IMAR_NFC_SYNC.git" `

### 3.3 Installing procedure

- [ ] Go to install folder and give execution permission:
  - ```bash
    cd IMAR_NFC_SYNC/install
    chmod +x 1_docker-installer.sh 2_mysql_installer.sh 3_mysql_basic_setup.sh 4_project_setup.sh
    ```
- [ ] Run `1_docker-installer.sh` :
  - ```bash
      sudo ./docker-installer.sh
    ```
    This script allows you to check dependencies and install Docker (and Portainer at the end). This script is independant and it's working on Debian system. It should be working on other distros.
  - Don't do anything, it takes some times depending on your internet connection.
  - This script finishes with a reboot ! You need to launch it using sudo because otherwise it will not add the user into the group.
- [ ] Run `2_mysql_installer.sh` (if there is a problem or you are loosing connection don't hesitate to run it again) :
  - ```bash
    ./2_mysql_installer.sh
    ```
    This script allows you to :
    - Set up **Root MySQL Password**,
    - Create .env file for MySQL
    - Remove former container or volume associated with MySQL
    - Create a Docker container for MySQL
- [ ] Run `3_mysql_basic_setup.sh` :
  - ```bash
     ./3_mysql_basic_setup.sh
    ```
    This script allows you to :
    - Create a Docker network (**nfc_network**)
    - Link it to the container previously created (**mysql-container**)
    - Enter your root password
    - Write the name of the database (**nfc**), the user (**nfc_user**), the user password.

At the end of this 3 steps, you will have a **.mysql_setup.env** file in the install folder. It contains, the database host, name, user and password. In the folder **mysql_folder** there is a .env file containing root password and container name.

- [ ] Run `4_project_setup.sh` :
  - ```bash
     ./4_project_setup.sh
    ```
    This script allows you to :
    - Move the .env files to the good place (in the database folder and backend folder)
    - Install dependencies
- [ ] Run `5_start_with_db_init.sh` or `5.5_start_without_db_init.sh` depending on the installation process :
  - ```bash
     ./5_start_with_db_init.sh
    ```
    This script allows you to :
    - Init the database (or not if 5.5)
    - Start the backend server

---
