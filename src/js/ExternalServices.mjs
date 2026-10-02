/**
 * ExternalServices — third-party API access for ShelfScout
 * Primary: Open Library Search API
 * Enrichment (later): Google Books
 */

const OL_SEARCH = "https://openlibrary.org/search.json";
const OL_COVERS = "https://covers.openlibrary.org/b";

/**
 * Build a cover image URL from an Open Library cover id.
 * @param {number|string|null} coverId
 * @param {"S"|"M"|"L"} size
 * @returns {string|null}
 */
export function coverUrl(coverId, size = "M") {
  if (coverId === null || coverId === undefined || coverId === "") return null;
  return `${OL_COVERS}/id/${coverId}-${size}.jpg`;
}

/**
 * Normalize one Open Library search doc into a consistent book object.
 * @param {object} doc
 */
function normalizeSearchDoc(doc) {
  return {
    key: doc.key, // e.g. "/works/OL45804W"
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

export default class ExternalServices {
  /**
   * Search Open Library by free-text query.
   * @param {string} query
   * @param {{ limit?: number, page?: number }} [options]
   * @returns {Promise<{ books: object[], numFound: number }>}
   */
  async searchBooks(query, options = {}) {
    const q = (query || "").trim();
    if (!q) {
      return { books: [], numFound: 0 };
    }

    const limit = options.limit ?? 20;
    const page = options.page ?? 1;
    const params = new URLSearchParams({
      q,
      limit: String(limit),
      page: String(page),
      // Request fields we actually use (keeps payload smaller)
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
   * Fetch a single work by Open Library work id (e.g. OL45804W).
   * @param {string} workId
   */
  async getWork(workId) {
    const id = workId.replace(/^\/works\//, "");
    const response = await fetch(`https://openlibrary.org/works/${id}.json`);
    if (!response.ok) {
      throw new Error(`Open Library work failed (${response.status})`);
    }
    return response.json();
  }
}
