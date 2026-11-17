# 📚 Hub de Partage de Ressources Pédagogiques

Mini application **Angular 17 + Spring Boot 3 + MongoDB** permettant aux étudiants de
partager, rechercher et télécharger des fiches de révision, TP, tutoriels ou projets.

## Les 3 pages

| Route | Description |
|---|---|
| `/` | **Catalogue** : recherche instantanée (debounce), filtres Cours / TP / Projet, cartes |
| `/resource/:id` | **Détail** : description, téléchargement, aperçu (PDF/images), commentaires |
| `/mon-espace` | **Espace personnel** : formulaire d'upload (validation) + mes publications + suppression |

## Prérequis
- Java 17+ et Maven 3.9+
- Node 18.19+ / 20+ et npm
- Docker (pour MongoDB) *ou* MongoDB installé en local

## Lancement

```bash
# 1) MongoDB
docker compose up -d

# 2) Backend  (http://localhost:8080)
cd backend
mvn spring-boot:run

# 3) Frontend (http://localhost:4200)
cd frontend
npm install
npm start
```

> Le backend utilise **Lombok** : activez le plugin Lombok + "Annotation processing" dans votre IDE.

## API REST

| Méthode | URL | Rôle |
|---|---|---|
| GET | `/api/resources?q=&category=` | Liste + recherche + filtre |
| GET | `/api/resources/{id}` | Détail |
| GET | `/api/resources/mine?author=` | Publications d'un auteur |
| POST | `/api/resources` (multipart) | Upload (title, description, category, author, file) |
| GET | `/api/resources/{id}/download[?inline=true]` | Téléchargement / aperçu |
| DELETE | `/api/resources/{id}?author=` | Suppression (auteur uniquement) |
| GET/POST | `/api/resources/{id}/comments` | Commentaires |

## Points forts à mettre en avant (CV / GitHub)
- Upload / download de fichiers (multipart, stockage disque, UUID anti-collision, aperçu inline)
- Recherche MongoDB (regex insensible à la casse sur titre/description/auteur) + filtre par catégorie
- Formulaires réactifs Angular avec validation (champs + taille/type de fichier)
- Validation côté serveur (Bean Validation) + gestionnaire d'erreurs global
- Angular 17 : composants standalone, signals, nouvelle syntaxe de contrôle `@if` / `@for`, RxJS (`switchMap`, `debounceTime`)

## Pistes d'amélioration
- Remplacer le pseudo (localStorage) par une vraie authentification JWT (Spring Security)
- Utiliser un index texte MongoDB (`$text`) avec score de pertinence
- Pagination, tags, notes ⭐, tests (JUnit / Jasmine), Dockerfile
