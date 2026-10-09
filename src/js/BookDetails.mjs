/**
 * BookDetails — render detail view and wire reading-list actions
 */
import { escapeHtml, alertMessage } from "./utils.mjs";

const PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="360"><rect fill="#e5e2dc" width="240" height="360"/><text x="120" y="180" text-anchor="middle" fill="#6b7280" font-family="sans-serif" font-size="16">No cover</text></svg>`
  );

export default class BookDetails {
  constructor(rootElement, readingList) {
    this.root = rootElement;
    this.readingList = readingList;
    this.book = null;
  }

  /**
   * @param {object} book — OL work normalized
   * @param {object|null} enrichment — Google Books fields
   */
  render(book, enrichment = null) {
    this.book = { ...book };
    if (enrichment?.isbn) this.book.isbn = enrichment.isbn;
    if (enrichment?.imageLinks?.thumbnail && !this.book.coverMedium) {
      this.book.coverMedium = enrichment.imageLinks.thumbnail;
    }

    const cover =
      book.coverLarge || book.coverMedium || enrichment?.imageLinks?.thumbnail || PLACEHOLDER;
    const authors = (book.authors || []).join(", ") || "Unknown author";
    const description =
      enrichment?.description || book.description || "No description available.";
    const subjects = [
      ...(book.subjects || []),
      ...(enrichment?.categories || []),
    ].slice(0, 10);

    const rating =
      enrichment?.averageRating != null
        ? `★ ${enrichment.averageRating}${
            enrichment.ratingsCount
              ? ` (${enrichment.ratingsCount.toLocaleString()} ratings)`
              : ""
          }`
        : "";
    const pages = enrichment?.pageCount ? `${enrichment.pageCount} pages` : "";
    const published =
      enrichment?.publishedDate || book.firstPublishYear || "";
    const meta = [published, pages, rating].filter(Boolean).join(" · ");

    const saved = this.readingList.isSaved(book.workId);
    const subjectChips = subjects
      .map((s) => `<span class="chip">${escapeHtml(s)}</span>`)
      .join("");

    this.root.innerHTML = `
      <div class="book-detail__cover-col">
        <img class="book-detail__cover" src="${cover}" alt="Cover of ${escapeHtml(book.title)}" />
        <button type="button" class="btn ${saved ? "btn--ghost" : "btn--accent"}" id="list-toggle">
          ${saved ? "Remove from list" : "Add to Reading List"}
        </button>
        ${
          saved
            ? `<label class="status-label">Status
                <select id="status-select">
                  <option value="want">Want to Read</option>
                  <option value="reading">Reading</option>
                  <option value="finished">Finished</option>
                </select>
              </label>`
            : ""
        }
        <a class="btn btn--ghost" href="https://openlibrary.org/works/${escapeHtml(book.workId)}" target="_blank" rel="noopener">Open Library ↗</a>
      </div>
      <div class="book-detail__info">
        <h1>${escapeHtml(book.title)}</h1>
        <p class="book-detail__authors">${escapeHtml(authors)}</p>
        ${meta ? `<p class="book-detail__meta">${escapeHtml(meta)}</p>` : ""}
        <div class="chip-row">${subjectChips}</div>
        <h2>Description</h2>
        <div class="book-detail__description">${description}</div>
        ${
          enrichment
            ? `<p class="book-detail__source">Enriched with Google Books metadata</p>`
            : ""
        }
      </div>
    `;

    if (saved) {
      const current = this.readingList.find(book.workId);
      const select = this.root.querySelector("#status-select");
      if (select && current) select.value = current.status || "want";
      select?.addEventListener("change", () => {
        this.readingList.setStatus(book.workId, select.value);
        alertMessage("Reading status updated.");
      });
    }

    this.root.querySelector("#list-toggle")?.addEventListener("click", () => {
      if (this.readingList.isSaved(book.workId)) {
        this.readingList.remove(book.workId);
        alertMessage("Removed from your reading list.");
      } else {
        this.readingList.add(this.book, "want");
        alertMessage(`“${book.title}” added to your reading list.`);
      }
      this.render(this.book, enrichment);
    });
  }

  showError(message) {
    this.root.innerHTML = `<p class="results-status">${escapeHtml(message)}</p>
      <p><a href="/index.html">← Back to search</a></p>`;
  }

  showLoading() {
    this.root.innerHTML = `<p class="results-status is-loading">Loading book details…</p>`;
  }
}
