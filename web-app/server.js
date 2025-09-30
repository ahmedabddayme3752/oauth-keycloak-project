const express = require('express');
const session = require('express-session');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;
const { Issuer, Strategy: OpenIDConnectStrategy } = require('openid-client');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'oauth-demo';
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || 'web-app-client';
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || 'your-client-secret';

// Session configuration
app.use(session({
  secret: 'oauth-demo-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize OpenID Connect client
let client;

async function initializeAuth() {
  try {
    const keycloakIssuer = await Issuer.discover(`${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`);
    console.log('Keycloak issuer discovered:', keycloakIssuer.metadata.issuer);

    client = new keycloakIssuer.Client({
      client_id: KEYCLOAK_CLIENT_ID,
      client_secret: KEYCLOAK_CLIENT_SECRET,
      redirect_uris: ['http://localhost:3000/auth/callback'],
      response_types: ['code'],
    });

    // Configure Passport strategy
    passport.use('oidc', new OpenIDConnectStrategy({
      client: client,
      params: {
        scope: 'openid email profile'
      }
    }, (tokenset, userinfo, done) => {
      console.log('User authenticated:', userinfo);
      return done(null, userinfo);
    }));

    passport.serializeUser((user, done) => {
      done(null, user);
    });

    passport.deserializeUser((user, done) => {
      done(null, user);
    });

    console.log('OAuth 2.0 authentication configured successfully');
  } catch (error) {
    console.error('Error initializing authentication:', error);
  }
}

// Routes
app.get('/', (req, res) => {
  res.render('index', { 
    user: req.user,
    isAuthenticated: req.isAuthenticated()
  });
});

app.get('/login', passport.authenticate('oidc'));

app.get('/auth/callback', 
  passport.authenticate('oidc', { failureRedirect: '/error' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.render('dashboard', { user: req.user });
});

app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.render('profile', { user: req.user });
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
});

app.get('/error', (req, res) => {
  res.render('error', { message: 'Authentication failed' });
});

// API endpoint to demonstrate protected resource access
app.get('/api/protected', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.json({
    message: 'This is a protected resource',
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Initialize authentication and start server
initializeAuth().then(() => {
  app.listen(PORT, () => {
    console.log(`OAuth 2.0 Web Application running on port ${PORT}`);
    console.log(`Keycloak URL: ${KEYCLOAK_URL}`);
    console.log(`Realm: ${KEYCLOAK_REALM}`);
    console.log(`Client ID: ${KEYCLOAK_CLIENT_ID}`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
