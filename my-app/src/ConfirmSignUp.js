import React, { useState } from 'react';
import { CognitoIdentityProviderClient, ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';

const REGION = 'ap-southeast-2';  // e.g., 'us-east-1'
const CLIENT_ID = '5smu4ph3npsvq8om48mmg8912v';  // e.g., 'XXXXXX'

const client = new CognitoIdentityProviderClient({ region: REGION });

function ConfirmSignUp() {
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleConfirmSignUp = async () => {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: CLIENT_ID,
        Username: username,
        ConfirmationCode: code,
      });

      const response = await client.send(command);
      setMessage('Account confirmed! You can now sign in.');
      setError(null);
    } catch (err) {
      setError('Confirmation failed. ' + err.message);
      console.error('Confirmation error:', err);
    }
  };

  return (
    <div>
      <h1>Confirm Sign-Up</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="text"
        placeholder="Confirmation Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button onClick={handleConfirmSignUp}>Confirm</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
    </div>
  );
}

export default ConfirmSignUp;
