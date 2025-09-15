#!/bin/bash
set -e

# ================================
# Colors
# ================================
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
RED="\033[1;31m"
BLUE="\033[1;34m"
NC="\033[0m"

# ================================
# Paths
# ================================
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MYSQL_DIR="$HOME/Documents/mysql-folder"   # MySQL folder outside project
mkdir -p "$MYSQL_DIR"

MYSQL_ENV_FILE="$MYSQL_DIR/.env"
COMPOSE_FILE="$MYSQL_DIR/docker-compose.yml"
MYSQL_CONTAINER_NAME="mysql-container"
NETWORK_NAME="nfc_network"

# ================================
# System update
# ================================
echo -e "${BLUE}=== Updating system and time ===${NC}"
sudo timedatectl set-ntp true
sudo systemctl restart systemd-timesyncd
sudo apt update && sudo apt upgrade -y

# ================================
# MySQL passwords
# ================================
read -sp "Enter MySQL root password (or leave empty to generate one): " MYSQL_ROOT_PASSWORD
echo
if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
    MYSQL_ROOT_PASSWORD=$(openssl rand -base64 16)
    echo -e "${YELLOW}Generated MySQL root password: $MYSQL_ROOT_PASSWORD${NC}"
fi

read -sp "Enter MySQL user password for nfc_user (or leave empty to generate one): " MYSQL_USER_PASSWORD
echo
if [ -z "$MYSQL_USER_PASSWORD" ]; then
    MYSQL_USER_PASSWORD=$(openssl rand -base64 16)
    echo -e "${YELLOW}Generated password for nfc_user: $MYSQL_USER_PASSWORD${NC}"
fi

# ================================
# Create MySQL .env
# ================================
echo -e "${BLUE}Creating MySQL .env in $MYSQL_DIR...${NC}"
cat > "$MYSQL_ENV_FILE" <<EOL
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD
MYSQL_CONTAINER_NAME=$MYSQL_CONTAINER_NAME
NETWORK_NAME=$NETWORK_NAME
EOL
echo -e "${GREEN}MySQL .env created at $MYSQL_ENV_FILE${NC}"


# ================================
# Create project .env (nfc_project/.env)
# ================================
# Assure-toi que le dossier existe et que l'on peut y écrire
mkdir -p "$MAIN_PROJECT_DIR"
if [ ! -w "$MAIN_PROJECT_DIR" ]; then
    echo -e "${RED}Error: Cannot write to $MAIN_PROJECT_DIR${NC}"
    exit 1
fi

PROJECT_ENV_FILE="$MAIN_PROJECT_DIR/.env"
echo -e "${BLUE}Creating project .env in $MAIN_PROJECT_DIR...${NC}"

cat > "$PROJECT_ENV_FILE" <<EOL
# Database connection
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nfc_database
DB_USER=nfc_user
DB_PASSWORD=$MYSQL_USER_PASSWORD

# Gmail SMTP
GMAIL_USER=noreplynfc.imar@gmail.com
GMAIL_APP_PASSWORD=eqhsvcfvotzcojce
EOL

# Add to .gitignore if not already
if ! grep -qxF ".env" "$MAIN_PROJECT_DIR/.gitignore"; then
    echo ".env" >> "$MAIN_PROJECT_DIR/.gitignore"
fi

echo -e "${GREEN}Project .env created and added to .gitignore${NC}"



# ================================
# Docker network
# ================================
if ! docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
    echo "Creating Docker network: $NETWORK_NAME"
    docker network create "$NETWORK_NAME"
else
    echo "Docker network $NETWORK_NAME already exists, skipping."
fi

# ================================
# Docker compose for MySQL
# ================================
echo -e "${BLUE}Creating docker-compose.yml in $MYSQL_DIR...${NC}"
cat > "$COMPOSE_FILE" <<EOL

services:
  mysql:
    image: mysql:latest
    container_name: \${MYSQL_CONTAINER_NAME}
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: nfc_database
      MYSQL_USER: nfc_user
      MYSQL_PASSWORD: $MYSQL_USER_PASSWORD
    ports:
      - "3306:3306"
    networks:
      - $NETWORK_NAME
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-uroot", "-p\${MYSQL_ROOT_PASSWORD}"]
      interval: 5s
      retries: 10
      start_period: 20s

networks:
  $NETWORK_NAME:
    driver: bridge

volumes:
  mysql_data:
EOL
echo -e "${GREEN}docker-compose.yml created successfully!${NC}"

# ================================
# Launch MySQL
# ================================
cd "$MYSQL_DIR"
docker compose up -d --build

echo "Waiting for MySQL container to be healthy..."
MAX_RETRIES=50
RETRY=0
until [ "$(docker inspect -f '{{.State.Health.Status}}' $MYSQL_CONTAINER_NAME)" == "healthy" ]; do
    RETRY=$((RETRY+1))
    if [ $RETRY -ge $MAX_RETRIES ]; then
        echo -e "${RED}MySQL did not become healthy in time. Exiting.${NC}"
        exit 1
    fi
    echo "MySQL not healthy yet... retrying ($RETRY/$MAX_RETRIES)"
    sleep 2
done
echo -e "${GREEN}MySQL container is healthy and ready!${NC}"

# ================================
# Portainer
# ================================
echo -e "${BLUE}=== Installing Portainer ===${NC}"
if ! docker volume inspect portainer_data >/dev/null 2>&1; then
    docker volume create portainer_data
fi

if ! docker ps -a --format '{{.Names}}' | grep -q "^portainer$"; then
    docker run -d \
      -p 9000:9443 \
      -p 8000:8000 \
      --name portainer \
      --restart=always \
      -v /var/run/docker.sock:/var/run/docker.sock \
      -v portainer_data:/data \
      portainer/portainer-ce:latest
fi
echo -e "${GREEN}Portainer setup completed! Access at http://<YOUR_SERVER_IP>:9000${NC}"

# ================================
# Node.js and npm
# ================================
echo -e "${BLUE}=== Installing Node.js and npm ===${NC}"
sudo apt install nodejs npm -y
echo -e "${GREEN}Node.js and npm installed successfully!${NC}"
