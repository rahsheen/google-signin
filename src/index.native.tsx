import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';

import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from 'react-native-google-signin';

export function useGoogleSignIn(config: object) {
  const { isSignedIn, getCurrentUser, getTokens } = GoogleSignin;
  const [tokens, setTokens] = useState({ accessToken: '', idToken: '' });

  const [userInfo, setUserInfo] = useState();
  const [error, setError] = useState<Error | null>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GoogleSignin.configure(config);
    _getCurrentUser();
  }, [config]);

  const _signIn = async () => {
    setLoading(true);

    try {
      await GoogleSignin.hasPlayServices();
      const newUserInfo = await GoogleSignin.signIn();
      setUserInfo(newUserInfo);
      setError(null);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // sign in was cancelled
        Alert.alert('cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation in progress already
        Alert.alert('in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Google Play services not available or outdated');
      } else {
        Alert.alert('Something went wrong', error.toString());
        setError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();

      setError(null);
      setUserInfo(null);
    } catch (error) {
      setError(error);
    }
  };

  const _getCurrentUser = async () => {
    setLoading(true);

    try {
      let newUserInfo;
      const signedIn = await isSignedIn();
      if (!signedIn) {
        newUserInfo = await GoogleSignin.signInSilently();
      } else {
        newUserInfo = await getCurrentUser();
      }
      setUserInfo(newUserInfo);
      const newTokens = await getTokens();
      setTokens(newTokens);
      setError(null);
    } catch (error) {
      // Just need to sign in
    } finally {
      setLoading(false);
    }
  };

  const Button = (props: any) => (
    <GoogleSigninButton
      style={{ width: 212, height: 48 }}
      size={GoogleSigninButton.Size.Standard}
      color={GoogleSigninButton.Color.Auto}
      onPress={_signIn}
      {...props}
    />
  );

  return {
    isSignedIn,
    tokens,
    userInfo,
    loading,
    signOut,
    Button,
    error,
  };
}
