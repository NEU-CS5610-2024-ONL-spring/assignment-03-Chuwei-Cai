// Book details page
import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { GlobalContext } from "../context/GlobalState";
import { useAuth0 } from "@auth0/auth0-react";
import "../style/bookDetails.css";

export default function BookDetails() {

    const { isAuthenticated, loginWithRedirect } = useAuth0();

    const { isbn } = useParams(); // get the isbn from the url
    console.log("isbn: ", isbn);
    const [selectedBook, setSelectedBook] = useState(""); // this is used to redirect the user to the book details page

    const handleAddToReadList = () => {
        if (isAuthenticated) {
          addBookToReadList(selectedBook);
        } else {
          alert("You need to log in to add books to your read list.");
          loginWithRedirect();
        }
    };

    useEffect(() => {
        const getBook = async () => {
          try {
            const response = await fetch(`https://openlibrary.org/api/books?bibkeys=OLID:${isbn}&jscmd=details&format=json`);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const apiData = await response.json();
            console.log("apiData: ", apiData);
            const bookID = Object.keys(apiData)[0].split(':')[1]
            const bookData = Object.values(apiData).map(book => ({
                    bookId: bookID ? bookID : null, // Check if key exists before splitting
                    title: book.details.title ? book.details.title : 'NA',
                    author: book.details.authors ? book.details.authors[0].name : "No author information available.",
                    publish_date: book.details.publish_date ? book.details.publish_date : 'NA',
                    publisher: book.details.publishers ? book.details.publishers[0] : "No author information available.",
                    preview_url: book.preview_url ? book.preview_url : 'NA',
                    isbn: bookID, // Changed to extract OLID from key
              }));
            

            setSelectedBook(bookData[0]);
          } catch (error) {
            console.log(error);
          }
        };
        getBook();
    }, [isbn]);

    const { addBookToReadList, readList } = useContext(GlobalContext);
    console.log("selectedBook: ", selectedBook);

    // let storedBook = readList.find((object) => object.bookId === selectedBook.id); // check if the book is already in the read list
    let storedBook = readList.find((object) => object.bookId === Object.keys(selectedBook)[0]);
    const readListDisabled = storedBook ? true : false; // if the book is already in the read list, disable the button
    // console.log("selectedBook.value: ", Object.keys(selectedBook)[0].split(':')[1]);
    
    return (
        <div className="book-container">
            {selectedBook && (

                <div className="book-details">
                    <div className="cover-wrapper">
                        {selectedBook.isbn ? (
                        <img
                            src={`https://covers.openlibrary.org/b/olid/${selectedBook.isbn}-L.jpg`} 
                            alt={`${selectedBook[Object.keys(selectedBook)[0]].title} Cover`}
                        />
                        ) : (
                        <div className="filler-cover-details"></div> // if there is no cover, show a blank poster
                        )}
                    </div>
                
                    <div className="info">
                        <div className="header">
                            <h1 className="title">Book Name: {selectedBook.title}</h1>
                            <h1 className="book-author">
                                Author: {selectedBook.author} 
                            </h1>
                            <h1>Publish Date: {selectedBook.publish_date}</h1>
                            <h1>Publisher: {selectedBook.publisher} </h1>
                            <a className="preview" href={selectedBook.preview_url}>
                            Preview
                            </a>
                        </div>

                        <button className="btn-add-to-read-list"
                            disabled={readListDisabled} // if the book is already in the read list, disable the button
                            onClick={handleAddToReadList}> 
                            {readListDisabled ? 'Added to Readlist' : 'Add to Readlist'}
                        </button>

                    </div>

                </div>

            )}

        </div>
      );
}
