/**
 * ReadingList — localStorage CRUD for saved books
 * Status: want | reading | finished
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
   * @param {object} book — normalized book (workId, title, authors, coverMedium, isbn, …)
   * @param {"want"|"reading"|"finished"} [status]
   */
  add(book, status = "want") {
    const list = this.getAll();
    const existing = list.findIndex((b) => b.workId === book.workId);
    const entry = {
      workId: book.workId,
      key: book.key || `/works/${book.workId}`,
      title: book.title,
      authors: book.authors || [],
      coverMedium: book.coverMedium || null,
      isbn: book.isbn || null,
      firstPublishYear: book.firstPublishYear || null,
      status,
      dateAdded: existing >= 0 ? list[existing].dateAdded : new Date().toISOString(),
    };
    if (existing >= 0) list[existing] = entry;
    else list.unshift(entry);
    setLocalStorage(this.key, list);
    return entry;
  }

  remove(workId) {
    const list = this.getAll().filter((b) => b.workId !== workId);
    setLocalStorage(this.key, list);
  }

  setStatus(workId, status) {
    const list = this.getAll();
    const item = list.find((b) => b.workId === workId);
    if (!item) return null;
    item.status = status;
    setLocalStorage(this.key, list);
    return item;
  }

  count() {
    return this.getAll().length;
  }
}
