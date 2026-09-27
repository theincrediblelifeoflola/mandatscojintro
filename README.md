# Générateur d'actes judiciaires — Cour de Justice - Etat de San Andreas

- `index.html` : générateur d'actes (PDF / PNG).
- `verify.html` : page publique de vérification (`/verify?id=...`).
- `api/mandates.js` : registre en ligne des actes (Vercel Function + Upstash Redis).

À chaque téléchargement, l'acte reçoit un numéro unique et un QR code, puis une copie
est enregistrée dans le registre (sans expiration, non modifiable). Scanner le QR code
ouvre la page de vérification qui affiche la copie officielle.

Prérequis : une base Upstash Redis connectée au projet (Vercel > Storage).

Références : attribuées automatiquement par `api/reference.js` au format `SACOJAAAAMMJJ-N`
(compteur quotidien, heure de Paris). La page `/verify` accepte une référence ou un lien.
