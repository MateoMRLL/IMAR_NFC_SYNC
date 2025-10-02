#!/bin/bash
# Create local DB given the .env file created thanks to the mysql-basic-setup.sh script and creates Docker container for the backend
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
BACKEND_DIR="$PROJECT_DIR/backend"

# ================================
# Install dependencies
# ================================

for DIR in "$PROJECT_DIR/database" "$PROJECT_DIR/backend"; do
	if [ -f "$DIR/package.json" ]; then
		echo -e "${BLUE}Installing npm dependencies in $DIR...${NC}"
		cd "$DIR"
		npm install
		cd - >/dev/null
	fi
done

# ================================
# Load variables from backend/.mysql_setup.env
# ================================
ENV_FILE="$BACKEND_DIR/.mysql_setup.env"
if [ ! -f "$ENV_FILE" ]; then
	echo -e "${RED}Error: .env file not found in backend folder ($ENV_FILE)${NC}"
	exit 1
fi
export $(grep -v '^#' "$ENV_FILE" | xargs)

MYSQL_CONTAINER_NAME=${MYSQL_CONTAINER_NAME:-mysql-container}
NETWORK_NAME=${NETWORK_NAME:-nfc_network}
DB_USER=${DB_USER:-nfc_user}
MYSQL_USER_PASSWORD=${DB_PASSWORD}

echo -e "${BLUE}Project dir: $PROJECT_DIR${NC}"
echo -e "${BLUE}MySQL dir: $MYSQL_DIR${NC}"

# ================================
# 1. Wait for MySQL and initialize database
# ================================
DATABASE_DIR="$PROJECT_DIR/database"
if [ -f "$DATABASE_DIR/initDatabase.js" ]; then
	echo "Waiting for MySQL to be ready..."
	MAX_RETRIES=60
	RETRY=0
	until docker exec "$MYSQL_CONTAINER_NAME" mysqladmin ping -u"$DB_USER" -p"$MYSQL_USER_PASSWORD" --silent &>/dev/null; do
		RETRY=$((RETRY + 1))
		if [ $RETRY -ge $MAX_RETRIES ]; then
			echo -e "${RED}MySQL did not become ready in time. Exiting.${NC}"
			exit 1
		fi
		echo "MySQL not ready yet... retrying ($RETRY/$MAX_RETRIES)"
		sleep 2
	done
	echo "MySQL is ready. Initializing database..."
	sleep 5
	cd "$DATABASE_DIR"
	node initDatabase.js
	cd - >/dev/null
fi

# ================================
# 2. Backend container setup
# ================================
BACKEND_CONTAINER="backend_node"
BACKEND_VOLUME="backend_data"

# Stop and remove container if exists
if docker ps -a --format '{{.Names}}' | grep -q "^$BACKEND_CONTAINER$"; then
	echo -e "${YELLOW}Container $BACKEND_CONTAINER already exists. Stopping and removing...${NC}"
	docker rm -f "$BACKEND_CONTAINER"
else
	echo -e "${GREEN}No existing backend container found${NC}"
fi

# Remove backend volume if exists
if docker volume ls --format '{{.Name}}' | grep -q "^$BACKEND_VOLUME$"; then
	echo -e "${YELLOW}Removing volume $BACKEND_VOLUME...${NC}"
	docker volume rm "$BACKEND_VOLUME" || true
else
	echo -e "${GREEN}No backend volume to remove${NC}"
fi

# ================================
# 3. Generate docker-compose.yml
# ================================
COMPOSE_MAIN_FILE="$PROJECT_DIR/docker-compose.yml"
cat >"$COMPOSE_MAIN_FILE" <<EOL
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: backend_node
    ports:
      - "5000:5000"
    volumes:
      - ./backend:/app/backend
      - /app/node_modules
    env_file:
      - ./backend/.mysql_setup.env
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

# ================================
# 4. Launch backend container
# ================================
cd "$PROJECT_DIR"
docker compose up -d --build
cd - >/dev/null

# ================================
# 5. Recap
# ================================
echo -e "${GREEN}Services started!${NC}"
echo "Backend: http://$DB_HOST:5000"
echo "Swagger: http://$DB_HOST:5000/docs"
