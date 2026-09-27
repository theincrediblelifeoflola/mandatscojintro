# Générateur d'Actes Judiciaires — Cour de Justice - Etat de San Andreas

Générateur de mandats, citations et actes judiciaires avec **authentification par QR Code** et vérification en ligne.

## 🚀 Déploiement sur Vercel

### Option 1 : Déploiement via GitHub (recommandé)

1. **Créer un dépôt GitHub** :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/[ton-user]/generateur-coj.git
   git push -u origin main
   ```

2. **Connecter à Vercel** :
   - Accéder à [vercel.com](https://vercel.com)
   - Cliquer "New Project"
   - Sélectionner le dépôt GitHub
   - Vercel détecte automatiquement la configuration
   - Cliquer "Deploy"

3. **Résultat** : 
   - Site déployé sur : `https://[project-name].vercel.app`
   - Vérification : `https://[project-name].vercel.app/verify.html`

---

### Option 2 : Déploiement via Vercel CLI

1. **Installer Vercel CLI** :
   ```bash
   npm install -g vercel
   ```

2. **Login à Vercel** :
   ```bash
   vercel login
   ```

3. **Déployer** :
   ```bash
   vercel --prod
   ```

4. **Suivre les étapes** :
   - Choisir un scope (compte personnel ou équipe)
   - Confirmer le nom du projet
   - Vercel génère l'URL automatiquement

---

### Option 3 : Drag & Drop sur Vercel

1. Compresser les fichiers en ZIP
2. Accéder à [vercel.com/new](https://vercel.com/new)
3. Glisser-déposer le ZIP
4. Vercel déploie en quelques secondes

---

## 📋 Contenu du projet

| Fichier | Purpose |
|---------|---------|
| `index.html` | Application principale (générateur + aperçu) |
| `verify.html` | Page de vérification d'authenticité publique |
| `vercel.json` | Configuration Vercel (routing, cache, headers) |
| `package.json` | Métadonnées du projet |

---

## ✨ Fonctionnalités

### Génération
- **11 types de mandats** : arrêt, perquisition, saisie, réquisition, mainlevée, convocation, citation, assignation civile, perquisition téléphone, localisation téléphone, autorisation prolongation GAV
- **Champs éditables** : remplissage dynamique du formulaire
- **Aperçu en temps réel** : visualisation avant export
- **Export PDF/PNG** : avec QR Code d'authentification

### Authentification
- **UUID unique** : généré automatiquement à chaque PDF
- **QR Code** : inséré au bas du document
- **Stockage persistant** : mandat stocké avec UUID dans localStorage
- **Vérification publique** : `/verify.html?id=UUID`

### Vérification (Page publique)
- **Accès libre** : n'importe qui peut vérifier
- **Recherche par UUID** : copier-coller ou scan QR
- **Affichage complet** : contenu du mandat original + métadonnées
- **Confirmation** : "Mandat authentifié" ou "Mandat non trouvé"

---

## 🔒 Stockage & Sécurité

- **localStorage** : sauvegarde locale dans le navigateur
- **Infini** : aucune expiration
- **Privé** : chaque navigateur/appareil a son propre stockage
- **Immuable** : impossible de modifier un mandat après génération
- **Traçabilité** : UUID + timestamp pour chaque document

---

## 📱 Utilisation

### Générer un mandat
1. Sélectionner le type dans le menu
2. Remplir les champs du formulaire
3. Aperçu en temps réel à droite
4. Cliquer "PDF" pour exporter
5. QR Code généré automatiquement

### Vérifier un mandat
1. **Méthode 1** : Scanner le QR Code du PDF
2. **Méthode 2** : Accéder à `/verify.html?id=UUID`
3. **Méthode 3** : Entrer l'UUID manuellement sur la page de vérification

---

## 🌐 Après déploiement

### Tester
```
https://[ton-domaine]/               # Générateur
https://[ton-domaine]/verify.html    # Vérification
```

### QR Code pointe vers
```
https://[ton-domaine]/verify.html?id=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
```

---

## 📊 Stats du projet

- **Taille du ZIP** : ~930 KB (HTML complet avec images intégrées)
- **Dépendances externes** : 3 librairies (html2canvas, jsPDF, qrcode.js) — chargées via CDN
- **Pas de backend** : 100% client-side
- **Mode offline** : fonctionne complètement sans connexion
- **Mandats supportés** : 11 types

---

## 🔧 Configuration Vercel

`vercel.json` configure :
- **Clean URLs** : `/index` → `/index.html`
- **Cache** : 1h pour assets, 10min pour verify.html
- **Headers de sécurité** : X-Content-Type-Options, X-Frame-Options
- **Rewrites** : `/verify` → `/verify.html`

---

## 📝 Notes

- L'URL de vérification détecte automatiquement le domaine
- Si tu migres l'URL, les anciens QR Codes redirigent toujours vers le bon endroit
- localStorage est spécifique par domaine — les mandats générés sur `app1.com` ne sont pas visibles sur `app2.com`
- En production sur Vercel, le stockage fonctionne dans tous les navigateurs modernes

---

## 🆘 Troubleshooting

| Problème | Solution |
|----------|----------|
| "Mandat non trouvé" en vérification | Le mandat doit avoir été généré sur ce navigateur/domaine |
| QR Code ne génère pas | Vérifier que qrcode.js CDN est accessible |
| PDF n'exporte pas | Vérifier que html2canvas et jsPDF CDN sont accessibles |
| localStorage plein | Nettoyer l'historique du navigateur ou exporter les mandats |

---

**Déployé sur [Vercel](https://vercel.com)** ✅
