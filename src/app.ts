import express, { Request, Response } from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import session from 'express-session';
import { Passport } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
const passport = new Passport();
require("dotenv").config();

const app = express();

// Middlewares Configuration
app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize passport
app.use(
  session({
    secret: `${process.env.SESSION_SECRET}`,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: `${process.env.CLIENT_ID}`,
      clientSecret: `${process.env.CLIENT_SECRET}`,
      callbackURL: `${process.env.CALLBACK_URL}`,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

// Serialize user information to the session
passport.serializeUser((user: any, done) => {
  done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((obj: any, done) => {
  done(null, obj);
});

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send(`<h1>Home Page</h1> <a href="/auth/google">Login</a>`);
});

// Initiate Google OAuth authentication
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback URL
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  }
);

// Logout
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/');
  });
});


app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user as { displayName?: string };
    const displayName = user.displayName 
    res.send(`<h1>Hello ${displayName}</h1><a href="/logout">Logout</a>`);
  } else {
    res.redirect('/');
  }
});


export default app;
