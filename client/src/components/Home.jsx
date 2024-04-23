import "../style/home.css";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [books, setBooks] = useState([]);
  let headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Accept', 'application/json');
  headers.append('Origin','http://localhost:3000');

  const formatData = (books) =>
    books.map((book, i) => ({
    bookId: book.key ? book.key.split('/')[2] : null, // Check if key exists before splitting
    title: book.title,
    isbn: book.cover_edition_key, // Changed to extract ISBN from key
  }));
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://openlibrary.org/trending/day.json?&limit=10');
        const data = await res.json();
        console.log("data: ", data["works"]);
        const formattedData = formatData(data.works);
        setBooks(formattedData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData(); // Fetch data once when the component mounts
  
  }, []);

  return (
    <div className="home">
      <h1>Assignment 3</h1>
      <h2 className="trendy-tag">Top Trending Books of Today</h2>
      <div className="books-container">
        {books.filter((book) => book.isbn !== undefined).map(book => (
          <div key={book.isbn} className="book-card">
            <Link to={`/books/${book.isbn}`}>
              <img src={`https://covers.openlibrary.org/b/olid/${book.isbn}-L.jpg`} alt={book.title} />
            </Link>
            <h3 className="book-title">{book.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
