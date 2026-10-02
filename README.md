# ShelfScout

Personal book discovery and reading list app for WDD 330.

## APIs

- [Open Library](https://openlibrary.org/developers/api) — search, covers, subjects
- [Google Books](https://developers.google.com/books) — descriptions, ratings, page counts

## Scripts

```bash
npm install
npm run dev      # local development
npm run build    # production build → dist/
npm run preview  # preview production build
```

## Modules (planned)

| Module | Role |
|--------|------|
| `ExternalServices.mjs` | Open Library + Google Books fetch |
| `BookList.mjs` | Search results grid |
| `BookDetails.mjs` | Detail view + enrichment |
| `ReadingList.mjs` | localStorage reading list |
| `SearchForm.mjs` | Search + filters |
| `utils.mjs` | DOM helpers, alerts, storage |

## Author

Thubelihle Dlamini — WDD 330
