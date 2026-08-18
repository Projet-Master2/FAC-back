# FAC – Idées & Fonctionnalités

> Recettes de cuisine "étudiant" : simples, rapides et économiques.
> Dernière mise à jour : 17/07/2026

---

## Must Have

### Authentification & Compte
- [x] Inscription (email + mot de passe) — `POST /api/auth/register`
- [x] Connexion / Déconnexion — `POST /api/auth/login` + `POST /api/auth/logout`
- [x] **Réinitialisation du mot de passe** — endpoint créé, **email non envoyé** (service email à brancher)
- [x] Gestion du profil : pseudo, avatar, bio courte — page `/profile` + `PATCH /api/users/:id`
- [x] Upload d'avatar avec compression WebP — `POST /api/users/:id/avatar` (Sharp)
- [x] Suppression du compte — route backend créée, bouton front non implémenté

### Recettes
- [x] Création d'une recette (titre, description, difficulté, temps, coût estimé) — page `/recipes/create`
- [x] Ajout / gestion de la liste d'ingrédients (nom, quantité, unité) — avec autocomplete et création à la volée
- [x] **Normalisation des ingrédients** (minuscules, singulier) + dictionnaire d'icônes (~120 entrées)
- [x] **Ajout des étapes de préparation** (ordonnées, flèches ↑↓)
- [x] **Nombre de portions + calculateur** — ajustement dynamique des quantités sur la page de détail
- [x] **Niveau de difficulté** (Facile / Moyen / Difficile)
- [x] **Temps de préparation + temps de cuisson**
- [x] **Coût estimé par portion**
- [x] Upload d'image de recette avec compression WebP — `POST /api/recipes/:id/image`
- [x] Modification d'une recette — bouton "Modifier" visible (auteur), **page d'édition non créée**
- [x] Suppression d'une recette — route backend créée, bouton front non implémenté

### Recherche & Filtres
- [x] Recherche par mots-clés (titre, description, **ingrédients**)
- [x] Filtres : difficulté, temps de préparation max, coût max
- [x] Tri : plus récent, mieux noté, plus rapide, moins cher
- [x] **Pagination** (9 résultats/page, numérotée)
- [x] Filtres par catégorie/tags — backend prêt, non exposé dans la sidebar

---

## Should Have

### Engagement social
- [x] Notation des recettes (1–5 étoiles) — avec affichage moyenne
- [x] Commentaires sur les recettes — ajout, suppression, pagination
- [x] Mise en favoris des recettes — toggle cœur, liste dans le profil
- [x] Réactions aux posts / commentaires — **modèle BDD prêt**, frontend non implémenté

### Praticité
- [x] **Calculateur de portions** — boutons +/- sur la page de détail
- [x] **Catégories / tags** — modèle BDD et routes prêts, non exposés en front
- [x] Version mobile responsive — global.css + breakpoints sur toutes les pages

---

## Could Have

### Contenu enrichi
- [x] Ajout d'une photo dans une recette (stockée en base64 WebP)
- [ ] Ajout de vidéos — **non implémenté**

### Social avancé
- [x] Réactions aux recettes et commentaires (👍 ❤️ 😋…) — modèle prêt, non développé

### Organisation
- [ ] **Liste de courses** générée depuis une recette — **non implémenté**

---

## Exigences Techniques

### Sécurité
- [x] Authentification par **token JWT** (access token 15min + refresh token 7j avec rotation)
- [x] **Hachage des mots de passe** (bcrypt, 12 rounds)
- [ ] Chiffrement des données sensibles au repos — **non implémenté**
- [ ] Certificat **HTTPS** (TLS) — à configurer en production
- [x] **Sécurisation des entrées** (validation Zod sur toutes les routes)
- [x] **Configuration CORS** — headers sur toutes les routes + `next.config.ts`
- [x] **Rate limiting** — implémenté avec Map en mémoire (5 req/min sur login/register/forgot-password). ⚠️ **TODO prod** : migrer vers Redis pour distribution multi-instances
- [x] **CSP strict** — Content-Security-Policy + X-Frame-Options + X-Content-Type-Options + Referrer-Policy + Permissions-Policy dans `next.config.ts`

