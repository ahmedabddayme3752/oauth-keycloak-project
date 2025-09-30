# Projet 2: Implémentation OAuth 2.0 avec Keycloak

## Description du Projet

Ce projet implémente une solution complète d'authentification et d'autorisation OAuth 2.0 en utilisant Keycloak comme serveur d'autorisation. L'application web démontre les concepts théoriques et pratiques de la sécurité des applications web modernes avec une interface utilisateur moderne et responsive.

## 🎯 Objectifs du Projet

- **Théorique**: Comprendre les concepts OAuth 2.0 et OpenID Connect
- **Pratique**: Implémenter un flux d'authentification complet
- **Sécurité**: Appliquer les bonnes pratiques de sécurité web
- **Interface**: Développer une UI moderne et professionnelle
- **Déploiement**: Containeriser l'application avec Docker

## 🏗️ Technologies Utilisées

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Passport.js** - Middleware d'authentification
- **OAuth2Strategy** - Stratégie OAuth 2.0
- **EJS** - Moteur de template

### Frontend
- **Bootstrap 5** - Framework CSS
- **FontAwesome** - Icônes
- **CSS Variables** - Système de design
- **Responsive Design** - Interface adaptative

### Infrastructure
- **Docker** - Containerisation
- **Docker Compose** - Orchestration
- **Keycloak** - Serveur d'autorisation
- **PostgreSQL** - Base de données

### Sécurité
- **OAuth 2.0** - Protocole d'autorisation
- **OpenID Connect** - Couche d'identité
- **JWT** - Tokens d'accès
- **Sessions sécurisées** - Gestion des sessions

## Architecture

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  Utilisateur │    │ Application Web │    │   Keycloak  │
│             │    │   (Node.js)   │    │             │
└─────────────┘    └──────────────┘    └─────────────┘
       │                   │                   │
       │ 1. Connexion      │ 2. Redirection    │
       │ ──────────────────> │ ──────────────────> │
       │                   │                   │
       │ 3. Authentification│                   │
       │ <────────────────── │ <────────────────── │
       │                   │                   │
       │ 4. Token d'accès  │                   │
       │ <────────────────── │                   │
       │                   │                   │
       │ 5. Accès ressource│                   │
       │ <────────────────── │                   │
```

## Composants du Projet

### 1. Keycloak (Serveur d'Autorisation)
- **Version**: 22.0
- **Base de données**: PostgreSQL 15
- **Port**: 8080
- **Interface d'administration**: http://localhost:8080/admin
- **Identifiants par défaut**: admin/admin123

### 2. Application Web
- **Framework**: Node.js + Express.js
- **Authentification**: Passport.js avec OAuth 2.0
- **Interface**: EJS + Bootstrap 5 + CSS personnalisé
- **Port**: 3000
- **URL**: http://localhost:3000
- **CSS**: Fichier externe avec variables CSS
- **Design**: Interface moderne et responsive

### 3. Base de Données
- **SGBD**: PostgreSQL 15
- **Base**: keycloak
- **Utilisateur**: keycloak/keycloak123

## Installation et Déploiement

### Prérequis
- Docker et Docker Compose
- Git

### Étapes d'Installation

1. **Cloner le projet**
```bash
git clone <votre-repo>
cd proejt_sec
```

2. **Configurer les variables d'environnement**
```bash
# Copier le fichier d'exemple
cp web-app/env.example web-app/.env

