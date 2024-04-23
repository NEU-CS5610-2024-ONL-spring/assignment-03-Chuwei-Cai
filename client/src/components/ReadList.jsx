// This is the component for the read list page. It shows the books in the read list.
import React, {useContext} from "react";
import { GlobalContext } from "../context/GlobalState";
import BookCard from "./BookCard";
import { useAuth0 } from "@auth0/auth0-react";
import "../style/readList.css";

export default function ReadList() {
  const { readList } = useContext(GlobalContext);
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  return (
    <div className="book-page">
      <div className="container">
        <div className="header">
          <h1 className="heading">My Readlist</h1>
        </div>
        {isAuthenticated ? (
          <div>
            {readList.length > 0 ? (
              <div className="book-grid">
                {readList.map((book) => (
                  <BookCard book={book} key={book.id} type="readList" />
                ))}
              </div>
            ) : (
              <h2 className="no-books">Reading List Empty.</h2>
            )}
          </div>
        ) : (
          <h2 className="no-books">Please <span onClick={loginWithRedirect} style={{cursor: 'pointer', color: 'blue'}}>log in</span>.</h2>
        )}
      </div>
    </div>
  );
}
