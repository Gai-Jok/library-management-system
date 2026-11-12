## Schema Decisions

### Why `Book` references `Genre` instead of embedding it

A book's genre is shared data: many books belong to one genre such as "Fantasy". In PostgreSQL I model this as a one-to-many relationship. `Genre` is its own table, and `Book` stores a `genreId` foreign key pointing at it (declared with `@relation` in `schema.prisma`).

Embedding the genre inside each book (copying its name and slug into every row) would cause three problems:

- **Duplication and drift.** Renaming "Sci-Fi" to "Science Fiction" would mean updating every book. A missed row leaves the catalog inconsistent. With a reference, I change one `Genre` row and every book reflects it.
- **No integrity guarantees.** The foreign key means the database rejects a book pointing at a genre that doesn't exist. Embedded strings allow typos such as "Fantsy", which would silently create phantom genres.
- **Awkward queries.** "All books in a genre" and "how many books per genre" are simple joins or filters on `genreId`, and the `@@index([genreId])` keeps them fast.

### Other decisions

- **`Role` enum (`PATRON`, `LIBRARIAN`)** on `User`, defaulting to `PATRON`. An enum restricts the column to valid values at the database level, and gives me a typed union in TypeScript.
- **`isbn`, `Genre.name` and `Genre.slug` are `@unique`**, so duplicates are rejected and the seed script can safely use `upsert`.
- **`totalCopies` and `availableCopies`** are separate fields so borrowing logic can later decrement availability without losing the total.
- **`Review` (stretch)** links `Book` and `User`, with `@@unique([bookId, userId])` so a user can review a book only once. Deleting a book or user cascades to their reviews.

### Prisma vs. a document database (stretch)

In a document database I would have been tempted to embed the genre, or an array of reviews, directly in the book document, because reading one document is convenient. In Prisma I had to decide the relationships up front, and the schema file makes them explicit and enforced. It felt stricter at first, but the generated types and the foreign keys catch mistakes that a flexible document store would let through.
