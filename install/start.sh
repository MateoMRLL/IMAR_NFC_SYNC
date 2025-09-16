#!/bin/bash
set -e

GREEN="\033[1;32m"
YELLOW="\033[1;33m"
RED="\033[1;31m"
BLUE="\033[1;34m"
NC="\033[0m"

# Detect project root
MAIN_PROJECT_DIR="$(dirname "$(dirname "$(realpath "$0")")")"
PROJECT_DIR="$MAIN_PROJECT_DIR/mysql-container-folder"
MYSQL_CONTAINER_NAME="mysql-container"
NETWORK_NAME="nfc_network"
DB_USER="nfc_user"
MYSQL_USER_PASSWORD=$(grep DB_PASSWORD "$MAIN_PROJECT_DIR/.env" | cut -d'=' -f2)

# ================================
# Wait for MySQL
# ================================
echo -e "${BLUE}Waiting for MySQL to be ready...${NC}"
MAX_RETRIES=30
RETRY=0
until docker exec "$MYSQL_CONTAINER_NAME" mysqladmin ping -u"$DB_USER" -p"$MYSQL_USER_PASSWORD" --silent &>/dev/null; do
    RETRY=$((RETRY+1))
    if [ $RETRY -ge $MAX_RETRIES ]; then
        echo -e "${RED}MySQL did not become ready. Exiting.${NC}"
        exit 1
    fi
    sleep 2
done
echo -e "${GREEN}MySQL is ready!${NC}"

# ================================
# Init DB
# ================================
DATABASE_DIR="$MAIN_PROJECT_DIR/database"
if [ -f "$DATABASE_DIR/initDatabase.js" ]; then
    echo -e "${BLUE}Initializing database...${NC}"
    cd "$DATABASE_DIR"
    node initDatabase.js
    cd - >/dev/null
fi

# ================================
# Backend + Swagger
# ================================
COMPOSE_MAIN_FILE="$MAIN_PROJECT_DIR/docker-compose.yml"
cat > "$COMPOSE_MAIN_FILE" <<EOL
services:
  backend:
    build:
      context: ./backend
      dockerfile: backend.Dockerfile
    container_name: backend_node
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app/backend
      - /app/node_modules
    env_file:
      - ./.env
    command: ["node", "backend/backend.js"]
    networks:
      - $NETWORK_NAME
    deploy:
      restart_policy:
        condition: always
networks:
  $NETWORK_NAME:
    external: true
EOL

cd "$MAIN_PROJECT_DIR"
docker compose up -d --build

# ================================
# Recap
# ================================
echo -e "${GREEN}Services started!${NC}"
echo "Backend: http://localhost:5000"
echo "Swagger: http://localhost:5000/docs"
