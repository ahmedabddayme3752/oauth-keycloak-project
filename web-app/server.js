const express = require('express');
const session = require('express-session');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;
const path = require('path');
const https = require('https');
const http = require('http');
const crypto = require('crypto');
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
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true // Prevent XSS attacks
  },
  name: 'oauth-session' // Custom session name
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

// PKCE Helper Functions
function generatePKCE() {
  // Generate code_verifier: random URL-safe string (43-128 characters)
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  
  // Generate code_challenge: SHA256 hash of code_verifier, base64url encoded
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  
  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256'
  };
}

// Custom OAuth2 Strategy with PKCE support
class OAuth2PKCEStrategy extends OAuth2Strategy {
  constructor(options, verify) {
    super(options, verify);
    this._options = options;
    this._req = null; // Store request for later use
  }

  authenticate(req, options) {
    // Store request reference
    this._req = req;
    
    // Generate PKCE parameters if not already in session
    if (!req.session.pkce) {
      const pkce = generatePKCE();
      req.session.pkce = pkce;
      console.log('🔐 PKCE generated:', {
        codeChallenge: pkce.codeChallenge.substring(0, 20) + '...',
        method: pkce.codeChallengeMethod
      });
    }

    // Add PKCE parameters to authorization URL
    const pkce = req.session.pkce;
    const authURL = new URL(this._options.authorizationURL);
    authURL.searchParams.set('code_challenge', pkce.codeChallenge);
    authURL.searchParams.set('code_challenge_method', pkce.codeChallengeMethod);
    
    // Store modified authorization URL
    this._options.authorizationURL = authURL.toString();
    
    // Call parent authenticate method
    super.authenticate(req, options);
  }

  _getOAuthAccessToken(code, params, callback) {
    // Add code_verifier to token request from session
    if (this._req && this._req.session && this._req.session.pkce) {
      const pkce = this._req.session.pkce;
      params.code_verifier = pkce.codeVerifier;
      console.log('🔑 Using PKCE code_verifier for token exchange');
    }
    
    // Call parent method
    super._getOAuthAccessToken(code, params, callback);
  }
}

// Initialize OAuth 2.0 authentication with PKCE
function initializeAuth() {
  try {
    // Configure Passport OAuth2 strategy for Keycloak with PKCE
    passport.use('keycloak', new OAuth2PKCEStrategy({
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
        console.log('✅ User authenticated successfully with PKCE:', userInfo);
        
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

    console.log('OAuth 2.0 authentication with PKCE configured successfully');
  } catch (error) {
    console.error('Error initializing authentication:', error);
  }
}

// Routes
app.get('/', (req, res) => {
  res.render('index', { 
    user: req.user,
    isAuthenticated: req.isAuthenticated(),
    logout: req.query.logout
  });
});

app.get('/login', passport.authenticate('keycloak'));

app.get('/auth/callback', 
  passport.authenticate('keycloak', { failureRedirect: '/error' }),
  (req, res) => {
    // Clear PKCE from session after successful authentication
    if (req.session.pkce) {
      delete req.session.pkce;
      console.log('🧹 PKCE cleared from session');
    }
    
    console.log('✅ Authentication successful with PKCE, redirecting to dashboard');
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
  // Logout from Passport
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    
    // Destroy the session completely
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
      }
      
      // Clear the session cookie
      res.clearCookie('oauth-session');
      
      console.log('✅ User logged out successfully from local session');
      
      // Redirect to Keycloak logout endpoint to clear Keycloak session
      // Using post_logout_redirect_uri to return to home page after logout
      const keycloakLogoutUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout?client_id=${KEYCLOAK_CLIENT_ID}&post_logout_redirect_uri=${encodeURIComponent('http://localhost:3000')}`;
      
      console.log('🔄 Redirecting to Keycloak logout to clear server session');
      res.redirect(keycloakLogoutUrl);
    });
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
