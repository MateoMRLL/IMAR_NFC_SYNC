#!/bin/bash
# Add a database and user to an existing MySQL container
# Also ensures a Docker network exists (user-defined)
# Author: Matéo MARILL

set -e

ENV_FILE=".mysql_setup.env"

# ================================
# 1. Ask user for network and container
# ================================
read -p "Enter Docker network name to create/connect: " DOCKER_NETWORK_NAME
read -p "Enter existing MySQL container name: " MYSQL_CONTAINER_NAME

# ================================
# 2. Ensure Docker network exists
# ================================
if ! docker network ls --format '{{.Name}}' | grep -q "^$DOCKER_NETWORK_NAME$"; then
    echo "Creating Docker network '$DOCKER_NETWORK_NAME'..."
    docker network create "$DOCKER_NETWORK_NAME"
else
    echo "Docker network '$DOCKER_NETWORK_NAME' already exists."
fi

# Connect the container to the network if not already connected
if ! docker inspect "$MYSQL_CONTAINER_NAME" --format '{{json .NetworkSettings.Networks}}' | grep -q "$DOCKER_NETWORK_NAME"; then
    echo "Connecting '$MYSQL_CONTAINER_NAME' to network '$DOCKER_NETWORK_NAME'..."
    docker network connect "$DOCKER_NETWORK_NAME" "$MYSQL_CONTAINER_NAME"
else
    echo "Container '$MYSQL_CONTAINER_NAME' already connected to network '$DOCKER_NETWORK_NAME'."
fi

# ================================
# 3. Ask for MySQL root password
# ================================
read -sp "Enter MySQL root password: " MYSQL_ROOT_PASSWORD
echo

# ================================
# 4. Ask for new database/user info
# ================================
read -p "Enter database name to create: " NEW_DB
read -p "Enter new MySQL username: " NEW_USER
read -sp "Enter password for user $NEW_USER (leave empty to generate): " NEW_PASSWORD
if [ -z "$NEW_PASSWORD" ]; then
    NEW_PASSWORD=$(openssl rand -base64 16)
    echo -e "\nGenerated password: $NEW_PASSWORD"
fi
echo

# ================================
# 5. Create database and user
# ================================
docker exec -i "$MYSQL_CONTAINER_NAME" mysql -uroot -p"$MYSQL_ROOT_PASSWORD" <<SQL
CREATE DATABASE IF NOT EXISTS \`$NEW_DB\`;
CREATE USER IF NOT EXISTS '$NEW_USER'@'%' IDENTIFIED BY '$NEW_PASSWORD';
GRANT ALL PRIVILEGES ON \`$NEW_DB\`.* TO '$NEW_USER'@'%';
FLUSH PRIVILEGES;
SQL

echo -e "\nDatabase '$NEW_DB' and user '$NEW_USER' created successfully!"
echo "User password: $NEW_PASSWORD"
echo "Container '$MYSQL_CONTAINER_NAME' is connected to network '$DOCKER_NETWORK_NAME'."

# ================================
# 5. Store 
# ================================


IP=$(hostname -I | awk '{print $1}')

cat > "$ENV_FILE" <<EOL
DB_HOST=$IP
DB_PORT=3306
DB_NAME=$NEW_DB
DB_USER=$NEW_USER
DB_PASS=$NEW_PASSWORD

EOL