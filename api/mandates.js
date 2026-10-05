// Registre public des actes — lecture par identifiant ou par référence, enregistrement non modifiable, sans expiration
const { redis, configured } = require('../lib/redis');
const { exigerConnexion } = require('../lib/session');

const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const REF_RE = /^SACOJ\d{8}-\d{1,6}$/;
const META_KEYS = ['type', 'title', 'reference', 'date', 'heure', 'affaire', 'personne', 'magistrat'];

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!configured()) return res.status(500).json({ error: 'Base de données non configurée (Upstash Redis à connecter dans Vercel > Storage)' });

  try {
    if (req.method === 'GET') {
      let id = String((req.query && req.query.id) || '').trim();
      const ref = String((req.query && req.query.ref) || '').trim().toUpperCase();
      if (!id && ref) {
        if (!REF_RE.test(ref)) return res.status(400).json({ error: 'Référence invalide' });
        id = await redis(['GET', 'ref:' + ref]);
        if (!id) return res.status(404).json({ error: 'Acte introuvable' });
      }
      if (!ID_RE.test(id)) return res.status(400).json({ error: 'Identifiant invalide' });
      const raw = await redis(['GET', 'mandate:' + id]);
      if (!raw) return res.status(404).json({ error: 'Acte introuvable' });
      const rec = JSON.parse(raw); delete rec.emisPar; // l'auteur reste interne
      return res.status(200).json(rec);
    }

    if (req.method === 'POST') {
      const auteur = exigerConnexion(req, res); // seules les personnes autorisées peuvent inscrire un acte
      if (!auteur) return;
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);
      const { id, meta, image, qr } = body || {};
      if (!ID_RE.test(String(id || ''))) return res.status(400).json({ error: 'Identifiant invalide' });
      if (typeof image !== 'string' || !image.startsWith('data:image/jpeg;base64,') || image.length > 3000000) {
        return res.status(400).json({ error: 'Image invalide ou trop lourde' });
      }
      const cleanMeta = {};
      for (const k of META_KEYS) cleanMeta[k] = String((meta && meta[k]) || '').slice(0, 300);

      // La référence doit avoir été attribuée par le serveur (et n'est utilisable qu'une fois)
      const ref = cleanMeta.reference;
      if (!REF_RE.test(ref)) return res.status(400).json({ error: 'Référence manquante ou invalide' });
      const reserved = await redis(['DEL', 'refres:' + ref]);
      if (reserved !== 1) return res.status(400).json({ error: 'Référence non attribuée par le registre ou déjà utilisée' });

      // Zone du QR code dans l'image (fractions 0..1), pour la rendre cliquable sur la page du mandat
      let cleanQr = null;
      if (qr && ['x', 'y', 'w', 'h'].every(k => typeof qr[k] === 'number' && isFinite(qr[k]) && qr[k] >= 0 && qr[k] <= 1)) {
        cleanQr = { x: qr.x, y: qr.y, w: qr.w, h: qr.h };
      }
      const record = { id, meta: cleanMeta, image, qr: cleanQr, emisPar: { id: auteur.id, nom: auteur.nom }, createdAt: new Date().toISOString() };
      const ok = await redis(['SET', 'mandate:' + id, JSON.stringify(record), 'NX']);
      if (ok !== 'OK') return res.status(409).json({ error: 'Identifiant déjà utilisé' });
      await redis(['SET', 'ref:' + ref, id, 'NX']);
      return res.status(201).json({ id, reference: ref, createdAt: record.createdAt });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
