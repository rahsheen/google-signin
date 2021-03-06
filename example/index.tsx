import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { useGoogleSignIn } from '../.';
require('dotenv').config();

const config = {
  fetch_basic_profile: true,
  client_id: process.env.GOOGLE_CLIENT_ID,
};

const App = () => {
  const { userInfo, error, signIn, signOut, loading } = useGoogleSignIn(config);
  if (error) console.log(error);

  if (userInfo)
    return (
      <div className="App">
        <header className="App-header">
          <p>You're Signed In!</p>
          <button id="loginButton" onClick={signOut}>
            Sign Out
          </button>
        </header>
      </div>
    );

  return (
    <div className="App">
      <header className="App-header">
        <p>You are not signed in. Click here to sign in.</p>
        {loading ? (
          <div className="loader">Loading...</div>
        ) : (
          <button id="loginButton" onClick={signIn}>
            Login with Google
          </button>
        )}
      </header>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
