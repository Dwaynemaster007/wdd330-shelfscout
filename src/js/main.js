/**
 * ShelfScout — home / search page
 */
import ExternalServices from "./ExternalServices.mjs";
import BookList from "./BookList.mjs";
import { qs, getParam } from "./utils.mjs";

const services = new ExternalServices();
const grid = qs("#book-grid");
const statusEl = qs("#results-status");
const titleEl = qs(".results-title");
const form = qs("#search-form");
const input = qs("#search-input");
const surpriseBtn = qs("#surprise-btn");
const bookList = new BookList(grid);

function setStatus(message, { loading = false } = {}) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.toggle("is-loading", loading);
}

async function runSearch(query) {
  const q = (query || "").trim();
  if (!q) {
    bookList.clear();
    setStatus("Use the search bar to find books.");
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
  } catch (err) {
    console.error(err);
    setStatus("Something went wrong while searching. Please try again.");
  }
}

async function runSurprise() {
  if (titleEl) titleEl.textContent = "Surprise me";
  setStatus("Picking a random subject…", { loading: true });
  bookList.clear();
  try {
    const { books, numFound } = await services.surpriseMe();
    bookList.render(books);
    setStatus(`Discovery picks · ${books.length} of ${numFound.toLocaleString()} in this subject.`);
  } catch (err) {
    console.error(err);
    setStatus("Could not load discovery picks. Try search instead.");
  }
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const q = input?.value?.trim() || "";
    const url = new URL(window.location.href);
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");
    history.pushState({}, "", url);
    runSearch(q);
  });
}

surpriseBtn?.addEventListener("click", () => {
  const url = new URL(window.location.href);
  url.searchParams.delete("q");
  history.pushState({}, "", url);
  if (input) input.value = "";
  runSurprise();
});

const initialQuery = getParam("q");
if (initialQuery) {
  if (input) input.value = initialQuery;
  runSearch(initialQuery);
} else {
  setStatus("Search for a title or author, or try Surprise me.");
}
