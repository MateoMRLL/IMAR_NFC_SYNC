#!/bin/bash

set -e

# ================================
# Couleurs
# ================================
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
RED="\033[1;31m"
BLUE="\033[1;34m"
NC="\033[0m"

# ================================
# Paramètres
# ================================
PROJECT_DIR="$(dirname "$(dirname "$(realpath "$0")")")"
MYSQL_DIR="$(dirname "$PROJECT_DIR")/mysql-folder"

# Charger les variables depuis le .env
if [ ! -f "$MYSQL_DIR/.env" ]; then
    echo -e "${RED}Erreur : fichier $MYSQL_DIR/.env introuvable !${NC}"
    exit 1
fi

# Exporter les variables d'environnement
set -a
source "$MYSQL_DIR/.env"
set +a

MYSQL_CONTAINER_NAME="${MYSQL_CONTAINER_NAME:-mysql-container}"

# Récupération du mot de passe root
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-}"

if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
    echo -e "${RED}Erreur : MYSQL_ROOT_PASSWORD non défini dans $MYSQL_DIR/.env${NC}"
    exit 1
fi

# ================================
# Entrée utilisateur
# ================================
read -p "Nom de la base de données à créer : " DB_NAME
read -p "Nom de l’utilisateur à créer : " DB_USER
read -sp "Mot de passe pour $DB_USER : " DB_PASSWORD
echo

# ================================
# Vérification conteneur
# ================================
if ! docker ps --format '{{.Names}}' | grep -q "^$MYSQL_CONTAINER_NAME$"; then
    echo -e "${RED}Erreur : le conteneur $MYSQL_CONTAINER_NAME n'est pas en cours d’exécution.${NC}"
    exit 1
fi

# ================================
# Gestion réseau
# ================================
echo -e "${BLUE}Souhaitez-vous configurer le réseau pour la base MySQL ?${NC}"
select choix in "Ne rien faire" "Créer un nouveau réseau" "Relier à un réseau existant"; do
    case $choix in
        "Créer un nouveau réseau")
            read -p "Nom du nouveau réseau : " NEW_NETWORK
            if ! docker network inspect "$NEW_NETWORK" >/dev/null 2>&1; then
                docker network create "$NEW_NETWORK"
                echo -e "${GREEN}Réseau $NEW_NETWORK créé avec succès.${NC}"
            fi
            docker network connect "$NEW_NETWORK" "$MYSQL_CONTAINER_NAME" || true
            echo -e "${GREEN}Conteneur $MYSQL_CONTAINER_NAME relié au réseau $NEW_NETWORK.${NC}"
            break
            ;;
        "Relier à un réseau existant")
            echo "Réseaux disponibles :"
            docker network ls --format '  - {{.Name}}'
            read -p "Nom du réseau à utiliser : " EXISTING_NETWORK
            docker network connect "$EXISTING_NETWORK" "$MYSQL_CONTAINER_NAME" || true
            echo -e "${GREEN}Conteneur $MYSQL_CONTAINER_NAME relié au réseau $EXISTING_NETWORK.${NC}"
            break
            ;;
        "Ne rien faire")
            echo -e "${YELLOW}Aucune configuration réseau effectuée.${NC}"
            break
            ;;
        *)
            echo -e "${RED}Choix invalide${NC}"
            ;;
    esac
done

# ================================
# Commande SQL
# ================================
SQL_CMD="
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;
CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'%';
FLUSH PRIVILEGES;
"

# ================================
# Exécution
# ================================
echo -e "${BLUE}Création de la DB et de l’utilisateur dans le conteneur...${NC}"
docker exec -i "$MYSQL_CONTAINER_NAME" \
    mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "$SQL_CMD"

echo -e "${GREEN}✅ Base '$DB_NAME' et utilisateur '$DB_USER' créés avec succès !${NC}"
