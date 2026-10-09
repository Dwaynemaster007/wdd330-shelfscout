import ReadingList from "./ReadingList.mjs";
import { qs, escapeHtml, alertMessage } from "./utils.mjs";

const readingList = new ReadingList();
const listEl = qs("#reading-list");
const statusEl = qs("#list-status");

const PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect fill="#e5e2dc" width="200" height="300"/><text x="100" y="150" text-anchor="middle" fill="#6b7280" font-family="sans-serif" font-size="14">No cover</text></svg>`
  );

function statusLabel(s) {
  return { want: "Want to Read", reading: "Reading", finished: "Finished" }[s] || s;
}

function render() {
  const items = readingList.getAll();
  if (!items.length) {
    listEl.innerHTML = "";
    statusEl.textContent = "Your list is empty. Search for a book and add it from the detail page.";
    return;
  }

  statusEl.textContent = `${items.length} book${items.length === 1 ? "" : "s"} saved.`;
  listEl.innerHTML = items
    .map((book) => {
      const authors = (book.authors || []).slice(0, 2).join(", ") || "Unknown author";
      const cover = book.coverMedium || PLACEHOLDER;
      return `
        <li class="book-card" data-id="${escapeHtml(book.workId)}">
          <a href="/detail.html?work=${encodeURIComponent(book.workId)}">
            <img class="book-card__cover" src="${cover}" alt="" loading="lazy" />
            <h3 class="book-card__title">${escapeHtml(book.title)}</h3>
            <p class="book-card__author">${escapeHtml(authors)}</p>
          </a>
          <div class="book-card__actions">
            <select class="status-select" data-id="${escapeHtml(book.workId)}" aria-label="Status for ${escapeHtml(book.title)}">
              <option value="want" ${book.status === "want" ? "selected" : ""}>Want to Read</option>
              <option value="reading" ${book.status === "reading" ? "selected" : ""}>Reading</option>
              <option value="finished" ${book.status === "finished" ? "selected" : ""}>Finished</option>
            </select>
            <button type="button" class="btn btn--ghost btn--small remove-btn" data-id="${escapeHtml(book.workId)}">Remove</button>
          </div>
        </li>`;
    })
    .join("");

  listEl.querySelectorAll(".status-select").forEach((sel) => {
    sel.addEventListener("change", () => {
      readingList.setStatus(sel.dataset.id, sel.value);
      alertMessage("Status updated.");
    });
  });

  listEl.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      readingList.remove(btn.dataset.id);
      alertMessage("Removed from list.");
      render();
    });
  });
}

render();
