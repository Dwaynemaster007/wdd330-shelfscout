/**
 * BookList — render a grid of book cards from normalized search results
 */
import { coverUrl } from "./ExternalServices.mjs";

const PLACEHOLDER_COVER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300">
      <rect fill="#e5e2dc" width="200" height="300"/>
      <text x="100" y="150" text-anchor="middle" fill="#6b7280" font-family="sans-serif" font-size="14">No cover</text>
    </svg>`
  );

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function bookCardTemplate(book, index = 0) {
  const authors = (book.authors || []).slice(0, 2).join(", ") || "Unknown author";
  const year = book.firstPublishYear ? ` · ${book.firstPublishYear}` : "";
  const cover =
    book.coverMedium || coverUrl(book.coverId, "M") || PLACEHOLDER_COVER;
  const detailHref = `/detail.html?work=${encodeURIComponent(book.workId || book.key || "")}`;
  const delay = Math.min(index, 12) * 40;

  return `
    <li class="book-card book-card--enter" style="animation-delay:${delay}ms">
      <a href="${detailHref}">
        <img
          class="book-card__cover"
          src="${cover}"
          alt="Cover of ${escapeHtml(book.title)}"
          loading="lazy"
          onerror="this.onerror=null;this.src='${PLACEHOLDER_COVER}'"
        />
        <h3 class="book-card__title">${escapeHtml(book.title)}</h3>
        <p class="book-card__author">${escapeHtml(authors)}${year}</p>
      </a>
    </li>
  `;
}

export default class BookList {
  constructor(listElement) {
    this.listElement = listElement;
    this.lastBooks = [];
  }

  render(books) {
    if (!this.listElement) return;
    this.lastBooks = books || [];
    if (!books || books.length === 0) {
      this.listElement.innerHTML = "";
      return;
    }
    this.listElement.innerHTML = books.map((b, i) => bookCardTemplate(b, i)).join("");
  }

  /** Client-side filter of the last rendered set */
  filter({ yearMin, yearMax, subject } = {}) {
    let books = [...this.lastBooks];
    if (yearMin) {
      books = books.filter(
        (b) => b.firstPublishYear && b.firstPublishYear >= Number(yearMin)
      );
    }
    if (yearMax) {
      books = books.filter(
        (b) => b.firstPublishYear && b.firstPublishYear <= Number(yearMax)
      );
    }
    if (subject) {
      const s = subject.toLowerCase();
      books = books.filter((b) =>
        (b.subjects || []).some((sub) => String(sub).toLowerCase().includes(s))
      );
    }
    if (!this.listElement) return books;
    this.listElement.innerHTML = books.map((b, i) => bookCardTemplate(b, i)).join("");
    return books;
  }

  clear() {
    this.lastBooks = [];
    if (this.listElement) this.listElement.innerHTML = "";
  }
}
