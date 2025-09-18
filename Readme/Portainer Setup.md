**Project:** NFC IMAR project  
**Date:** 2025-09-16  
**Author(s):** MARILL Matéo

---

# First launch

- [ ] Verify where is located Portainer using `docker ps`
- [ ] On your web brower search for `https://RPI_IP:9000/`, connect to the page (even if there is a warning)
- [ ] As it's the first launch you will have a message saying "your Portainer instance timed out for security purposes. To re-enable your Portainer instance, you will need to restart Portainer"
- [ ] Go back to your terminal and use `docker restart portainer`
- [ ] Refresh the page

---

# Create an account

- [ ] Choose your own **username** and **password** unless the Raspberry Pi has not been reset, in that case check `PORTAINER_USER` and `PORTAINER_PASS` in `notsecrets.env`

---

# Manage Docker containers

- [ ] Once you arrive on the welcome page, choose Get Started tile then if you click on local you will see all the containers of the RPI
- [ ] You can manage Docker containers using this page (no need because when I created the bash script `setup.sh` I made sure that everything is created by it's own)
- [ ] If you need to change anything about MySQL configuration, go the `mysql-container-folder` and modify `docker-compose.yml` file. In the same file, there is a .env file that you can check. If you made any changes about MySQL setup, you can run `docker compose up -d --build` to create a new container (make sure to delete the actual container with it's volume and image through line command or using Portainer). Otherwise, use again `setup.sh` to configure another **root MySQL password** and **user MySQL password**.
- [ ] You can check environnement variables in Docker, clicking on the container (if you want to check for passwords)
