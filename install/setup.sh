#!/bin/bash
# Environment Setup for Raspberry Pi and Debian x86_64
# Matéo MARILL

set -e

# ================================
# Colors
# ================================
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
BLUE="\033[1;34m"
NC="\033[0m"

# ================================
# 1. Paths
# ================================
PROJECT_DIR="$(dirname "$(dirname "$(realpath "$0")")")"
EXEC_DIR="$(pwd)"
MYSQL_DIR="$(dirname "$PROJECT_DIR")/mysql-folder"
BACKEND_DIR="$PROJECT_DIR/backend"

# ================================
# 2. Move .env to backend folder
# ================================
ENV_FILE_NAME=".mysql_setup.env"
ENV_FILE_PATH="$BACKEND_DIR/$ENV_FILE_NAME"

if [ -f "$EXEC_DIR/.mysql_setup.env" ]; then
    echo "Moving .env to backend folder..."
    mv "$EXEC_DIR/.mysql_setup.env" "$ENV_FILE_PATH"
else
    echo "No .env found in execution folder. Exiting."
    exit 1
fi

# ================================
# 3. Load environment variables
# ================================
export $(grep -v '^#' "$ENV_FILE_PATH" | xargs)

# ================================
# 4. Update .gitignore
# ================================
grep -qxF "backend/$ENV_FILE_NAME" "$PROJECT_DIR/.gitignore" || echo "backend/$ENV_FILE_NAME" >> "$PROJECT_DIR/.gitignore"

# ================================
# 5. Install Node.js and dependencies
# ================================
sudo apt install -y nodejs npm

for DIR in "$PROJECT_DIR/database" "$PROJECT_DIR/backend"; do
    if [ -f "$DIR/package.json" ]; then
        echo -e "${BLUE}Installing npm dependencies in $DIR...${NC}"
        cd "$DIR"
        npm install
        cd - >/dev/null
    fi
done

# ================================
# 6. Recap
# ================================
echo -e "\n${GREEN}=== Setup completed! ===${NC}"
echo "MySQL $DB_USER password: $MYSQL_USER_PASSWORD"
echo -e "\nRun ${YELLOW}./install/start.sh${NC} to initialize DB and start services."
