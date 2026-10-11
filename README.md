# ShelfScout

Personal book discovery and reading list app for **WDD 330**.

**Live:** https://wdd330-shelfscout.onrender.com/  
**Trello:** https://trello.com/b/HcDbOjlr/shelfscout-wdd-330-final

## Features

- Search books via **Open Library** Search API
- **Google Books** enrichment on detail pages (description, rating, pages)
- **Surprise me** random subject discovery
- Client-side **subject / year filters** on results
- **Reading list** in `localStorage` (want / reading / finished)
- **Favorites** quick shelf + list **sorting**
- Loading, empty, and error states with `alertMessage`
- Responsive layout and CSS card-enter animations
- Accessibility: skip link, labels, `aria-live`, focus styles

## APIs

| API | Use |
|-----|-----|
| [Open Library](https://openlibrary.org/developers/api) | Search, works, covers |
| [Google Books](https://developers.google.com/books) | Volume enrichment |

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview
npm run lint     # ESLint on src/js
```

## Modules

| File | Role |
|------|------|
| `ExternalServices.mjs` | Open Library + Google Books |
| `BookList.mjs` | Result cards + client filters |
| `BookDetails.mjs` | Detail view + list actions |
| `ReadingList.mjs` | localStorage CRUD, favorites, sort |
| `utils.mjs` | DOM, storage, alerts, badge |
| `main.js` / `detail.js` / `list.js` | Page entry points |

## Demo notes (for video / graders)

1. Home → search `gatsby` → results with covers  
2. Apply year filter (e.g. from 1920)  
3. Open a book → Google Books enrichment → **Add to Reading List**  
4. My List → change status, star favorite, sort by title  
5. **Surprise me** on home for discovery  

## Author

Thubelihle Dlamini — WDD 330 Final Project
