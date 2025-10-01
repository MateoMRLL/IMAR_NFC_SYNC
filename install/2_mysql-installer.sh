#!/bin/bash
# MySQL installer  for Raspberry Pi and Debian x86_64 (first setup - specific for this project)
# Matéo MARILL

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
PROJECT_DIR="$(dirname "$(dirname "$(realpath "$0")")")"
MYSQL_DIR="$(dirname "$PROJECT_DIR")/mysql-folder"
MYSQL_CONTAINER_NAME="mysql-container"

echo -e "${BLUE}Project dir: $PROJECT_DIR${NC}"
echo -e "${BLUE}MySQL dir: $MYSQL_DIR${NC}"

# ================================
# 1. MySQL root password
# ================================
read -sp "Enter MySQL root password (leave empty to generate): " MYSQL_ROOT_PASSWORD
if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
    MYSQL_ROOT_PASSWORD=$(openssl rand -base64 16)
    echo -e "\n${YELLOW}Generated MySQL root password: $MYSQL_ROOT_PASSWORD${NC}"
fi

# ================================
# 2. System update
# ================================
echo -e "${BLUE}Updating system...${NC}"
sudo apt update -y

# ================================
# 3. Prepare MySQL folder
# ================================
mkdir -p "$MYSQL_DIR"

# .env file
cat > "$MYSQL_DIR/.env" <<EOL
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD
MYSQL_CONTAINER_NAME=$MYSQL_CONTAINER_NAME
EOL

# Minimal docker-compose.yml
cat > "$MYSQL_DIR/docker-compose.yml" <<EOL
services:
  mysql:
    image: mysql:latest
    container_name: \${MYSQL_CONTAINER_NAME}
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-uroot", "-p\${MYSQL_ROOT_PASSWORD}"]
      interval: 5s
      retries: 10
      start_period: 20s

volumes:
  mysql_data:
EOL

# ================================
# 4. Remove any existing container
# ================================
cd "$MYSQL_DIR"

if docker ps -a --format '{{.Names}}' | grep -q "^$MYSQL_CONTAINER_NAME$"; then
    echo -e "${YELLOW}Container $MYSQL_CONTAINER_NAME already exists. Stopping and removing...${NC}"
    docker compose down -v
else
    echo -e "${GREEN}No existing MySQL container found${NC}"
fi

# ================================
# 5. Launch container
# ================================
docker compose up -d
cd - >/dev/null
