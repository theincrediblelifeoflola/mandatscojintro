// Contrôle du mot de passe du greffe (variable d'environnement GREFFE_PASSWORD dans Vercel)
const crypto = require('crypto');
const { redis } = require('./redis');

const MAX_FAILS = 10;          // essais ratés autorisés…
const WINDOW_SECONDS = 900;    // …par tranche de 15 minutes et par adresse IP

function clientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  return (Array.isArray(xf) ? xf[0] : String(xf || '')).split(',')[0].trim() || 'inconnue';
}
function sameSecret(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}
function bodyOf(req) {
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  return b && typeof b === 'object' ? b : {};
}

// Renvoie true si le mot de passe est bon ; sinon envoie la réponse d'erreur et renvoie false.
async function checkGreffe(req, res) {
  const expected = process.env.GREFFE_PASSWORD;
  if (!expected) {
    res.status(503).json({ error: 'Mot de passe du greffe non configuré sur le serveur', code: 'NOT_CONFIGURED' });
    return false;
  }
  const key = 'authfail:' + clientIp(req);
  const fails = Number((await redis(['GET', key])) || 0);
  if (fails >= MAX_FAILS) {
    res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.', code: 'TOO_MANY' });
    return false;
  }
  const given = String(bodyOf(req).code || '');
  if (given && sameSecret(given, expected)) return true;
  const n = await redis(['INCR', key]);
  if (n === 1) await redis(['EXPIRE', key, String(WINDOW_SECONDS)]);
  res.status(401).json({ error: 'Mot de passe du greffe incorrect', code: 'BAD_PASSWORD' });
  return false;
}

module.exports = { checkGreffe };
