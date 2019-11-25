import { useState, useEffect } from 'react';

const platformSelect = (native: object, web: object) =>
  typeof navigator != 'undefined' && navigator.product == 'ReactNative'
    ? native
    : web;

export function useGoogleSignIn(config: object, GoogleSignIn: any) {
  const [googleAuth, setGoogleAuth] = useState<any>({});
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
    let bool = platformSelect(GoogleSignIn.isSignedIn, () =>
      googleAuth.isSignedIn.get()
    ) as Function;
    return bool();
  };

  const _signIn = async () => {
    const si = platformSelect(
      GoogleSignIn.signIn,
      googleAuth && googleAuth.signIn
    ) as Function;
    return si();
  };
  const _currentUser = async () => {
    const curUser = platformSelect(GoogleSignIn.getCurrentUser, () =>
      googleAuth.currentUser().get()
    ) as Function;
    return curUser();
  };

  const signIn = async () => {
    setLoading(true);

    try {
      let newUserInfo;
      let alreadySignedIn = await signedIn();
      if (!alreadySignedIn) {
        newUserInfo = await _signIn();
      } else {
        newUserInfo = await _currentUser();
      }
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
      await googleAuth.disconnect();
      await googleAuth.signOut();

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
    // Button,
    error,
  };
}
