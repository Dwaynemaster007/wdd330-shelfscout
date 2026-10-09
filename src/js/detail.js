import ExternalServices from "./ExternalServices.mjs";
import BookDetails from "./BookDetails.mjs";
import ReadingList from "./ReadingList.mjs";
import { qs, getParam } from "./utils.mjs";

const workId = getParam("work");
const root = qs("#book-detail");
const services = new ExternalServices();
const readingList = new ReadingList();
const details = new BookDetails(root, readingList);

async function init() {
  if (!workId) {
    details.showError("No book selected. Search for a book and open it from the results.");
    return;
  }

  details.showLoading();
  try {
    const book = await services.getWork(workId);
    document.title = `${book.title} | ShelfScout`;

    // Try ISBN from a quick search on the work title for enrichment
    let isbn = book.isbn;
    if (!isbn && book.title) {
      try {
        const { books } = await services.searchBooks(book.title, { limit: 5 });
        const match = books.find((b) => b.workId === workId) || books[0];
        if (match?.isbn) isbn = match.isbn;
        if (match?.coverId && !book.coverId) {
          book.coverId = match.coverId;
          book.coverMedium = match.coverMedium;
          book.coverLarge = match.coverLarge;
        }
        if (match?.firstPublishYear && !book.firstPublishYear) {
          book.firstPublishYear = match.firstPublishYear;
        }
      } catch {
        /* enrichment is optional */
      }
    }

    const enrichment = await services.enrichFromGoogleBooks({
      isbn,
      title: book.title,
      authors: book.authors,
    });

    details.render(book, enrichment);
  } catch (err) {
    console.error(err);
    details.showError("Could not load this book. It may be unavailable.");
  }
}

init();
