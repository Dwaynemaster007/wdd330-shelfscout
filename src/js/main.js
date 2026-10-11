/**
 * ShelfScout — home / search page
 */
import ExternalServices from "./ExternalServices.mjs";
import BookList from "./BookList.mjs";
import ReadingList from "./ReadingList.mjs";
import { qs, getParam, alertMessage, updateListBadge } from "./utils.mjs";

const services = new ExternalServices();
const readingList = new ReadingList();
const grid = qs("#book-grid");
const statusEl = qs("#results-status");
const titleEl = qs(".results-title");
const form = qs("#search-form");
const input = qs("#search-input");
const surpriseBtn = qs("#surprise-btn");
const filterForm = qs("#filter-form");
const bookList = new BookList(grid);

updateListBadge(readingList.count());

function setStatus(message, { loading = false } = {}) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.toggle("is-loading", loading);
}

function applyFilters() {
  if (!filterForm) return;
  const yearMin = qs("#filter-year-min")?.value;
  const yearMax = qs("#filter-year-max")?.value;
  const subject = qs("#filter-subject")?.value?.trim();
  const filtered = bookList.filter({ yearMin, yearMax, subject });
  const total = bookList.lastBooks.length;
  if (!total) return;
  setStatus(
    filtered.length === total
      ? `Showing ${total} results.`
      : `Showing ${filtered.length} of ${total} after filters.`
  );
}

async function runSearch(query) {
  const q = (query || "").trim();
  if (!q) {
    bookList.clear();
    setStatus("Search for a title or author, or try Surprise me.");
    if (titleEl) titleEl.textContent = "Discover";
    return;
  }

  if (titleEl) titleEl.textContent = `Results for “${q}”`;
  setStatus("Searching Open Library…", { loading: true });
  bookList.clear();

  try {
    const { books, numFound } = await services.searchBooks(q, { limit: 24 });
    if (!books.length) {
      setStatus(`No books found for “${q}”. Try another title or author.`);
      return;
    }
    bookList.render(books);
    setStatus(`Showing ${books.length} of ${numFound.toLocaleString()} results.`);
    applyFilters();
  } catch (err) {
    console.error(err);
    setStatus("Something went wrong while searching. Please try again.");
    alertMessage("Search failed. Check your connection and try again.", "error");
  }
}

async function runSurprise() {
  if (titleEl) titleEl.textContent = "Surprise me";
  setStatus("Picking a random subject…", { loading: true });
  bookList.clear();
  try {
    const { books, numFound } = await services.surpriseMe();
    bookList.render(books);
    setStatus(
      `Discovery picks · ${books.length} of ${numFound.toLocaleString()} in this subject.`
    );
  } catch (err) {
    console.error(err);
    setStatus("Could not load discovery picks. Try search instead.");
    alertMessage("Discovery failed. Please try again.", "error");
  }
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const q = input?.value?.trim() || "";
  const url = new URL(window.location.href);
  if (q) url.searchParams.set("q", q);
  else url.searchParams.delete("q");
  history.pushState({}, "", url);
  runSearch(q);
});

surpriseBtn?.addEventListener("click", () => {
  const url = new URL(window.location.href);
  url.searchParams.delete("q");
  history.pushState({}, "", url);
  if (input) input.value = "";
  runSurprise();
});

filterForm?.addEventListener("input", () => applyFilters());
filterForm?.addEventListener("reset", () => {
  setTimeout(() => {
    bookList.render(bookList.lastBooks);
    const n = bookList.lastBooks.length;
    if (n) setStatus(`Showing ${n} results.`);
  }, 0);
});

const initialQuery = getParam("q");
if (initialQuery) {
  if (input) input.value = initialQuery;
  runSearch(initialQuery);
} else {
  setStatus("Search for a title or author, or try Surprise me.");
}
