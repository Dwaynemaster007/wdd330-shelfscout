/**
 * ExternalServices — Open Library + Google Books
 */

const OL_SEARCH = "https://openlibrary.org/search.json";
const OL_COVERS = "https://covers.openlibrary.org/b";
const GB_VOLUMES = "https://www.googleapis.com/books/v1/volumes";

export function coverUrl(coverId, size = "M") {
  if (coverId === null || coverId === undefined || coverId === "") return null;
  return `${OL_COVERS}/id/${coverId}-${size}.jpg`;
}

function normalizeSearchDoc(doc) {
  return {
    key: doc.key,
    workId: doc.key?.replace("/works/", "") || "",
    title: doc.title || "Untitled",
    authors: doc.author_name || [],
    firstPublishYear: doc.first_publish_year || null,
    subjects: (doc.subject || []).slice(0, 8),
    isbn: doc.isbn?.[0] || null,
    coverId: doc.cover_i ?? null,
    coverMedium: coverUrl(doc.cover_i, "M"),
    coverLarge: coverUrl(doc.cover_i, "L"),
    editionCount: doc.edition_count || 0,
    language: doc.language || [],
  };
}

function descriptionFromOL(work) {
  const d = work.description;
  if (!d) return "";
  if (typeof d === "string") return d;
  return d.value || "";
}

export default class ExternalServices {
  async searchBooks(query, options = {}) {
    const q = (query || "").trim();
    if (!q) return { books: [], numFound: 0 };

    const limit = options.limit ?? 20;
    const page = options.page ?? 1;
    const params = new URLSearchParams({
      q,
      limit: String(limit),
      page: String(page),
      fields:
        "key,title,author_name,first_publish_year,subject,isbn,cover_i,edition_count,language",
    });

    const response = await fetch(`${OL_SEARCH}?${params}`);
    if (!response.ok) {
      throw new Error(`Open Library search failed (${response.status})`);
    }

    const data = await response.json();
    const docs = Array.isArray(data.docs) ? data.docs : [];
    return {
      books: docs.map(normalizeSearchDoc),
      numFound: data.numFound ?? docs.length,
    };
  }

  /**
   * Random-ish discovery: search a random subject keyword.
   */
  async surpriseMe() {
    const subjects = [
      "science fiction",
      "history",
      "poetry",
      "biography",
      "mystery",
      "philosophy",
      "travel",
      "fantasy",
      "psychology",
      "adventure",
    ];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    return this.searchBooks(subject, { limit: 12 });
  }

  /**
   * Fetch Open Library work and normalize for the detail page.
   * @param {string} workId e.g. OL468431W
   */
  async getWork(workId) {
    const id = String(workId).replace(/^\/works\//, "");
    const response = await fetch(`https://openlibrary.org/works/${id}.json`);
    if (!response.ok) {
      throw new Error(`Open Library work failed (${response.status})`);
    }
    const work = await response.json();

    let authors = [];
    if (Array.isArray(work.authors)) {
      const names = await Promise.all(
        work.authors.slice(0, 4).map(async (a) => {
          const key = a.author?.key;
          if (!key) return null;
          try {
            const r = await fetch(`https://openlibrary.org${key}.json`);
            if (!r.ok) return null;
            const j = await r.json();
            return j.name || null;
          } catch {
            return null;
          }
        })
      );
      authors = names.filter(Boolean);
    }

    const coverId = work.covers?.[0] ?? null;
    return {
      key: work.key || `/works/${id}`,
      workId: id,
      title: work.title || "Untitled",
      authors,
      description: descriptionFromOL(work),
      subjects: (work.subjects || []).slice(0, 12),
      coverId,
      coverMedium: coverUrl(coverId, "M"),
      coverLarge: coverUrl(coverId, "L"),
      firstPublishYear: work.first_publish_date || null,
      isbn: null,
    };
  }

  /**
   * Enrich with Google Books by ISBN or title+author.
   * No API key required for modest public queries.
   */
  async enrichFromGoogleBooks({ isbn, title, authors = [] } = {}) {
    let q = "";
    if (isbn) q = `isbn:${isbn}`;
    else if (title) {
      q = `intitle:${title}`;
      if (authors[0]) q += `+inauthor:${authors[0]}`;
    }
    if (!q) return null;

    const params = new URLSearchParams({
      q,
      maxResults: "1",
      printType: "books",
    });

    try {
      const response = await fetch(`${GB_VOLUMES}?${params}`);
      if (!response.ok) return null;
      const data = await response.json();
      const item = data.items?.[0];
      if (!item) return null;

      const info = item.volumeInfo || {};
      const ids = info.industryIdentifiers || [];
      const isbn13 = ids.find((i) => i.type === "ISBN_13")?.identifier;
      const isbn10 = ids.find((i) => i.type === "ISBN_10")?.identifier;

      return {
        description: info.description || "",
        categories: info.categories || [],
        pageCount: info.pageCount || null,
        averageRating: info.averageRating ?? null,
        ratingsCount: info.ratingsCount ?? null,
        publishedDate: info.publishedDate || null,
        publisher: info.publisher || null,
        previewLink: info.previewLink || null,
        infoLink: info.infoLink || null,
        isbn: isbn13 || isbn10 || null,
        imageLinks: info.imageLinks || null,
      };
    } catch {
      return null;
    }
  }
}
