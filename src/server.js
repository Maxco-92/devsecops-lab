require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const app = express();

// Sécurité
app.use(helmet());
app.use(express.json({ limit: '10kb' }));

// Vérification de la clé secrète
const SECRET = process.env.JWT_SECRET;
if (!SECRET || SECRET.length < 32) {
  console.error("Erreur: JWT_SECRET doit être défini et long (32+ chars)");
  process.exit(1);
}

// Limitation des tentatives de connexion
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Trop de tentatives, réessayez plus tard.'
});

app.post('/api/login', loginLimiter, [
  body('username').isString().trim().notEmpty(),
  body('password').isString().notEmpty().isLength({ min: 8 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Identifiants invalides' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'OK' }));

app.listen(3000, () => console.log('Serveur sécurisé démarré sur port 3000'));