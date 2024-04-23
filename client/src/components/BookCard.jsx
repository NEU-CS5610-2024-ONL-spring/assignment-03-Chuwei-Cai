// this component shows the card view the books.
// it will dispaly the cover and title of a book. 
import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../context/GlobalState";
import { useNavigate } from "react-router-dom";
import "../style/bookCard.css";

import detailIcon from '../images/detail.png'; 
import deleteIcon from '../images/delete.png'; 

export default function BookCard({ book }) {
    console.log("book: ", book);
    const {removeBookFromReadList,} = useContext(GlobalContext);

    const navigate = useNavigate(); // use this to redirect the user to the book details page

    const [navigateToBookDetails, setNavigateToBookDetails] = useState(null); // this is used to redirect the user to the book details page

    const viewBookDetails = (isbn) => {
        setNavigateToBookDetails(`/books/${isbn}`); // redirect the user to the book details page
    }

    useEffect(() => {
        if (navigateToBookDetails) {
            navigate(navigateToBookDetails);
        }
    }, [navigateToBookDetails, navigate]);
    // if the book has the isbn number, then return its image and title
    // if the bool does not have the isbn, show black cover
    return (
        <div className="book-card">
            <div className="overlay"></div>
            {book.isbn ? (
                <img
                    src={`https://covers.openlibrary.org/b/olid/${book.isbn}-L.jpg`}
                    alt={`${book.title} Cover`}
                />
                ) : (
                <div className="blank-cover"></div>
            )}
        
            {/* <BookControls book={book} /> */}
            <button
                className="detail-btn"
                onClick={() => viewBookDetails(book.isbn)}
            >
                <img className="small-icon" src={detailIcon} alt="detail button" />
            </button>

            <button
                className="delete-btn"
                onClick={() => removeBookFromReadList(book.isbn)}
            >
                <img className="small-icon" src={deleteIcon} alt="delete button" />
            </button>
        </div>
    );
}