### Performance
- [x] **Lazy loading** des images — attribut `loading="lazy"` sur les RecipeCard
- [x] **Compression des images** (WebP via Sharp, redimensionnement côté serveur)
- [ ] **Mise en cache** des recettes populaires — **non implémenté**
- [ ] **CDN** — images stockées en base64 (pas de CDN), à migrer en production
- [x] Optimisation des requêtes BDD (index sur authorId, difficulty, createdAt, estimatedCost)

### Tests
- [x] Tests unitaires routes auth (14 tests, 100% pass) — Vitest + mocks Prisma/bcrypt/JWT
- [x] Tests routes recettes (5 tests dans api-routes.test.ts) — création, liste, détail, modification, suppression
- [x] Tests routes commentaires/notations (7 tests dans api-routes.test.ts) — création, modification, suppression, favoris, réactions

### Monitoring
- [ ] **Monitoring des erreurs** (ex : Sentry) — **non implémenté**
- [x] Logs structurés côté API — logger JSON + requestId + traces middleware sur routes API
- [ ] Métriques de performance — **non implémenté**

### Accessibilité & Standards
- [ ] Conformité **WCAG 2.1 niveau AA** — partiellement (focus-visible, contraste OK)
- [x] Balises sémantiques HTML5 — en place sur toutes les pages
- [x] Meta tags SEO — meta tags statiques dans index.html + meta tags dynamiques (Open Graph, Twitter Card) via @unhead/vue sur RecipeDetail

---

## Pages développées

| Page | Route | Statut |
|---|---|---|
| Accueil | `/` | ✅ Complète |
| Connexion / Inscription | `/login` | ✅ Complète |
| Recherche | `/search` | ✅ Complète |
| Profil | `/profile` | ✅ Complète |
| Créer une recette | `/recipes/create` | ✅ Complète |
| Détail d'une recette | `/recipes/:id` | ✅ Complète |
| **Modifier une recette** | `/recipes/:id/edit` | ❌ À créer |

---

## Librairies & Outils à intégrer

### Icônes
| Librairie | Installation | Usage prévu | Statut |
|---|---|---|---|
| **Lucide Vue Next** | `npm install lucide-vue-next` | Icônes UI générales | ❌ Non installé |
| **Iconify for Vue** | `npm install @iconify/vue` | Icônes d'ingrédients | ❌ Non installé — dictionnaire prêt côté back |

> Les clés Iconify sont générées automatiquement à la création d'un ingrédient via le dictionnaire `src/lib/ingredient-icons.ts`.

---

## Ce qui manque / Suggestions

### Priorité haute
- **Page d'édition de recette** (`/recipes/:id/edit`) — le bouton existe, la page manque
- **Service d'envoi d'email** pour le reset de mot de passe (Resend, Mailgun…)
- **Suppression de compte** — bouton à ajouter dans le profil

### Priorité moyenne
- **Page "Mes recettes"** dans le profil — lister les recettes publiées par l'utilisateur
- **Exposition des tags** dans les filtres de recherche
- **Rate limiting** — middleware Next.js sur `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password` (max 5 req/min par IP)
- **CSP (Content Security Policy) strict** — à configurer dans `next.config.ts` via `headers()` (déjà en place pour CORS)
- **Installer Iconify** et afficher les icônes dans la liste d'ingrédients
- [x] Route **/health** (+ alias `/api/health`) pour valider les pipelines

### Priorité basse
- Migration images vers un vrai CDN (Cloudinary, Supabase Storage) — actuellement en base64
- Tests automatisés pour les routes recettes, commentaires, notations
- Meta tags SEO + og:image pour le partage social

### -- OLD --

