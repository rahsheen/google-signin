import { useState, useEffect } from 'react';

const platformSelect = (native: any, web: any) =>
  typeof navigator != 'undefined' && navigator.product == 'ReactNative'
    ? native
    : web;

export function useGoogleSignIn(
  config: any,
  GoogleSignIn: any
) {
  const [googleAuth, setGoogleAuth] = useState<gapi.auth2.GoogleAuth|GoogleSignin>();
  // const [tokens, setTokens] = useState({ accessToken: '', idToken: '' });

  const [userInfo, setUserInfo] = useState();
  const [error, setError] = useState<Error | null>();
  const [loading, setLoading] = useState(false);

  const gapiInit = () => {
    (window as any).gapi.load('auth2', () => {
      (window as any).gapi.auth2.init(config).then((googleAuth: any) => {
        setGoogleAuth(googleAuth);

        if (googleAuth.isSignedIn.get())
          setUserInfo(googleAuth.currentUser.get());
      });
    });
  };

  useEffect(() => {
    const init = platformSelect(
      () => GoogleSignIn.configure(config),
      gapiInit
    ) as Function;
    init();
  }, [config]);

  const signedIn = async (): Promise<boolean> => {
    let bool = platformSelect(
      GoogleSignIn.isSignedIn,
      () => googleAuth && googleAuth.isSignedIn.get()
    ) as Function;
    return bool();
  };

  const _signIn = async () => {
    const si = platformSelect(
      GoogleSignIn.signIn,
      googleAuth && googleAuth.signIn
    ) as Function;
    return si;
  };

  const _currentUser = async () => {
    const curUser = platformSelect(
      GoogleSignIn.getCurrentUser,
      () => googleAuth && googleAuth.currentUser.get()
    ) as Function;
    return curUser();
  };

  const signIn = async () => {
    setLoading(true);

    try {
      let newUserInfo;
      let alreadySignedIn = await signedIn();
      if (!alreadySignedIn) {
        console.log('Signing in!');
        newUserInfo = await _signIn();
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
      setUserInfo(null);
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
