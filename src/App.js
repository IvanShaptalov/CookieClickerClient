import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import axios from 'axios';
import './App.css';

function App() {
  // const [isFetched, setIsFetched] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  var scoreIncrementation = 1
  let host = 'http://localhost:3001/'
  var getUserEndpoint = `${host}user?user_id=${getUserId()}`;
  var createUserEndpoint = `${host}user/create`;
  var updateScoreEndpoint = `${host}score/increment?user_id=${getUserId()}&score=${scoreIncrementation}`

  function getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('userId', userId);
    }
    return userId;
}

  function setUserId(userId) {
    localStorage.setItem('userId', userId)
  }

  const [user, setUser] = useState({ user_id: '', score: 0 });

  const createUser = async () => {
    try {
      const response = await axios.post(createUserEndpoint, {
        user_id: getUserId(),
        score: user.score
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const getUser = async () => {
    try {
      const response = await axios.get(getUserEndpoint);
      if (response.data) {
        setUser(response.data);
      } else {
        await createUser();
      }
    } catch (error) {
      if ((error.response && error.response.status === 404) || error.response.status === 400) {
        await createUser();
      } else {
        console.error("Error fetching user:", error);
      }
    }
  };

  const updateScore = async () => {
    const response = await axios.post(updateScoreEndpoint);
    setUser(response.data);
  };


  useEffect(()=>{
    console.log('user loaded')
    getUser()
}, []) // <-- empty dependency array

  const saveUserToFile = () => {
    if (user) {
      const blob = new Blob([JSON.stringify(user, null, 2)], { type: 'application/json' });
      saveAs(blob, 'user_data.json');
    }
  };

  const uploadUserFromFile = async (event) => {
    const file = event.target.files[0];
  
    if (file) {
      const reader = new FileReader();
  
      reader.onload = async (e) => {
        try {
          const fileContent = e.target.result;
          const cleanedJsonString = fileContent.replace(/^this\s*/, '');
          const userData = JSON.parse(cleanedJsonString);
       
          user.user_id = userData.user_id
          user.score = userData.score
          setUserId(user.user_id)

          // Optionally, send the uploaded user data to the server
          await createUser();

          console.log('data sent to server');
        } catch (error) {
          console.error("Error uploading user data:", error);
        }
      };
  
      reader.onerror = (error) => {
        console.error('File reading error:', error);
      };
  
      reader.readAsText(file);
    } else {
      console.error('No file selected');
    }
  };
  

  const openUploadDialog = () => {
    setIsDialogOpen(true);
  };

  const closeUploadDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Simple React App with API</h1>
        <button onClick={updateScore}>Update Score</button>
        <button onClick={saveUserToFile}>Save user</button>
        <button onClick={openUploadDialog}>Upload User</button>
      
      {isDialogOpen && (
        <div className="dialog">
          <h3>Upload User Data</h3>
          <input type="file" onChange={uploadUserFromFile} accept="application/json" />
          <button onClick={closeUploadDialog}>Close</button>
        </div>
      )}
        <div>
          <h2>User Information</h2>
          <p>ID: {user.user_id}</p>
          <p>Score: {user.score}</p>
        </div>
      </header>
    </div>
  );
}

export default App;
