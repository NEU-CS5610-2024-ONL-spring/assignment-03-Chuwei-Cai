import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MyProfile from '../components/MyProfile';
import '@testing-library/jest-dom/extend-expect';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuthToken, AuthTokenProvider } from "../AuthTokenContext";

// Mocking useAuth0 and useAuthToken
jest.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    isAuthenticated: false, // default mock values
    user: { email: "" }, // default mock values
    loginWithRedirect: jest.fn(), // default mock values
  }),
}));

jest.mock("../AuthTokenContext", () => ({
  useAuthToken: () => ({
    accessToken: "token", // default mock value
  }),
}));

// Mocking global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ nickname: "user@test.com" }),
  })
);

process.env.REACT_APP_API_URL = "http://localhost";

// Test for Unauthenticated Users
test('test login message for unauthenticated users', () => {
  const { getByText } = render(<MyProfile />);
  expect(screen.getByText(/you are not logged in/i)).toBeInTheDocument();
});

// Test for Authenticated Users
test('test user profile for authenticated users', () => {
  useAuth0.mockReturnValue({
    isAuthenticated: true,
    user: { 
      email: "user@test.com", 
      picture: "http://test.com/photo.jpg",
      sub: "auth0|123456",
      email_verified: true
    },
  });
  
  render(<MyProfile />);
  
  expect(screen.getByText("Email: user@test.com")).toBeInTheDocument();
  expect(screen.getByText("NickName: user@test.com")).toBeInTheDocument();
  expect(screen.getByText("Auth0Id: auth0|123456")).toBeInTheDocument();
});


// Test Profile Update Function
test('allows the user to update their nickname', async () => {
  useAuth0.mockReturnValue({
    isAuthenticated: true,
    user: { sub: "auth0|123456" },
  });

  render(<MyProfile />);

  // Wait for the fetch to complete and nickname to be set
  const input = await screen.findByDisplayValue("testuser");

  // inputting a new nickname
  fireEvent.change(input, { target: { value: 'newnickname' } });
  fireEvent.click(screen.getByRole('button', { name: /update nickname/i }));

  // check for updated value
  await waitFor(() => {
    expect(screen.getByText("👤 NickName: newnickname")).toBeInTheDocument();
  });
});