/**
 * ReadingList — localStorage CRUD for saved books
 * Status: want | reading | finished
 * Optional favorite flag for quick shelf
 */
import { getLocalStorage, setLocalStorage } from "./utils.mjs";

const KEY = "shelfscout-list";

export default class ReadingList {
  constructor(storageKey = KEY) {
    this.key = storageKey;
  }

  getAll() {
    return getLocalStorage(this.key);
  }

  find(workId) {
    return this.getAll().find((b) => b.workId === workId) || null;
  }

  isSaved(workId) {
    return Boolean(this.find(workId));
  }

  /**
   * @param {object} book
   * @param {"want"|"reading"|"finished"} [status]
   */
  add(book, status = "want") {
    const list = this.getAll();
    const existing = list.findIndex((b) => b.workId === book.workId);
    const prev = existing >= 0 ? list[existing] : null;
    const entry = {
      workId: book.workId,
      key: book.key || `/works/${book.workId}`,
      title: book.title,
      authors: book.authors || [],
      coverMedium: book.coverMedium || null,
      isbn: book.isbn || null,
      firstPublishYear: book.firstPublishYear || null,
      status,
      favorite: prev?.favorite || false,
      dateAdded: prev?.dateAdded || new Date().toISOString(),
    };
    if (existing >= 0) list[existing] = { ...prev, ...entry, favorite: prev.favorite };
    else list.unshift(entry);
    setLocalStorage(this.key, list);
    return entry;
  }

  remove(workId) {
    setLocalStorage(
      this.key,
      this.getAll().filter((b) => b.workId !== workId)
    );
  }

  setStatus(workId, status) {
    const list = this.getAll();
    const item = list.find((b) => b.workId === workId);
    if (!item) return null;
    item.status = status;
    setLocalStorage(this.key, list);
    return item;
  }

  toggleFavorite(workId) {
    const list = this.getAll();
    const item = list.find((b) => b.workId === workId);
    if (!item) return null;
    item.favorite = !item.favorite;
    setLocalStorage(this.key, list);
    return item;
  }

  /**
   * @param {"date"|"title"|"status"|"favorite"} sortBy
   * @param {{ favoritesOnly?: boolean, status?: string }} [filter]
   */
  getSorted(sortBy = "date", filter = {}) {
    let list = [...this.getAll()];
    if (filter.favoritesOnly) list = list.filter((b) => b.favorite);
    if (filter.status) list = list.filter((b) => b.status === filter.status);

    const statusOrder = { reading: 0, want: 1, finished: 2 };
    list.sort((a, b) => {
      if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortBy === "status") {
        return (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
      }
      if (sortBy === "favorite") {
        return Number(b.favorite) - Number(a.favorite);
      }
      // date (newest first)
      return String(b.dateAdded || "").localeCompare(String(a.dateAdded || ""));
    });
    return list;
  }

  count() {
    return this.getAll().length;
  }

  favoriteCount() {
    return this.getAll().filter((b) => b.favorite).length;
  }
}
