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

function bookCardTemplate(book) {
  const authors = (book.authors || []).slice(0, 2).join(", ") || "Unknown author";
  const year = book.firstPublishYear ? ` · ${book.firstPublishYear}` : "";
  const cover =
    book.coverMedium ||
    coverUrl(book.coverId, "M") ||
    PLACEHOLDER_COVER;
  const detailHref = `/detail.html?work=${encodeURIComponent(book.workId || book.key || "")}`;

  return `
    <li class="book-card">
      <a href="${detailHref}">
        <img
          class="book-card__cover"
          src="${cover}"
          alt="Cover of ${escapeAttr(book.title)}"
          loading="lazy"
          onerror="this.onerror=null;this.src='${PLACEHOLDER_COVER}'"
        />
        <h3 class="book-card__title">${escapeHtml(book.title)}</h3>
        <p class="book-card__author">${escapeHtml(authors)}${year}</p>
      </a>
    </li>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(str) {
  return escapeHtml(str).replaceAll("'", "&#39;");
}

export default class BookList {
  constructor(listElement) {
    this.listElement = listElement;
  }

  /**
   * @param {object[]} books — normalized book objects from ExternalServices
   */
  render(books) {
    if (!this.listElement) return;

    if (!books || books.length === 0) {
      this.listElement.innerHTML = "";
      return;
    }

    this.listElement.innerHTML = books.map(bookCardTemplate).join("");
  }

  clear() {
    if (this.listElement) this.listElement.innerHTML = "";
  }
}