# Éditer les variables si nécessaire
nano web-app/.env
```

3. **Démarrer les services**
```bash
# Utiliser docker compose (v2) ou docker-compose (v1)
docker compose up -d
# ou
docker-compose up -d
```

4. **Vérifier le démarrage**
```bash
docker compose ps
# ou
docker-compose ps
```

5. **Accéder aux services**
- **Application Web**: http://localhost:3000
- **Keycloak Admin**: http://localhost:8081/admin
- **Keycloak Account**: http://localhost:8081/realms/oauth-demo/account

### Configuration Keycloak

1. **Connexion à l'interface d'administration**
   - URL: http://localhost:8081/admin
   - Utilisateur: admin
   - Mot de passe: admin123

2. **Création du Realm**
   - Nom: oauth-demo
   - Activer: ON

3. **Configuration du Client**
   - Client ID: web-app-client
   - Client Protocol: openid-connect
   - Access Type: confidential
   - Valid Redirect URIs: http://localhost:3000/auth/callback
   - Web Origins: http://localhost:3000

4. **Création d'un utilisateur de test**
   - Username: testuser
   - Email: test@example.com
   - Password: test123
   - Email Verified: ON

## Utilisation

### Flux d'Authentification

1. **Accès à l'application**
   - Ouvrir http://localhost:3000
   - Cliquer sur "Se connecter avec OAuth 2.0"

2. **Authentification Keycloak**
   - Redirection automatique vers Keycloak
   - Saisir les identifiants de test
   - Autoriser l'application

3. **Retour à l'application**
   - Redirection automatique vers le dashboard
   - Session active et authentifiée

4. **Navigation**
   - Dashboard: Informations utilisateur et test API
   - Profil: Détails du token JWT
   - Déconnexion: Retour à l'état initial

### Fonctionnalités Démonstrées

- **Authentification OAuth 2.0** avec flux Authorization Code
- **Gestion des sessions** avec Passport.js
- **Tokens JWT** avec validation côté serveur
- **API protégée** avec middleware d'authentification
- **Interface utilisateur** moderne et responsive
- **Design system** avec variables CSS
- **Animations et transitions** fluides
- **Gestion des erreurs** et messages utilisateur
- **Configuration par variables d'environnement**
- **Containerisation Docker** complète

## Sécurité

### Mesures Implémentées

- **Variables d'environnement** pour les secrets
- **Validation des tokens** côté serveur
- **Expiration des sessions** configurée
- **CORS** correctement configuré
- **Gestion sécurisée des secrets** (pas dans le code)
- **Validation des variables d'environnement** requises
- **HTTPS** (à configurer en production)
- **Sessions sécurisées** avec secret configurable

### Bonnes Pratiques

- Tokens stockés côté serveur uniquement
- Validation des redirections
- Gestion des erreurs sans révélation d'informations
- Logs d'audit des connexions
- Configuration sécurisée de Keycloak

## Structure du Projet

```
proejt_sec/
├── docker-compose.yml          # Configuration des services
├── presentation.tex            # Présentation LaTeX
├── README.md                  # Documentation du projet
├── .gitignore                 # Fichiers à ignorer par Git
└── web-app/                   # Application web
    ├── Dockerfile             # Image Docker de l'app
    ├── package.json           # Dépendances Node.js
    ├── server.js              # Serveur Express principal
    ├── .env                   # Variables d'environnement (local)
    ├── env.example            # Exemple de variables d'environnement
    ├── public/                # Fichiers statiques
    │   └── css/
    │       └── style.css      # Styles CSS personnalisés
    └── views/                 # Templates EJS
        ├── index.ejs          # Page d'accueil
        ├── dashboard.ejs      # Dashboard utilisateur
        ├── profile.ejs        # Profil utilisateur
        └── error.ejs          # Page d'erreur
```

## API Endpoints

### Public
- `GET /` - Page d'accueil
- `GET /login` - Initiation de l'authentification
- `GET /auth/callback` - Callback OAuth 2.0
- `GET /logout` - Déconnexion
- `GET /health` - Vérification de santé

### Protégé
- `GET /dashboard` - Dashboard utilisateur
- `GET /profile` - Profil utilisateur
- `GET /api/protected` - API protégée

## Développement

### Commandes Utiles

```bash
# Démarrer en mode développement
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Redémarrer un service
docker-compose restart web-app

