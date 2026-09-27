# 🚀 Guide de déploiement rapide — Vercel

## Déploiement en 3 minutes

### Étape 1 : Préparer GitHub (2 min)

```bash
# Cloner ou initialiser le repo
git init
git add .
git commit -m "Générateur d'actes judiciaires v2.0 — Authentification QR Code"
git branch -M main
git remote add origin https://github.com/[ton-user]/generateur-coj.git
git push -u origin main
```

### Étape 2 : Connecter à Vercel (1 min)

1. Aller sur **[vercel.com](https://vercel.com)**
2. Cliquer **"New Project"**
3. Sélectionner le dépôt GitHub `generateur-coj`
4. Cliquer **"Deploy"** (Vercel détecte auto la config)

### Étape 3 : Vérifier ✅

```
https://[project-name].vercel.app              # Générateur
https://[project-name].vercel.app/verify.html  # Vérification
```

---

## Si tu n'as pas GitHub ?

### Option : Vercel CLI (direct)

```bash
npm install -g vercel
vercel login
vercel --prod
```

Vercel te donne une URL en 30 secondes.

---

## Domaine personnalisé (optionnel)

1. Dans Vercel Dashboard → Settings → Domains
2. Ajouter un domaine (ex: `coj.monsite.fr`)
3. Valider les DNS records
4. QR Codes pointeront vers le nouveau domaine automatiquement ✨

---

## Vérifier le déploiement

- ✅ La page charge
- ✅ Le générateur fonctionne (sélectionner un type, remplir)
- ✅ L'export PDF inclut le QR Code en bas
- ✅ La page `/verify.html` est accessible
- ✅ Scanner le QR Code ou entrer l'UUID affiche le mandat

---

## En cas de problème

**Le site ne charge pas** :
- Vérifier que tous les fichiers sont committé (`git status`)
- Regarder les logs Vercel : Dashboard → projet → Deployments

**Les ressources ne chargent pas** (JS/CSS vides) :
- CDN (html2canvas, jsPDF, qrcode.js) peut être bloqué
- Vérifier les headers CORS dans vercel.json ✓

**QR Code ne scanne pas** :
- Vérifier que qrcode.js CDN est chargé (F12 → Network → qrcode.min.js)
- Essayer une URL directe : `verify.html?id=test-uuid`

---

## Après le déploiement

- 📧 Partager le lien avec les utilisateurs
- 📱 Tester sur mobile (générateur + scan QR)
- 🔐 Chaque mandat généré sera authentifiable publiquement
- ♾️ Aucune limite de durée (localStorage infini)

---

**Besoin d'aide ?** Consulte le [README.md](README.md) complet.

