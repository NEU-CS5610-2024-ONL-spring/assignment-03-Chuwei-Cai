import { useAuth0 } from "@auth0/auth0-react";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthToken } from "../AuthTokenContext";
import '../style/myprofile.css';

export default function MyProfile() {
  const { user, isAuthenticated, loginWithRedirect } = useAuth0();
  const [nickname, setNickname] = useState('');
  const [updatedNickname, setUpdatedNickname] = useState(''); // State to store the updated nickname
  const { accessToken } = useAuthToken();

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error(`Network error: ${response.status}`);
      }

      if (!user.nickname) {
        setNickname(user.email); // Set default user nickname as email if current nickname is null
      } else {
        setNickname(user.nickname); // Use current nickname if available
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [accessToken, user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated, accessToken, fetchUserData]);

  const handleNameUpdate = (event) => {
    setUpdatedNickname(event.target.value); // Store the updated nickname in state
  };

  const updateName = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/update-user-name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ nickname: updatedNickname }), // Use updatedNickname instead of nickname
      });

      if (!response.ok) {
        throw new Error(`Error when updating name: ${response.status}`);
      }

      // If the update was successful, fetch the user data again to get the updated nickname
      await fetchUserData();
      setNickname(updatedNickname); // Update nickname state with the updated value

    } catch (error) {
      console.error('Error when updating name:', error);
    }
  };

  return (
    <div className="profile-container">
      {isAuthenticated ? (
        <>
          <div className="profile-detail">
            <input type="text" id="name" value={updatedNickname} onChange={handleNameUpdate} placeholder="Update nickname" />
            <button onClick={updateName}>Update Nickname</button>
          </div>
          <div className="profile-detail">
            <p>Nick Name: {nickname}</p>
          </div>
          <div className="profile-detail">
            <p>Email: {user.email}</p>
          </div>
          <div className="profile-detail">
            <p>Email verified: {user.email_verified?.toString()}</p>
          </div>
        </>
      ) : (
        <h2 className="no-books">Please <span onClick={loginWithRedirect} style={{ cursor: 'pointer', color: 'blue' }}>log in</span>.</h2>
      )}
    </div>
  );
}