#!/bin/bash

# Script de déploiement Firebase pour MySchool
# Usage: ./deploy.sh [dev|prod] [functions|firestore|all]

set -e  # Exit on error

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
ENV=${1:-dev}
TARGET=${2:-all}

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       🚀 MySchool Firebase Deployment Script 🚀          ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Vérifier que Firebase CLI est installé
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI n'est pas installé${NC}"
    echo -e "${YELLOW}Installez-le avec: npm install -g firebase-tools${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Firebase CLI détecté${NC}"

# Vérifier l'authentification
echo -e "${BLUE}📝 Vérification de l'authentification...${NC}"
if ! firebase projects:list &> /dev/null; then
    echo -e "${RED}❌ Non authentifié${NC}"
    echo -e "${YELLOW}Connectez-vous avec: firebase login${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Authentification OK${NC}"

# Fonction pour déployer les Cloud Functions
deploy_functions() {
    echo -e "${BLUE}🔧 Déploiement des Cloud Functions...${NC}"
    
    cd functions
    
    # Installer les dépendances
    echo -e "${YELLOW}📦 Installation des dépendances...${NC}"
    npm install
    
    # Lint
    echo -e "${YELLOW}🔍 Vérification du code...${NC}"
    npm run lint
    
    # Build
    echo -e "${YELLOW}🏗️  Compilation TypeScript...${NC}"
    npm run build
    
    cd ..
    
    # Déployer
    echo -e "${YELLOW}🚀 Déploiement vers Firebase...${NC}"
    firebase deploy --only functions
    
    echo -e "${GREEN}✓ Cloud Functions déployées avec succès${NC}"
}

# Fonction pour déployer Firestore
deploy_firestore() {
    echo -e "${BLUE}🗄️  Déploiement Firestore...${NC}"
    
    # Déployer les règles
    echo -e "${YELLOW}📋 Déploiement des règles de sécurité...${NC}"
    firebase deploy --only firestore:rules
    
    # Déployer les index
    echo -e "${YELLOW}📊 Déploiement des index...${NC}"
    firebase deploy --only firestore:indexes
    
    echo -e "${GREEN}✓ Firestore déployé avec succès${NC}"
}

# Fonction pour test avec émulateurs
test_emulators() {
    echo -e "${BLUE}🧪 Démarrage des émulateurs Firebase...${NC}"
    echo -e "${YELLOW}Les émulateurs seront disponibles sur:${NC}"
    echo -e "  - Functions: ${GREEN}http://localhost:5001${NC}"
    echo -e "  - Firestore: ${GREEN}http://localhost:8080${NC}"
    echo -e "  - UI: ${GREEN}http://localhost:4000${NC}"
    echo ""
    echo -e "${YELLOW}Appuyez sur Ctrl+C pour arrêter${NC}"
    echo ""
    
    firebase emulators:start
}

# Menu principal
case $TARGET in
    functions)
        deploy_functions
        ;;
    firestore)
        deploy_firestore
        ;;
    all)
        deploy_functions
        deploy_firestore
        ;;
    test)
        test_emulators
        ;;
    *)
        echo -e "${RED}❌ Cible invalide: $TARGET${NC}"
        echo -e "${YELLOW}Usage: ./deploy.sh [dev|prod] [functions|firestore|all|test]${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ Déploiement terminé avec succès ✅        ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Afficher les liens utiles
echo -e "${BLUE}🔗 Liens utiles:${NC}"
echo -e "  Console Firebase: ${GREEN}https://console.firebase.google.com${NC}"
echo -e "  Functions logs: ${GREEN}firebase functions:log${NC}"
echo -e "  Emulators: ${GREEN}./deploy.sh $ENV test${NC}"
echo ""

exit 0