# Arrêter les services
docker-compose down

# Nettoyer les volumes
docker-compose down -v
```

### Variables d'Environnement

#### Application Web (.env)
```bash
# OAuth 2.0 Configuration
KEYCLOAK_URL=http://localhost:8081
KEYCLOAK_REALM=oauth-demo
KEYCLOAK_CLIENT_ID=web-app-client
KEYCLOAK_CLIENT_SECRET=t8sa3faHwRvut8jBlZRAMtmsgQ8Wcctc

# Server Configuration
PORT=3000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=oauth-demo-secret-key-change-in-production
```

#### Docker Compose (Keycloak)
```bash
# Keycloak Configuration
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin123
KC_DB=postgres
KC_DB_URL=jdbc:postgresql://postgres:5432/keycloak
KC_DB_USERNAME=keycloak
KC_DB_PASSWORD=keycloak123
KC_HOSTNAME_URL=http://localhost:8081
```

## Dépannage

### Problèmes Courants

1. **Erreur de connexion à Keycloak**
   - Vérifier que Keycloak est démarré: `docker-compose ps`
   - Vérifier les logs: `docker-compose logs keycloak`

2. **Erreur d'authentification**
   - Vérifier la configuration du client dans Keycloak
   - Vérifier les URLs de redirection

3. **Erreur de base de données**
   - Vérifier que PostgreSQL est démarré
   - Vérifier les logs: `docker-compose logs postgres`

### Logs et Debug

```bash
# Logs de tous les services
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f keycloak
docker-compose logs -f web-app
docker-compose logs -f postgres

# Accès au shell d'un conteneur
docker-compose exec keycloak bash
docker-compose exec web-app sh
```

## Ressources et Documentation

### Documentation Officielle
- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [OpenID Connect](https://openid.net/connect/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Passport.js](http://www.passportjs.org/)

### Standards et Spécifications
- [JWT (JSON Web Token)](https://tools.ietf.org/html/rfc7519)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)

## Contribution

Pour contribuer au projet:

1. Fork le repository
2. Créer une branche feature
3. Commiter les changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 🎨 Interface Utilisateur

### Design System
- **Couleurs**: Palette cohérente avec variables CSS
- **Typographie**: Segoe UI pour une lecture optimale
- **Composants**: Cards, boutons, icônes modernes
- **Animations**: Transitions fluides et effets hover
- **Responsive**: Design adaptatif mobile-first

### Pages
- **Accueil**: Hero section avec call-to-action
- **Dashboard**: Informations utilisateur et test API
- **Profil**: Détails complets du compte utilisateur
- **Erreur**: Messages d'erreur clairs et utiles

### CSS Externe
- **Fichier**: `public/css/style.css`
- **Variables**: Système de couleurs centralisé
- **Composants**: Styles réutilisables
- **Performance**: Cache navigateur optimisé

## 📚 Documentation Supplémentaire

### Présentation LaTeX
- **Fichier**: `presentation.tex`
- **Contenu**: Théorie OAuth 2.0 + Implémentation
- **Style**: Design moderne avec icônes
- **Personnalisation**: Informations étudiants et université

### Configuration Avancée
- **Environnement**: Variables d'environnement sécurisées
- **Docker**: Containerisation complète
- **Sécurité**: Bonnes pratiques implémentées
- **Monitoring**: Logs et health checks

## 👥 Équipe

**Étudiants:**
- Ahmed AbdDayme AHMEDBOUHA
- Moussa Mahmoud BA

**Institution:**
- ENET'COM
- Enseignant: Mr ZARAI F.
- Module: Sécurité des Systèmes d'Information

## Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur le repository GitHub.

---

**Note**: Ce projet est destiné à des fins éducatives et de démonstration. Pour un déploiement en production, veuillez suivre les bonnes pratiques de sécurité et configurer HTTPS, des secrets sécurisés, et un monitoring approprié.
