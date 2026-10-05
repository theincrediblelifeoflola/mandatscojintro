// Vérifie le mot de passe du greffe (utilisé par l'écran de connexion du générateur)
const { configured } = require('../lib/redis');
const { checkGreffe } = require('../lib/auth');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Méthode non autorisée' }); }
  if (!configured()) return res.status(500).json({ error: 'Base de données non configurée' });
  try {
    if (!(await checkGreffe(req, res))) return;
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
