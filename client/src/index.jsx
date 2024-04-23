import React from "react";
import * as ReactDOMClient from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./components/NotFound";
import Home from "./components/Home";
import { Auth0Provider } from "@auth0/auth0-react";
import { AuthTokenProvider } from "./AuthTokenContext";

import GlobalProvider from "./context/GlobalState";
import "./style/index.css";

import Layout from "./components/Layout";
import VerifyUser from "./components/VerifyUser";
import ReadList from "./components/ReadList";
import MyProfile from "./components/MyProfile";
import BookDetails from "./components/BookDetails"

const container = document.getElementById("root");
const root = ReactDOMClient.createRoot(container);

const requestedScopes = ["profile", "email"];

root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/verify-user`,
        audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        scope: requestedScopes.join(" "),
      }}
    >
      <AuthTokenProvider>
        <GlobalProvider>
          <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/verify-user" element={<VerifyUser />} />
                  <Route path="/read-list" element={<ReadList />} />
                  <Route path="/my-profile" element={<MyProfile />} />
                  <Route path="/books/:isbn" element={<BookDetails />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
          </BrowserRouter>
        </GlobalProvider>
      </AuthTokenProvider>
    </Auth0Provider>
  </React.StrictMode>
);
