import ReadingList from "./ReadingList.mjs";
import { qs, escapeHtml, alertMessage, updateListBadge } from "./utils.mjs";

const readingList = new ReadingList();
const listEl = qs("#reading-list");
const statusEl = qs("#list-status");
const sortSelect = qs("#sort-by");
const filterStatus = qs("#filter-status");
const favoritesOnly = qs("#favorites-only");

const PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect fill="#e5e2dc" width="200" height="300"/><text x="100" y="150" text-anchor="middle" fill="#6b7280" font-family="sans-serif" font-size="14">No cover</text></svg>`
  );

function render() {
  const sortBy = sortSelect?.value || "date";
  const status = filterStatus?.value || "";
  const favOnly = Boolean(favoritesOnly?.checked);

  const items = readingList.getSorted(sortBy, {
    favoritesOnly: favOnly,
    status: status || undefined,
  });

  updateListBadge(readingList.count());

  if (!readingList.count()) {
    listEl.innerHTML = "";
    statusEl.textContent =
      "Your list is empty. Search for a book and add it from the detail page.";
    return;
  }

  const favCount = readingList.favoriteCount();
  statusEl.textContent = `${readingList.count()} saved · ${favCount} favorite${favCount === 1 ? "" : "s"} · showing ${items.length}`;

  if (!items.length) {
    listEl.innerHTML = "";
    statusEl.textContent += " (no matches for current filters)";
    return;
  }

  listEl.innerHTML = items
    .map((book, index) => {
      const authors = (book.authors || []).slice(0, 2).join(", ") || "Unknown author";
      const cover = book.coverMedium || PLACEHOLDER;
      const delay = Math.min(index, 12) * 40;
      return `
        <li class="book-card book-card--enter" style="animation-delay:${delay}ms" data-id="${escapeHtml(book.workId)}">
          <a href="/detail.html?work=${encodeURIComponent(book.workId)}">
            <img class="book-card__cover" src="${cover}" alt="Cover of ${escapeHtml(book.title)}" loading="lazy" />
            <h3 class="book-card__title">${escapeHtml(book.title)}${book.favorite ? " ★" : ""}</h3>
            <p class="book-card__author">${escapeHtml(authors)}</p>
          </a>
          <div class="book-card__actions">
            <label class="visually-hidden" for="status-${escapeHtml(book.workId)}">Status</label>
            <select id="status-${escapeHtml(book.workId)}" class="status-select" data-id="${escapeHtml(book.workId)}" aria-label="Status for ${escapeHtml(book.title)}">
              <option value="want" ${book.status === "want" ? "selected" : ""}>Want to Read</option>
              <option value="reading" ${book.status === "reading" ? "selected" : ""}>Reading</option>
              <option value="finished" ${book.status === "finished" ? "selected" : ""}>Finished</option>
            </select>
            <button type="button" class="btn btn--ghost btn--small fav-btn" data-id="${escapeHtml(book.workId)}" aria-pressed="${book.favorite ? "true" : "false"}">
              ${book.favorite ? "★ Favorited" : "☆ Favorite"}
            </button>
            <button type="button" class="btn btn--ghost btn--small remove-btn" data-id="${escapeHtml(book.workId)}">Remove</button>
          </div>
        </li>`;
    })
    .join("");

  listEl.querySelectorAll(".status-select").forEach((sel) => {
    sel.addEventListener("change", () => {
      readingList.setStatus(sel.dataset.id, sel.value);
      alertMessage("Status updated.");
      render();
    });
  });

  listEl.querySelectorAll(".fav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = readingList.toggleFavorite(btn.dataset.id);
      alertMessage(item?.favorite ? "Added to favorites." : "Removed from favorites.");
      render();
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

sortSelect?.addEventListener("change", render);
filterStatus?.addEventListener("change", render);
favoritesOnly?.addEventListener("change", render);

render();
