# Raspberry Pi Password Reset Protocol

**Date:** 2025-09-16  
**Author:** Matéo MARILL  

---

## Required Materials

- Raspberry Pi
    
- SD card with Raspberry Pi OS
    
- Computer with SD card reader
    

---

## Step 1: Prepare the SD Card

1. Power off the Raspberry Pi.
    
2. Remove the SD card and insert it into a computer.
    
3. Open the **`boot`** partition of the SD card.
    

---

## Step 2: Modify Boot Configuration

1. Open the `cmdline.txt` file with a text editor.
    
2. Add the following at the **end of the line** (all in one line):
    
    ```
    init=/bin/sh
    ```
    
3. Save the file and safely eject the SD card.
    
4. Insert the SD card back into the Raspberry Pi and power it on.
    

---

## Step 3: Reset the Password

1. Once in the root shell, remount the system in read/write mode:
    
    ```bash
    mount -o remount,rw /
    ```
    
2. Reset the password for the `pi` user (or another user if different):
    
    ```bash
    passwd pi
    ```
    
3. Enter the new password twice.
    

---

## Step 4: Restore Normal Boot

1. Remove the `init=/bin/sh` modification from `cmdline.txt` (if not already done) by editing it again from another computer.
    
2. Reboot normally:
    
    ```bash
    exec /sbin/init
    ```
    
    or
    
    ```bash
    reboot
    ```
    

---

## Step 5: Log In

- The Raspberry Pi should now boot normally.
    
- Log in using the **new password**.