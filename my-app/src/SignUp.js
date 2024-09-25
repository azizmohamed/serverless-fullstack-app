import React, { useState } from 'react';
import { CognitoIdentityProviderClient, SignUpCommand, ConfirmSignUpCommand, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';

const REGION = 'REGION';  // e.g., 'us-east-1'
const CLIENT_ID = 'CLIENT_ID';  // e.g., 'XXXXXX'

const client = new CognitoIdentityProviderClient({ region: REGION });

function SignUp({ onAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isSignUpComplete, setIsSignUpComplete] = useState(false);  // Track if the user has signed up
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Sign-up the user
  const handleSignUp = async () => {
    try {
      const command = new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: username,
        Password: password,
        UserAttributes: [
          {
            Name: 'email',
            Value: email,
          },
        ],
      });

      await client.send(command);
      setMessage('Sign-up successful! Please check your email to verify your account.');
      setError(null);
      setIsSignUpComplete(true);  // Move to the confirmation phase
    } catch (err) {
      setError('Sign-up failed. ' + err.message);
      console.error('Sign-up error:', err);
    }
  };

  // Confirm the user's sign-up
  const handleConfirmSignUp = async () => {
    try {
      const confirmCommand = new ConfirmSignUpCommand({
        ClientId: CLIENT_ID,
        Username: username,
        ConfirmationCode: confirmationCode,
      });

      await client.send(confirmCommand);
      setMessage('Account confirmed! You can now sign in.');
      setError(null);

      // After confirming, sign the user in to get the token
      const signInCommand = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: CLIENT_ID,
        AuthParameters: {
          USERNAME: username,
          PASSWORD: password,
        },
      });

      const response = await client.send(signInCommand);
      const token = response.AuthenticationResult.IdToken;
      setMessage('Signed in successfully! Now you can access protected resources.');
      onAuthenticated(token);  // Pass the token to the parent component for future API calls
    } catch (err) {
      setError('Confirmation or Sign-in failed. ' + err.message);
      console.error('Confirmation error:', err);
    }
  };

  return (
    <div>
      <h1>{isSignUpComplete ? 'Confirm Sign-Up' : 'Sign Up'}</h1>
      
      {!isSignUpComplete ? (
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleSignUp}>Sign Up</button>
        </div>
      ) : (
        <div>
          <p>Please enter the confirmation code sent to your email</p>
          <input
            type="text"
            placeholder="Confirmation Code"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
          />
          <button onClick={handleConfirmSignUp}>Confirm Sign-Up</button>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
    </div>
  );
}

export default SignUp;
