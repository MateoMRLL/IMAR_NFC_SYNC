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
# 0. Update time and system
# ================================
echo -e "${BLUE}=== Time updating ===${NC}"
sudo timedatectl set-ntp true
sudo systemctl restart systemd-timesyncd

echo -e "${BLUE}=== Updating system ===${NC}"
sudo apt update && sudo apt upgrade -y

# ================================
# 1. MySQL root password
# ================================
read -sp "Enter MySQL root password (or leave empty to generate one): " MYSQL_ROOT_PASSWORD
if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
    MYSQL_ROOT_PASSWORD=$(openssl rand -base64 16)
    echo -e "${YELLOW}Generated MySQL root password: $MYSQL_ROOT_PASSWORD${NC}"
fi

# ================================
# 2. Database user password
# ================================
read -sp "Enter MySQL user password for nfc_user (or leave empty to generate one): " MYSQL_USER_PASSWORD
if [ -z "$MYSQL_USER_PASSWORD" ]; then
    MYSQL_USER_PASSWORD=$(openssl rand -base64 16)
    echo -e "${YELLOW}Generated password for nfc_user: $MYSQL_USER_PASSWORD${NC}"
fi

# ================================
# 3. Configuration
# ================================
PROJECT_DIR="$HOME/Documents/mysql-container-folder"
MAIN_PROJECT_DIR="$HOME/Documents/nfc_project"
MYSQL_CONTAINER_NAME="mysql-container"
NETWORK_NAME="nfc_network"
REPO_URL="https://github.com/MateoMRLL/IMAR_NFC_SYNC.git"

# Database user info
DB_NAME="nfc_database"
DB_USER="nfc_user"

# ================================
# 4. Create Docker folder and .env
# ================================
mkdir -p "$PROJECT_DIR"
MYSQL_ENV_FILE="$PROJECT_DIR/.env"

echo -e "${BLUE}Creating MySQL .env in $PROJECT_DIR...${NC}"
cat > "$MYSQL_ENV_FILE" <<EOL
MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD
MYSQL_CONTAINER_NAME=$MYSQL_CONTAINER_NAME
NETWORK_NAME=$NETWORK_NAME
EOL
echo -e "${GREEN}MySQL .env created at $MYSQL_ENV_FILE${NC}"

# ================================
# 5. Initialize or update Git repo
# ================================
mkdir -p "$MAIN_PROJECT_DIR"
cd "$MAIN_PROJECT_DIR"

if [ -d ".git" ]; then
    echo -e "${YELLOW}Repository already initialized, pulling latest changes...${NC}"
    git pull
else
    echo -e "${BLUE}Initializing new Git repository...${NC}"
    git init
    git remote add origin "$REPO_URL"
    git fetch
    git checkout -t origin/main || git checkout -t origin/master
fi
cd - >/dev/null
echo -e "${GREEN}Repository setup completed in $MAIN_PROJECT_DIR${NC}"

# ================================
# 6. Create project .env (user info)
# ================================
PROJECT_ENV_FILE="$MAIN_PROJECT_DIR/.env"
echo -e "${BLUE}Creating project .env in $MAIN_PROJECT_DIR...${NC}"

cat > "$PROJECT_ENV_FILE" <<EOL
# Database connection
DB_HOST=localhost
DB_PORT=3306
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$MYSQL_USER_PASSWORD

# Gmail SMTP
GMAIL_USER=noreplynfc.imar@gmail.com
GMAIL_APP_PASSWORD=eqhsvcfvotzcojce
EOL

grep -qxF ".env" "$MAIN_PROJECT_DIR/.gitignore" || echo ".env" >> "$MAIN_PROJECT_DIR/.gitignore"
echo -e "${GREEN}Project .env created and added to .gitignore${NC}"

# ================================
# 7. Create Docker network
# ================================
if ! docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
    echo "Creating Docker network: $NETWORK_NAME"
    docker network create "$NETWORK_NAME"
else
    echo "Docker network $NETWORK_NAME already exists, skipping creation."
fi

# ================================
# 8. Check existing container and remove if needed
# ================================
if docker ps -a --format '{{.Names}}' | grep -q "^$MYSQL_CONTAINER_NAME$"; then
    echo -e "${YELLOW}Container $MYSQL_CONTAINER_NAME already exists. Stopping and removing...${NC}"
    cd "$PROJECT_DIR"
    docker compose down

    # Remove volumes containing "mysql_data"
    VOLUMES_TO_REMOVE=$(docker volume ls --format '{{.Name}}' | grep "mysql_data" || true)
    if [ -n "$VOLUMES_TO_REMOVE" ]; then
        echo -e "${YELLOW}Removing Docker volumes containing 'mysql_data':${NC}"
        echo "$VOLUMES_TO_REMOVE"
        for VOL in $VOLUMES_TO_REMOVE; do
            docker volume rm "$VOL" || true
        done
    else
        echo -e "${GREEN}No volumes containing 'mysql_data' found.${NC}"
    fi
else
    echo -e "${GREEN}No existing container found. Proceeding...${NC}"
fi

# ================================
# 9. Create docker-compose.yml
# ================================
COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
echo -e "${BLUE}Creating docker-compose.yml in $PROJECT_DIR...${NC}"

cat > "$COMPOSE_FILE" <<EOL
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
echo -e "${GREEN}docker-compose.yml created successfully!${NC}"

# ================================
# 10. Launch Docker Compose
# ================================
cd "$PROJECT_DIR"
docker compose up -d --build

echo "Waiting for MySQL container to be healthy..."
MAX_RETRIES=30
RETRY=0
until [ "$(docker inspect -f '{{.State.Health.Status}}' $MYSQL_CONTAINER_NAME)" == "healthy" ]; do
    RETRY=$((RETRY+1))
    if [ $RETRY -ge $MAX_RETRIES ]; then
        echo "MySQL container did not become healthy in time. Exiting."
        exit 1
    fi
    echo "MySQL not healthy yet... retrying ($RETRY/$MAX_RETRIES)"
    sleep 2
done
echo -e "${GREEN}MySQL container is healthy and ready!${NC}"

# ================================
# 11. Portainer setup
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
# 12. Install Node.js and npm
# ================================
echo -e "${BLUE}=== Installing Node.js and npm ===${NC}"
sudo apt install nodejs npm -y
echo -e "${GREEN}Node.js and npm installed successfully!${NC}"

# ================================
# 13. Install npm dependencies and initialize database
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
    until docker exec "$MYSQL_CONTAINER_NAME" mysqladmin ping -u"$DB_USER" -p"$MYSQL_USER_PASSWORD" --silent &>/dev/null; do
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
# 14. Final Launch
# ================================
echo -e "${BLUE}=== Starting backend and swagger services ===${NC}"

COMPOSE_MAIN_FILE="$MAIN_PROJECT_DIR/docker-compose.yml"
echo -e "${BLUE}Creating docker-compose.yml in $MAIN_PROJECT_DIR...${NC}"

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

echo -e "${GREEN}Services started successfully in detached mode!${NC}"
echo -e "Backend: http://localhost:5000"
echo -e "Swagger UI: http://localhost:5000/docs"