### Authentification & Compte
- [ ] Inscription (email + mot de passe)
- [ ] Connexion / Déconnexion
- [ ] **Réinitialisation du mot de passe** (forgot password + email de reset)
- [ ] Gestion du profil : pseudo, avatar, bio courte
- [ ] Suppression du compte

### Recettes
- [ ] Création d'une recette (titre, description, catégorie, difficulté, temps, coût estimé)
- [ ] Ajout / gestion de la liste d'ingrédients (nom, quantité, unité)
- [ ] **Ajout des étapes de préparation** (ordonnées, éditables)
- [ ] **Nombre de portions** et adaptabilité des quantités (×1, ×2, ×4…)
- [ ] **Niveau de difficulté** (Facile / Moyen / Difficile)
- [ ] **Temps de préparation + temps de cuisson**
- [ ] **Coût estimé par portion**
- [ ] Modification et suppression d'une recette (par l'auteur ou un admin)

### Recherche & Filtres
- [ ] Recherche par mots-clés (titre, ingrédients)
- [ ] Filtres : catégorie, difficulté, temps de préparation, coût
- [ ] Tri : plus récent, mieux noté, plus rapide, moins cher
- [ ] **Pagination** 

---

## Should Have

### Engagement social
- [ ] Notation des recettes (1–5 étoiles)
- [ ] Commentaires sur les recettes
- [ ] Mise en favoris des recettes

### Praticité
- [ ] **Calculateur de portions** (ajuster les quantités selon le nombre de personnes)
- [ ] **Catégories / tags** (pâtes, salade, soupe, végétarien, rapide, sans four…)
- [ ] Version mobile responsive

---

## Could Have

### Contenu enrichi
- [ ] Ajout de photos dans une recette
- [ ] Ajout de vidéos (YouTube embed ou upload direct)

### Social avancé
- [ ] Réactions aux recettes et commentaires (👍 ❤️ 😋…)

### Organisation
- [ ] **Liste de courses** générée depuis une recette

---

## Exigences Techniques

### Sécurité
- [ ] Authentification par **token JWT** (access token + refresh token)
- [ ] **Hachage des mots de passe** (bcrypt)
- [ ] Chiffrement des données sensibles au repos
- [ ] Certificat **HTTPS** (TLS)
- [ ] **Sécurisation des entrées** (validation, sanitisation, protection XSS / SQLi)
- [ ] **Configuration CORS** stricte
- [ ] **Rate limiting** sur les endpoints sensibles (login, register, création de contenu)

### Performance
- [ ] **Lazy loading** des images et composants Vue
- [ ] **Compression des images** (WebP, redimensionnement côté serveur)
- [ ] **Mise en cache** des recettes populaires (Redis ou cache HTTP)
- [ ] **CDN** pour les assets statiques (images, vidéos)
- [ ] Optimisation des requêtes BDD (index, pagination côté serveur)

### Monitoring
- [ ] **Monitoring des erreurs** (ex : Sentry)
- [ ] Logs structurés côté API
- [ ] Métriques de performance (temps de réponse des endpoints)

### Accessibilité & Standards
- [ ] Conformité **WCAG 2.1 niveau AA** (contraste, navigation clavier, ARIA)
- [ ] Balises sémantiques HTML5
- [ ] Meta tags SEO (titre, description, og:image)

---

## Librairies & Outils à intégrer

### Icônes
| Librairie | Installation | Usage prévu |
|---|---|---|
| **Lucide Vue Next** | `npm install lucide-vue-next` | Icônes UI générales (navigation, actions, formulaires) |
| **Iconify for Vue** | `npm install @iconify/vue` | Icônes d'ingrédients dans les recettes (visuels riches, large catalogue) |

> **Contexte** : dans la liste des ingrédients d'une recette, chaque ingrédient aura une icône associée (ex : 🧅 oignon, 🧄 ail, 🍅 tomate) pour un rendu visuel plus attrayant que des PNG. Iconify donne accès à des milliers d'icônes vectorielles issues de multiples sets (Material, Fluent, Phosphor, etc.).
