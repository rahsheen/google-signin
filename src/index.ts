import { useState, useEffect, useRef } from 'react';
//@ts-ignore
import { loadScript } from './load-script';

export type GoogleUser = User | gapi.auth2.GoogleUser | void;
export type AuthTokens = UserTokens | gapi.auth2.AuthResponse | void;

interface GoogleAuthInstance {
  signIn: () => Promise<GoogleUser>;
  signOut: () => Promise<void>;
  isSignedIn: () => Promise<boolean>;
  currentUser: () => Promise<GoogleUser>;
  disconnect: () => Promise<void>;
  getTokens: () => Promise<AuthTokens>;
  // tokens: () => Promise<gapi.auth2.AuthResponse>;
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
    getTokens: () =>
      Promise.resolve(currentUser && currentUser.get().getAuthResponse()),
  };
}

function nativeFactory(nativeInst: GoogleSignin): GoogleAuthInstance {
  const {
    signIn,
    signOut,
    isSignedIn,
    hasPlayServices,
    getCurrentUser: currentUser,
    revokeAccess: disconnect,
    getTokens,
  } = nativeInst;

  const _signIn = async () => {
    await hasPlayServices({ showPlayServicesUpdateDialog: true });
    return await signIn();
  };

  return {
    signIn: _signIn,
    signOut,
    isSignedIn,
    currentUser,
    disconnect,
    getTokens,
  };
}

export function useGoogleSignIn(config: any, GoogleSignIn?: GoogleSignin) {
  const [googleAuth, setGoogleAuth] = useState<GoogleAuthInstance>();
  const authRef = useRef<gapi.auth2.GoogleAuth>();
  const [tokens, setTokens] = useState<AuthTokens>();

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

    platformSelect(gsInit, gapiInit).call(null);

    return platformSelect(
      () => {}, // No cleanup needed for native
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
      let alreadySignedIn = await googleAuth.isSignedIn();
      const googleUser = !alreadySignedIn
        ? await googleAuth.signIn()
        : await googleAuth.currentUser();
      setUserInfo(googleUser);
      const newTokens = await googleAuth.getTokens();
      setTokens(newTokens);
      setError(null);
    } catch (error) {
      console.error(error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

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
    tokens,
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

export interface UserTokens {
  idToken: string;
  accessToken: string;
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
   * Returns a Promise that resolves with the current signed in user
   */
  getTokens(): Promise<UserTokens>;

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
