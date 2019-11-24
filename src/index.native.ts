import { useState, useEffect } from 'react';

export function useGoogleSignIn(config: object, googleSignIn?: any) {
  const {
    isSignedIn,
    // getCurrentUser,
    // getTokens,
    configure,
    hasPlayServices,
    signIn,
    // signInSilently,
    signOut,
    revokeAccess,
  } = googleSignIn;

  // const [tokens, setTokens] = useState({ accessToken: '', idToken: '' });
  const [userInfo, setUserInfo] = useState();
  const [error, setError] = useState<Error | null>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    configure(config);
  }, [config, configure]);

  const _signIn = async () => {
    setLoading(true);

    try {
      await hasPlayServices();
      const newUserInfo = await signIn();
      setUserInfo(newUserInfo);
      setError(null);
    } catch (error) {
      console.log('Something went wrong', error.toString());
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const _signOut = async () => {
    try {
      await revokeAccess();
      await signOut();

      setError(null);
      setUserInfo(null);
    } catch (error) {
      setError(error);
    }
  };

  // const _getCurrentUser = async () => {
  //   setLoading(true);

  //   try {
  //     let newUserInfo;
  //     const signedIn = await isSignedIn();
  //     if (!signedIn) {
  //       newUserInfo = await signInSilently();
  //     } else {
  //       newUserInfo = await getCurrentUser();
  //     }
  //     setUserInfo(newUserInfo);
  //     const newTokens = await getTokens();
  //     setTokens(newTokens);
  //     setError(null);
  //   } catch (error) {
  //     // Just need to sign in
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return {
    isSignedIn,
    // tokens,
    userInfo,
    loading,
    signOut: _signOut,
    signIn: _signIn,
    error,
  };
}
