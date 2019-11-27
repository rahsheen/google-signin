import { useState, useEffect } from 'react';

type GoogleUser = User | gapi.auth2.GoogleUser | void;

function platformSelect<T>(native: T, web: T): T {
  return typeof navigator != 'undefined' && navigator.product === 'ReactNative'
    ? native
    : web;
}

export function useGoogleSignIn(config: any, GoogleSignIn?: GoogleSignin) {
  const [googleAuth, setGoogleAuth] = useState<gapi.auth2.GoogleAuth>();
  // const [tokens, setTokens] = useState({ accessToken: '', idToken: '' });

  const [userInfo, setUserInfo] = useState<GoogleUser>();
  const [error, setError] = useState<Error | null>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const gapiInit = () => {
      (window as any).gapi.load('auth2', () => {
        (window as any).gapi.auth2
          .init(config)
          .then((googleAuth: gapi.auth2.GoogleAuth) => {
            setGoogleAuth(googleAuth);
            console.log('Got GoogleAuth', googleAuth);

            if (googleAuth.isSignedIn.get())
              setUserInfo(googleAuth.currentUser.get());
          });
      });
    };
    // TODO: Should actually check if already configured?
    const init = platformSelect(
      () => GoogleSignIn && GoogleSignIn.configure(config),
      gapiInit
    );
    init();
  }, [config, GoogleSignIn]);

  const signedIn = async (): Promise<boolean> => {
    let bool = platformSelect(
      GoogleSignIn ? GoogleSignIn.isSignedIn : () => Promise.resolve(false),
      () => Promise.resolve(!!googleAuth && googleAuth.isSignedIn.get())
    );
    return bool();
  };

  // const _signIn = async () => {
  //   const si = platformSelect<
  //     () => Promise<User | gapi.auth2.GoogleUser | void>
  //   >(
  //     GoogleSignIn ? GoogleSignIn.signIn : () => Promise.resolve(),
  //     googleAuth ? googleAuth.signIn : () => Promise.resolve()
  //   );

  //   const user = si();
  //   return user;
  // };

  const _currentUser = async () => {
    const cu = platformSelect<
      () => Promise<User | gapi.auth2.GoogleUser | void>
    >(
      GoogleSignIn ? GoogleSignIn.signInSilently : () => Promise.resolve(),
      async () => googleAuth && googleAuth.currentUser.get()
    );
    return cu();
  };

  const signIn = async () => {
    setLoading(true);

    try {
      let newUserInfo: GoogleUser;
      let alreadySignedIn = await signedIn();
      if (!alreadySignedIn) {
        console.log('Signing in!');
        newUserInfo = await googleAuth!.signIn();
      } else {
        console.log('Already In');
        newUserInfo = await _currentUser();
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
