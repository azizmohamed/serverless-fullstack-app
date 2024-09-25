import React, { useState } from 'react';
import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';

const REGION = 'REGION';  // e.g., 'us-east-1'
const CLIENT_ID = 'CLIENT_ID';  // e.g., 'XXXXXX'

const client = new CognitoIdentityProviderClient({ region: REGION });

function SignIn({ onAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSignIn = async () => {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: CLIENT_ID,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      });

      const response = await client.send(command);
      const token = response.AuthenticationResult.IdToken;
      console.log('Sign-in successful. JWT Token:', token);
      onAuthenticated(token);  // Pass the token to the parent component
    } catch (err) {
      setError('Sign-in failed. ' + err.message);
      console.error('Sign-in error:', err);
    }
  };

  return (
    <div>
      <h1>Sign In</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSignIn}>Sign In</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default SignIn;
