# Projet 2: Implémentation OAuth 2.0 avec Keycloak

## Description du Projet

Ce projet implémente une solution complète d'authentification et d'autorisation OAuth 2.0 en utilisant Keycloak comme serveur d'autorisation. L'application web démontre les concepts théoriques et pratiques de la sécurité des applications web modernes.

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
- **Authentification**: Passport.js avec OpenID Connect
- **Interface**: EJS + Bootstrap 5
- **Port**: 3000
- **URL**: http://localhost:3000

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

2. **Démarrer les services**
```bash
docker-compose up -d
```

3. **Vérifier le démarrage**
```bash
docker-compose ps
```

4. **Accéder aux services**
- Application Web: http://localhost:3000
- Keycloak Admin: http://localhost:8080/admin
- Keycloak Account: http://localhost:8080/realms/oauth-demo/account

### Configuration Keycloak

1. **Connexion à l'interface d'administration**
   - URL: http://localhost:8080/admin
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
- **Interface utilisateur** responsive et intuitive
- **Gestion des erreurs** et messages utilisateur

## Sécurité

### Mesures Implémentées

- **HTTPS** (à configurer en production)
- **Validation des tokens** côté serveur
- **Expiration des sessions** configurée
- **CORS** correctement configuré
- **Gestion sécurisée des secrets**

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
└── web-app/                   # Application web
    ├── Dockerfile             # Image Docker de l'app
    ├── package.json           # Dépendances Node.js
    ├── server.js              # Serveur Express principal
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

```bash
# Application Web
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=oauth-demo
KEYCLOAK_CLIENT_ID=web-app-client
KEYCLOAK_CLIENT_SECRET=your-client-secret

# Keycloak
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin123
KC_DB=postgres
KC_DB_URL=jdbc:postgresql://postgres:5432/keycloak
KC_DB_USERNAME=keycloak
KC_DB_PASSWORD=keycloak123
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

## Contact

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur le repository GitHub.

---

**Note**: Ce projet est destiné à des fins éducatives et de démonstration. Pour un déploiement en production, veuillez suivre les bonnes pratiques de sécurité et configurer HTTPS, des secrets sécurisés, et un monitoring approprié.
