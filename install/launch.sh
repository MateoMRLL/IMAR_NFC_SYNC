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
MYSQL_DIR="$HOME/Documents/mysql-folder"
MAIN_PROJECT_DIR="$PROJECT_ROOT"

MYSQL_CONTAINER_NAME="mysql-container"
DB_USER="nfc_user"
DB_PASSWORD=$(grep MYSQL_PASSWORD "$MYSQL_DIR/.env" | cut -d '=' -f2)

# ================================
# npm install & DB init
# ================================
for DIR in "$MAIN_PROJECT_DIR/database" "$MAIN_PROJECT_DIR/backend"; do
    if [ -d "$DIR" ]; then
        echo -e "${BLUE}Installing npm dependencies in $DIR/...${NC}"
        cd "$DIR"
        if [ -f "package.json" ]; then
            npm install
            echo -e "${GREEN}npm dependencies installed successfully in $DIR!${NC}"
        else
            echo -e "${YELLOW}No package.json found in $DIR, skipping npm install.${NC}"
        fi
        cd - >/dev/null
    fi
done

DATABASE_DIR="$MAIN_PROJECT_DIR/database"
if [ -f "$DATABASE_DIR/initDatabase.js" ]; then
    echo "Waiting for MySQL to be ready before initializing database..."
    MAX_RETRIES=30
    RETRY=0
    until docker exec "$MYSQL_CONTAINER_NAME" mysqladmin ping -u"$DB_USER" -p"$DB_PASSWORD" --silent &>/dev/null; do
        RETRY=$((RETRY+1))
        if [ $RETRY -ge $MAX_RETRIES ]; then
            echo -e "${RED}MySQL did not become ready in time. Exiting.${NC}"
            exit 1
        fi
        echo "MySQL not ready yet... retrying ($RETRY/$MAX_RETRIES)"
        sleep 2
    done

    echo -e "${GREEN}MySQL is ready. Running database initialization...${NC}"
    cd "$DATABASE_DIR"
    node initDatabase.js
    cd - >/dev/null
fi

# ================================
# Launch backend & swagger
# ================================
echo -e "${BLUE}=== Starting backend and swagger services ===${NC}"
cd "$MAIN_PROJECT_DIR"
docker-compose up -d --build

echo -e "${GREEN}Services started successfully in detached mode!${NC}"
echo -e "Backend: http://localhost:5000"
echo -e " Swagger UI: http://localhost:3000/docs"
