// Session de connexion Discord : cookie signé (HMAC) avec le secret de l'application Discord
const crypto = require('crypto');
const AUTORISES = require('./acces');

const COOKIE = 'coj_session';
const DUREE = 7 * 24 * 3600; // 7 jours

function secret() { return process.env.DISCORD_CLIENT_SECRET || ''; }
function b64(s) { return Buffer.from(s).toString('base64url'); }
function sign(data) { return crypto.createHmac('sha256', secret()).update(data).digest('base64url'); }

function cookies(req) {
  const out = {};
  String(req.headers.cookie || '').split(';').forEach(p => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}
function cookieHeader(name, value, maxAge) {
  return name + '=' + encodeURIComponent(value) + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=' + maxAge;
}
function autorise(id) { return AUTORISES.includes(String(id)); }

function creerSession(user) {
  const data = b64(JSON.stringify({ id: String(user.id), nom: String(user.nom || ''), exp: Math.floor(Date.now() / 1000) + DUREE }));
  return cookieHeader(COOKIE, data + '.' + sign(data), DUREE);
}
function finSession() { return cookieHeader(COOKIE, '', 0); }

// Renvoie { id, nom } si la personne est connectée ET toujours autorisée, sinon null.
function utilisateur(req) {
  if (!secret()) return null;
  const v = cookies(req)[COOKIE];
  if (!v || v.indexOf('.') < 0) return null;
  const [data, sig] = v.split('.');
  const attendu = sign(data);
  if (!sig || sig.length !== attendu.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(attendu))) return null;
  let s; try { s = JSON.parse(Buffer.from(data, 'base64url').toString()); } catch (e) { return null; }
  if (!s || !s.exp || s.exp < Date.now() / 1000 || !autorise(s.id)) return null;
  return { id: s.id, nom: s.nom };
}

// À utiliser dans les API réservées : renvoie l'utilisateur, ou répond 401 et renvoie null.
function exigerConnexion(req, res) {
  const u = utilisateur(req);
  if (!u) { res.status(401).json({ error: 'Connexion Discord requise', code: 'LOGIN' }); return null; }
  return u;
}

module.exports = { cookies, cookieHeader, autorise, creerSession, finSession, utilisateur, exigerConnexion };
