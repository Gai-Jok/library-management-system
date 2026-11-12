import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const genres = [
  { name: 'Science Fiction', slug: 'science-fiction' },
  { name: 'Fantasy', slug: 'fantasy' },
  { name: 'Mystery', slug: 'mystery' },
  { name: 'Non-Fiction', slug: 'non-fiction' },
];

const books: {
  title: string;
  author: string;
  isbn: string;
  copies: number;
  genre: string;
}[] = [
  { title: 'Dune', author: 'Frank Herbert', isbn: '9780441013593', copies: 3, genre: 'science-fiction' },
  { title: 'Neuromancer', author: 'William Gibson', isbn: '9780441569595', copies: 2, genre: 'science-fiction' },
  { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', isbn: '9780441478125', copies: 2, genre: 'science-fiction' },
  { title: 'Foundation', author: 'Isaac Asimov', isbn: '9780553293357', copies: 4, genre: 'science-fiction' },

  { title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '9780547928227', copies: 5, genre: 'fantasy' },
  { title: 'A Wizard of Earthsea', author: 'Ursula K. Le Guin', isbn: '9780547773742', copies: 2, genre: 'fantasy' },
  { title: 'The Name of the Wind', author: 'Patrick Rothfuss', isbn: '9780756404741', copies: 3, genre: 'fantasy' },
  { title: 'Mistborn: The Final Empire', author: 'Brandon Sanderson', isbn: '9780765311788', copies: 3, genre: 'fantasy' },

  { title: 'The Hound of the Baskervilles', author: 'Arthur Conan Doyle', isbn: '9780140437867', copies: 2, genre: 'mystery' },
  { title: 'And Then There Were None', author: 'Agatha Christie', isbn: '9780062073488', copies: 3, genre: 'mystery' },
  { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', isbn: '9780307454546', copies: 2, genre: 'mystery' },
  { title: 'Gone Girl', author: 'Gillian Flynn', isbn: '9780307588371', copies: 2, genre: 'mystery' },

  { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316110', copies: 4, genre: 'non-fiction' },
  { title: 'Educated', author: 'Tara Westover', isbn: '9780399590504', copies: 2, genre: 'non-fiction' },
  { title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas', isbn: '9780135957059', copies: 2, genre: 'non-fiction' },
  { title: 'Atomic Habits', author: 'James Clear', isbn: '9780735211292', copies: 3, genre: 'non-fiction' },
];

async function main() {
  // Genres first, so books can reference their ids
  const genreIdBySlug: Record<string, number> = {};
  for (const g of genres) {
    const genre = await prisma.genre.upsert({
      where: { slug: g.slug },
      update: {},
      create: g,
    });
    genreIdBySlug[g.slug] = genre.id;
  }

  for (const b of books) {
    await prisma.book.upsert({
      where: { isbn: b.isbn },
      update: {},
      create: {
        title: b.title,
        author: b.author,
        isbn: b.isbn,
        totalCopies: b.copies,
        availableCopies: b.copies,
        genreId: genreIdBySlug[b.genre],
      },
    });
  }

  // Placeholder users (real password hashing comes with the auth week)
  await prisma.user.upsert({
    where: { email: 'librarian@example.com' },
    update: {},
    create: { email: 'librarian@example.com', name: 'Lena Librarian', passwordHash: 'placeholder', role: Role.LIBRARIAN },
  });
  await prisma.user.upsert({
    where: { email: 'patron@example.com' },
    update: {},
    create: { email: 'patron@example.com', name: 'Pat Patron', passwordHash: 'placeholder', role: Role.PATRON },
  });

  console.log(`Seeded ${genres.length} genres, ${books.length} books, 2 users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
