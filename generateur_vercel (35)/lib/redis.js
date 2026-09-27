// Accès Upstash Redis via l'API REST (aucune dépendance npm)
function config() {
  return {
    url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
  };
}
async function redis(command) {
  const { url, token } = config();
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(j.error || 'Redis HTTP ' + r.status);
  return j.result;
}
function configured() { const c = config(); return !!(c.url && c.token); }
module.exports = { redis, configured };
