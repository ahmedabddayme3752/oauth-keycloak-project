const express = require('express');
const session = require('express-session');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;
const path = require('path');
const https = require('https');
const http = require('http');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration from environment variables
const KEYCLOAK_URL = process.env.KEYCLOAK_URL;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM;
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID;
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;

// Session configuration
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fix for openid-client compatibility
app.use((req, res, next) => {
  // Ensure req.url is properly set
  if (!req.url) {
    req.url = req.originalUrl || '/';
  }
  next();
});

// Initialize OAuth 2.0 authentication
function initializeAuth() {
  try {
    // Configure Passport OAuth2 strategy for Keycloak
    passport.use('keycloak', new OAuth2Strategy({
      authorizationURL: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth`,
      tokenURL: `http://keycloak:8080/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
      clientID: KEYCLOAK_CLIENT_ID,
      clientSecret: KEYCLOAK_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/callback',
      scope: 'openid email profile'
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        // Get user info from Keycloak
        const userInfoResponse = await fetch(`http://keycloak:8080/realms/${KEYCLOAK_REALM}/protocol/openid-connect/userinfo`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!userInfoResponse.ok) {
          throw new Error('Failed to fetch user info');
        }
        
        const userInfo = await userInfoResponse.json();
        console.log('✅ User authenticated successfully:', userInfo);
        return done(null, userInfo);
      } catch (error) {
        console.error('Error fetching user info:', error);
        return done(error, null);
      }
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

app.get('/login', passport.authenticate('keycloak'));

app.get('/auth/callback', 
  passport.authenticate('keycloak', { failureRedirect: '/error' }),
  (req, res) => {
    console.log('✅ Authentication successful, redirecting to dashboard');
    console.log('User:', req.user);
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

// Validate required environment variables
const requiredEnvVars = ['KEYCLOAK_URL', 'KEYCLOAK_REALM', 'KEYCLOAK_CLIENT_ID', 'KEYCLOAK_CLIENT_SECRET', 'SESSION_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
  console.error('\nPlease check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Initialize authentication and start server
initializeAuth();
app.listen(PORT, () => {
  console.log('🚀 OAuth 2.0 Web Application started successfully!');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🔐 Keycloak URL: ${KEYCLOAK_URL}`);
  console.log(`🏰 Realm: ${KEYCLOAK_REALM}`);
  console.log(`🆔 Client ID: ${KEYCLOAK_CLIENT_ID}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
