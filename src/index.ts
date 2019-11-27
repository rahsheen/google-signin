import { useState, useEffect, useRef } from 'react';
//@ts-ignore
import { loadScript } from './load-script';

type GoogleUser = User | gapi.auth2.GoogleUser | void;

interface GoogleAuthInstance {
  signIn: () => Promise<GoogleUser>;
  signOut: () => Promise<void>;
  isSignedIn: () => Promise<boolean>;
  currentUser: () => Promise<GoogleUser>;
  disconnect: () => Promise<void>;
}

function platformSelect<T>(native: T, web: T): T {
  return typeof navigator != 'undefined' && navigator.product === 'ReactNative'
    ? native
    : web;
}

function webFactory(webInst: gapi.auth2.GoogleAuth): GoogleAuthInstance {
  const { signIn, signOut, isSignedIn, currentUser, disconnect } = webInst;
  return {
    signIn: signIn.bind(webInst),
    signOut: signOut.bind(webInst),
    isSignedIn: () => Promise.resolve(isSignedIn.get()),
    currentUser: () => Promise.resolve(currentUser.get()),
    disconnect: disconnect.bind(webInst),
  };
}

function nativeFactory(nativeInst: GoogleSignin): GoogleAuthInstance {
  const {
    signIn,
    signOut,
    isSignedIn,
    // signInSilently,
    getCurrentUser: currentUser,
    revokeAccess: disconnect,
  } = nativeInst;
  return {
    signIn,
    signOut,
    isSignedIn,
    currentUser,
    disconnect,
    // currentUser: () => signInSilently(), // TODO: This rejects when not logged in
  };
}

export function useGoogleSignIn(config: any, GoogleSignIn?: GoogleSignin) {
  const [googleAuth, setGoogleAuth] = useState<GoogleAuthInstance>();
  const authRef = useRef<gapi.auth2.GoogleAuth>();
  // const [tokens, setTokens] = useState({ accessToken: '', idToken: '' });

  const [userInfo, setUserInfo] = useState<GoogleUser>();
  const [error, setError] = useState<Error | null>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const gapiInit = () => {
      setLoading(true);
      loadScript(
        document,
        'script',
        'rahsheen-google-signin',
        'https://apis.google.com/js/api.js',
        () => {
          window.gapi.load('auth2', () => {
            window.gapi.auth2
              .init(config)
              .then((newGoogleAuthInst: gapi.auth2.GoogleAuth) => {
                setLoading(false);
                setGoogleAuth(webFactory(newGoogleAuthInst));
                authRef.current = newGoogleAuthInst;
              });
          });
        }
      );
    };

    const gsInit = () => {
      if (!GoogleSignIn) throw new Error('react-native-google-signin missing');
      GoogleSignIn.configure(config);
      setGoogleAuth(nativeFactory(GoogleSignIn));
    };

    // TODO: Maybe should actually check if already configured?
    platformSelect(gsInit, gapiInit).call(null);

    return platformSelect(
      () => {},
      () => {
        try {
          const el = document.getElementById('rahsheen-google-signin');
          el && el.parentNode && el.parentNode.removeChild(el);
        } catch (error) {
          // just ignore it; the container is already removed
        }
      }
    );
  }, [config, GoogleSignIn]);

  useEffect(() => {
    if (!googleAuth) return;

    googleAuth.isSignedIn().then(isSignedIn => {
      if (isSignedIn) googleAuth.currentUser().then(setUserInfo);
    });
  }, [googleAuth]);

  const signIn = async () => {
    if (!googleAuth) throw new Error('Google signin not initialized');

    setLoading(true);

    try {
      let newUserInfo: GoogleUser;
      let alreadySignedIn = await googleAuth.isSignedIn();
      if (!alreadySignedIn) {
        console.log('Signing in!');
        newUserInfo = await googleAuth.signIn();
      } else {
        console.log('Already In');
        newUserInfo = await googleAuth.currentUser();
      }
      console.log(`Got userInfo`, newUserInfo);
      setUserInfo(newUserInfo);
      setError(null);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // const signIn = () => {
  //   const go = authRef.current && authRef.current.signIn;
  //   // googleAuth && googleAuth.signIn();
  //   console.log(
  //     authRef.current && authRef.current.signIn,
  //     googleAuth && googleAuth.signIn
  //   );
  //   go && go();
  // };

  const signOut = async () => {
    try {
      if (googleAuth) {
        await googleAuth.disconnect();
        await googleAuth.signOut();
      }

      setError(null);
      setUserInfo();
    } catch (error) {
      setError(error);
    }
  };

  return {
    // tokens,
    userInfo,
    loading,
    signOut,
    signIn,
    error,
  };
}

export interface HasPlayServicesParams {
  /**
   * When showPlayServicesUpdateDialog is true, the user will be prompted to
   * install Play Services if on Android and they are not installed.
   * Default is true
   */
  showPlayServicesUpdateDialog?: boolean;
}

export interface ConfigureParams {
  /**
   * The Google API scopes to request access to. Default is email and profile.
   */
  scopes?: string[];

  /**
   * Web client ID from Developer Console. Required for offline access
   */
  webClientId?: string;

  /**
   * If you want to specify the client ID of type iOS
   */
  iosClientId?: string;

  /**
   * Must be true if you wish to access user APIs on behalf of the user from
   * your own server
   */
  offlineAccess?: boolean;

  /**
   * Specifies a hosted domain restriction
   */
  hostedDomain?: string;

  /**
   * ANDROID ONLY. Specifies if the consent prompt should be shown at each login.
   */
  forceConsentPrompt?: boolean;

  /**
   * ANDROID ONLY. An account name that should be prioritized.
   */
  accountName?: string;
}

export interface User {
  user: {
    id: string | null;
    name: string | null;
    email: string | null;
    photo: string | null;
    familyName: string | null;
    givenName: string | null;
  };
  scopes?: string[];
  idToken: string | null;
  accessToken: string | null;
  /**
   * Deprecated
   */
  accessTokenExpirationDate: number | null;
  /**
   * Not null only if a valid webClientId and offlineAccess: true was
   * specified in configure().
   */
  serverAuthCode: string | null;
}

export interface GoogleSignin {
  /**
   * Check if the device has Google Play Services installed. Always resolves
   * true on iOS
   */
  hasPlayServices(params?: HasPlayServicesParams): Promise<boolean>;

  /**
   * Configures the library for login. MUST be called before attempting login
   */
  configure(params?: ConfigureParams): void;

  /**
   * Returns a Promise that resolves with the current signed in user or rejects
   * if not signed in.
   */
  signInSilently(): Promise<User>;

  /**
   * Returns a Promise that resolves with the current signed in user
   */
  getCurrentUser(): Promise<User>;

  /**
   * Prompts the user to sign in with their Google account. Resolves with the
   * user if successful.
   */
  signIn(): Promise<User>;

  /**
   * Signs the user out.
   */
  signOut(): Promise<void>;

  /**
   * Removes your application from the user's authorized applications
   */
  revokeAccess(): Promise<void>;

  /**
   * Returns whether the user is currently signed in
   */
  isSignedIn(): Promise<boolean>;
}
