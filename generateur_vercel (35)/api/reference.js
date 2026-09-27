// Attribution automatique des références : SACOJ + AAAAMMJJ (heure de Paris) + "-" + numéro du jour
const { redis, configured } = require('../lib/redis');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Méthode non autorisée' }); }
  if (!configured()) return res.status(500).json({ error: 'Base de données non configurée' });
  try {
    const day = new Intl.DateTimeFormat('fr-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' })
      .format(new Date()).replace(/-/g, '');
    const n = await redis(['INCR', 'refcounter:' + day]);   // atomique : jamais deux fois le même numéro
    const reference = 'SACOJ' + day + '-' + n;
    await redis(['SET', 'refres:' + reference, '1', 'EX', '3600']); // réservation valable 1 h
    return res.status(200).json({ reference });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
