#!/bin/bash
# Environment Setup for Raspberry Pi and Debian x86_64
# Matéo MARILL

# ================================
# 8. Project .env
# ================================
IP=$(hostname -I | awk '{print $1}')

source "$PROJECT_DIR
DB_NAME="nfc_database"
DB_USER="nfc_user"
DB_PORT="3306"


cat > "$PROJECT_DIR/.env" <<EOL
DB_HOST=$IP
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$MYSQL_USER_PASSWORD

GMAIL_USER=noreplynfc.imar@gmail.com
GMAIL_APP_PASSWORD=eqhsvcfvotzcojce
EOL

grep -qxF ".env" "$PROJECT_DIR/.gitignore" || echo ".env" >> "$PROJECT_DIR/.gitignore"

# ================================
# 9. Node.js and dependencies
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
# 10. Recap
# ================================
echo -e "\n${GREEN}=== Setup completed! ===${NC}"
echo "MySQL root password: $MYSQL_ROOT_PASSWORD"
echo "MySQL $DB_USER password: $MYSQL_USER_PASSWORD"
echo -e "\nRun ${YELLOW}./install/start.sh${NC} to initialize DB and start services."
