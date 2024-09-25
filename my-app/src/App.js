import React, { useState } from 'react';
import SignUp from './SignUp';
import SignIn from './SignIn';
import TodoList from './TodoList';

function App() {
  const [token, setToken] = useState(null); // To store the JWT token
  const [showSignUp, setShowSignUp] = useState(false); // To switch between sign-in and sign-up

  // Callback to receive the token after authentication
  const handleAuthentication = (jwtToken) => {
    setToken(jwtToken);
    console.log('JWT Token received:', jwtToken);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>To-Do App with Cognito Authentication</h1>

        {/* If token exists, show the Todo List; otherwise, show auth forms */}
        {!token ? (
          <div>
            <button onClick={() => setShowSignUp(false)}>Sign In</button>
            <button onClick={() => setShowSignUp(true)}>Sign Up</button>

            {showSignUp ? (
              <SignUp onAuthenticated={handleAuthentication} />
            ) : (
              <SignIn onAuthenticated={handleAuthentication} />
            )}
          </div>
        ) : (
          <TodoList token={token} />
        )}
      </header>
    </div>
  );
}

export default App;
