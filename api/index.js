import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import { auth } from "express-oauth2-jwt-bearer";

// this is a middleware that will validate the access token sent by the client
const requireAuth = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
  tokenSigningAlg: "RS256",
});

const app = express();
const allowedOrigins = ['http://localhost:3000', 'https://assignment-03-chuwei-cai.vercel.app'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// this is a public endpoint because it doesn't have the requireAuth middleware
app.get("/ping", (req, res) => {
  res.send("pong");
});


// update the user's nickname
app.post("/update-user-name", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const { nickname } = req.body;

  if (!nickname) {
    return res.status(400).json({ error: 'New nickname is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        nickname: nickname,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update name' });
  }
});

// get readlist for a user
app.get("/read-list", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  console.log('auth0Id: ', auth0Id)
  try {
    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const readList = await prisma.readList.findUnique({
      where: { userId: user.id },
      include: { books: true,},
    });

    if (!readList) {
      return res.json([]);
    }

    res.json(readList.books);
  } catch (error) {
    console.error('Error fetching readList:', error);
    res.status(500).json({ error: 'Failed to fetch readList' });
  }
});

// add book to readlist
app.post("/readlist/addBook", requireAuth, async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  const auth0Id = req.auth.payload.sub;
  const book = req.body;

  const bookToAdd = {
    bookId: book.isbn,
    title: book.title,
    isbn: book.isbn,
  };
  

  // Upsert the book
  const upsertedBook = await prisma.book.upsert({
    where: { bookId: bookToAdd.bookId },
    create: bookToAdd,
    update: bookToAdd,
  });

  try {
    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
    });
    console.log('auth0Id:', auth0Id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the read list
    let readList = await prisma.readList.findUnique({
      where: { userId: user.id },
    });
    
    // If the read list does not exist, create it
    if (!readList) {
      readList = await prisma.readList.create({
        data: { userId: user.id },
      });
    }
    
    const updatedReadList = await prisma.readList.update({
      where: { id: readList.id },
      data: {
        books: {
          connect: { id: upsertedBook.id },
        },
      },
    });

    res.json(updatedReadList);
  } catch (error) {
    console.error('Error adding book to readlist:', error);
    res.status(500).json({ error: 'Failed to add book to readlist' });
  }
});

// delete book from readlist
app.delete("/readlist/removeBook/:bookId", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const bookId = req.params.bookId;

  try {
    const user = await prisma.user.findUnique({
      where: {
        auth0Id,
      },
    });
    

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const readList = await prisma.readList.findUnique({
      where: { userId: user.id },
      include: { books: true },
    });
    console.log('readList:', readList)
    if (!readList) {
      return res.status(404).json({ error: 'Readlist not found' });
    }

    // console.log('Book found in readlist?', readList.books.some(m => m.bookId === bookId))
    // console.log('bookId:', bookId)
    // console.log('bookId:', bookId)
    if (!readList.books.some(m => m.bookId === bookId)) {
      return res.status(404).json({ error: 'Book not found in readlist' });
    }
    
    const updatedReadList = await prisma.readList.update({
      where: { id: readList.id },
      data: {
        books: {
          delete: { bookId: bookId },
        },
      },
    });
    console.log('updatedReadList:', updatedReadList)
    res.json(updatedReadList);
  } catch (error) {
    console.error('Error removing book from readlist:', error);
    res.status(500).json({ error: 'Failed to remove book from readlist' });
  }
});

// get Profile information of authenticated user
app.get("/me", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  res.json(user);
});

// verify user status
app.post("/verify-user", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const email = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/email`];
  const nickname = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/nickname`];

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  if (user) {
    res.json(user);
  } else {
    const newUser = await prisma.user.create({
      data: {
        email,
        auth0Id,
        nickname,
      },
    });

    res.json(newUser);
  }
});

// app.listen(8000, () => {
//   console.log("Server running on http://localhost:8000");
// });
const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
 console.log(`Server running on http://localhost:${PORT}`);
});

