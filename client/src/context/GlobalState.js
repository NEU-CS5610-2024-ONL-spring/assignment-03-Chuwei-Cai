// This is the global state for the app. It is used to store the readlist and to add and remove books from the readlist.
import React, {createContext, useEffect, useState} from 'react';
import { useAuthToken } from "../AuthTokenContext";

export const GlobalContext = createContext(); // create context 

// provider components
export default function GlobalProvider(props) {
    const [readList, setReadList] = useState([]);
    const { accessToken } = useAuthToken();

    useEffect(() => {
        async function getReadListFromApi() {
          // fetch the read list from the API, passing the access token in the Authorization header
          const response = await fetch(`${process.env.REACT_APP_API_URL}/read-list`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });
  
          if (response.ok) {
            const data = await response.json();
            console.log("readlist", data);
            setReadList(data);
          }
        }
  
        if (accessToken) {
          getReadListFromApi();
        }
      }, [accessToken]);


      async function addBookToReadList(book) {
        try {
            console.log("book in GlobalState: ", book)
          const response = await fetch(`${process.env.REACT_APP_API_URL}/readlist/addBook`, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(book),
            credentials: 'include'
          });
          
      
          if (response.ok) {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/read-list`, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: 'include'
            });
    
            if (response.ok) {
              const data = await response.json();
              console.log("readlist", data);
              setReadList(data);
            }
          } else {
            console.error('Failed to add book to readlist');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
      

      async function removeBookFromReadList(id) {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/readlist/removeBook/${id}`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              credentials: 'include'
          })
      
          if (response.ok) {
            setReadList(prevReadList => {
                const newReadList = prevReadList.filter(book => book.id !== id);
                console.log('newReadList', newReadList);
                return newReadList;
              });
            // Reload the page after successfully removing the book from the read list
            window.location.reload();
          } else {
            console.error('Failed to remove book from readlist');
          }

        } catch (error) {
          console.error('Error:', error);
        }
      }
      

    return (
        <GlobalContext.Provider
            value={{
                readList: readList,
                addBookToReadList: addBookToReadList,
                removeBookFromReadList: removeBookFromReadList,
            }}
        >
            {props.children}
            
        </GlobalContext.Provider>
    );
}
