#!/bin/bash
# Universal Docker installer for Raspberry Pi and Debian x86_64
# Matéo MARILL

set -e

# Color definitions
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
RED="\033[1;31m"
BLUE="\033[1;34m"
NC="\033[0m"

echo -e "${BLUE}=== Updating system ===${NC}"
sudo apt update && sudo apt upgrade -y

echo -e "${BLUE}=== Installing prerequisites ===${NC}"
sudo apt install -y curl git apt-transport-https ca-certificates gnupg lsb-release 

# Check if Docker is already installed
if command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker is already installed: $(docker --version)${NC}"
else
    echo -e "${BLUE}=== Installing Docker using the official script ===${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo chmod +x get-docker.sh
    sudo ./get-docker.sh
    echo -e "${GREEN}Docker installed successfully!${NC}"
fi

# Verify Docker
echo -e "${BLUE}=== Verifying Docker installation ===${NC}"
docker --version || { echo -e "${RED}Docker installation failed!${NC}"; exit 1; }
docker compose version || echo -e "${YELLOW}Docker Compose not available${NC}"


echo -e "${BLUE}=== Adding current user to docker group ===${NC}"
sudo usermod -aG docker $USER
groups $USER

echo -e "${BLUE}=== Enabling and starting Docker service ===${NC}"
sudo systemctl enable docker
sudo systemctl start docker

echo -e "${BLUE}=== Reboot to make changes work ===${NC}"
sudo reboot

