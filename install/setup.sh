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
# Detect project root
# ================================
MAIN_PROJECT_DIR="$(dirname "$(dirname "$(realpath "$0")")")"
PROJECT_DIR="$MAIN_PROJECT_DIR/mysql-container-folder"
MYSQL_CONTAINER_NAME="mysql-container"
NETWORK_NAME="nfc_network"
DB_NAME="nfc_database"
DB_USER="nfc_user"

echo -e "${BLUE}Project root: $MAIN_PROJECT_DIR${NC}"

# ================================
# 1. MySQL passwords
# ================================
read -sp "Enter MySQL root password (leave empty to generate): " MYSQL_ROOT_PASSWORD
if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
    MYSQL_ROOT_PASSWORD=$(openssl rand -base64 16)
    echo -e "\n${YELLOW}Generated MySQL root password: $MYSQL_ROOT_PASSWORD${NC}"
fi

read -sp "Enter MySQL password for $DB_USER (leave empty to generate): " MYSQL_USER_PASSWORD
if [ -z "$MYSQL_USER_PASSWORD" ]; then
    MYSQL_USER_PASSWORD=$(openssl rand -base64 16)
    echo -e "\n${YELLOW}Generated password for $DB_USER: $MYSQL_USER_PASSWORD${NC}"
fi

# ================================
# 2. System update
# ================================

echo -e "${BLUE}=== Time updating ===${NC}"
sudo timedatectl set-ntp true
sudo systemctl restart systemd-timesyncd

echo -e "${BLUE}Updating system...${NC}"
sudo apt update && sudo apt upgrade -y

# ================================
# 3. Create Docker network
# ================================
if ! docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
    docker network create "$NETWORK_NAME"
    echo -e "${GREEN}Docker network $NETWORK_NAME created${NC}"
else
    echo -e "${YELLOW}Docker network $NETWORK_NAME already exists${NC}"
fi

# ================================
# 4. MySQL Docker setup
# ================================
mkdir -p "$PROJECT_DIR"
cat > "$PROJECT_DIR/.env" <<EOL
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD
MYSQL_CONTAINER_NAME=$MYSQL_CONTAINER_NAME
NETWORK_NAME=$NETWORK_NAME
EOL

cat > "$PROJECT_DIR/docker-compose.yml" <<EOL
services:
  mysql:
    image: mysql:latest
    container_name: \${MYSQL_CONTAINER_NAME}
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: $DB_NAME
      MYSQL_USER: $DB_USER
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

cd "$PROJECT_DIR"
docker compose up -d --build
cd - >/dev/null

# ================================
# 5. Portainer
# ================================
if ! docker ps -a --format '{{.Names}}' | grep -q "^portainer$"; then
    docker volume create portainer_data
    docker run -d \
        -p 9000:9443 \
        -p 8000:8000 \
        --name portainer \
        --restart=always \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v portainer_data:/data \
        portainer/portainer-ce:latest
    echo -e "${GREEN}Portainer installed (http://<YOUR_SERVER_IP>:9000)${NC}"
else
    echo -e "${YELLOW}Portainer already running, skipping${NC}"
fi

# ================================
# 6. Project .env
# ================================
cat > "$MAIN_PROJECT_DIR/.env" <<EOL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$MYSQL_USER_PASSWORD

GMAIL_USER=noreplynfc.imar@gmail.com
GMAIL_APP_PASSWORD=eqhsvcfvotzcojce
EOL

grep -qxF ".env" "$MAIN_PROJECT_DIR/.gitignore" || echo ".env" >> "$MAIN_PROJECT_DIR/.gitignore"

# ================================
# 7. Node.js and dependencies
# ================================
sudo apt install -y nodejs npm

for DIR in "$MAIN_PROJECT_DIR/database" "$MAIN_PROJECT_DIR/backend"; do
    if [ -f "$DIR/package.json" ]; then
        echo -e "${BLUE}Installing npm dependencies in $DIR...${NC}"
        cd "$DIR"
        npm install
        cd - >/dev/null
    fi
done

# ================================
# Recap
# ================================
echo -e "\n${GREEN}=== Setup completed! ===${NC}"
echo "MySQL root password: $MYSQL_ROOT_PASSWORD"
echo "MySQL $DB_USER password: $MYSQL_USER_PASSWORD"
echo -e "\nRun ${YELLOW}./install/start.sh${NC} to initialize DB and start services."
