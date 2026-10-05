// Connexion avec Discord pour l'espace greffe
//   /api/discord?action=login     -> redirige vers Discord
//   /api/discord?code=…&state=…   -> retour de Discord, vérifie l'identifiant, ouvre la session
//   /api/discord?action=me        -> renvoie la personne connectée (ou 401)
//   /api/discord?action=logout    -> ferme la session
const crypto = require('crypto');
const { cookies, cookieHeader, autorise, creerSession, finSession, utilisateur } = require('../lib/session');

function redirect(res, url, setCookies) {
  if (setCookies) res.setHeader('Set-Cookie', setCookies);
  res.statusCode = 302; res.setHeader('Location', url); res.end();
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const clientId = process.env.DISCORD_CLIENT_ID, clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const q = req.query || {};
  let action = String(q.action || '');
  if (!action && (q.code || q.error)) action = 'callback'; // retour de Discord
  const origin = 'https://' + req.headers.host;
  const redirectUri = origin + '/api/discord';

  if (action === 'me') {
    if (!clientId || !clientSecret) return res.status(503).json({ error: 'Connexion Discord non configurée', code: 'NOT_CONFIGURED' });
    const u = utilisateur(req);
    return u ? res.status(200).json({ user: u }) : res.status(401).json({ error: 'Non connecté', code: 'LOGIN' });
  }

  if (action === 'logout') return redirect(res, '/generateur', [finSession()]);

  if (action === 'login') {
    if (!clientId || !clientSecret) return redirect(res, '/generateur?erreur=config');
    const state = crypto.randomBytes(16).toString('hex');
    const url = 'https://discord.com/oauth2/authorize?' + new URLSearchParams({
      client_id: clientId, response_type: 'code', redirect_uri: redirectUri, scope: 'identify', state, prompt: 'none',
    });
    return redirect(res, url, [cookieHeader('coj_state', state, 600)]);
  }

  if (action === 'callback') {
    const clearState = cookieHeader('coj_state', '', 0);
    if (!q.code || !q.state || q.state !== cookies(req).coj_state) return redirect(res, '/generateur?erreur=connexion', [clearState]);
    try {
      const t = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: 'authorization_code', code: String(q.code), redirect_uri: redirectUri }),
      });
      const tok = await t.json();
      if (!t.ok || !tok.access_token) return redirect(res, '/generateur?erreur=connexion', [clearState]);
      const m = await fetch('https://discord.com/api/users/@me', { headers: { Authorization: 'Bearer ' + tok.access_token } });
      const me = await m.json();
      if (!m.ok || !me.id) return redirect(res, '/generateur?erreur=connexion', [clearState]);
      if (!autorise(me.id)) return redirect(res, '/generateur?refus=1', [clearState]);
      return redirect(res, '/generateur', [clearState, creerSession({ id: me.id, nom: me.global_name || me.username })]);
    } catch (e) {
      return redirect(res, '/generateur?erreur=connexion', [clearState]);
    }
  }

  return res.status(400).json({ error: 'Action inconnue' });
};
