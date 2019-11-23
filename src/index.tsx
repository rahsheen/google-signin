import { useState, useEffect } from 'react';

export function useGoogleSignIn(config: object) {
  const [googleAuth, setGoogleAuth] = useState();
  // const [tokens, setTokens] = useState({ accessToken: '', idToken: '' });

  const [userInfo, setUserInfo] = useState();
  const [error, setError] = useState<Error | null>();
  const [loading, setLoading] = useState(true);

  const getGoogleAuth = () => {
    (window as any).gapi.load('auth2', () => {
      (window as any).gapi.auth2.init(config).then(setGoogleAuth);
    });
  }

  useEffect(() => {
    getGoogleAuth();
  }, [config]);

  useEffect(() => {
    if (!googleAuth) return;

    if (googleAuth.isSignedIn.get()) {
      setUserInfo(googleAuth.currentUser.get());
    }
  }, [googleAuth]);

  const signIn = async () => {
    setLoading(true);

    try {
      let newUserInfo;
      if (!googleAuth.isSignedIn.get()) {
        newUserInfo = await googleAuth.signIn();
      } else {
        newUserInfo = googleAuth.currentUser().get();
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

  //   const Button = (props: any) => (
  //     <GoogleSigninButton
  //       style={{ width: 212, height: 48 }}
  //       size={GoogleSigninButton.Size.Standard}
  //       color={GoogleSigninButton.Color.Auto}
  //       onPress={_signIn}
  //       {...props}
  //     />
  //   );

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
