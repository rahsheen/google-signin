import React, {FunctionComponent} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  StatusBar,
  Button,
  ActivityIndicator,
  Text,
} from 'react-native';

import {Header} from 'react-native/Libraries/NewAppScreen';

import {GoogleSignin} from 'react-native-google-signin';
import config from './googleSigninConfig';
import {
  useGoogleSignIn,
  GoogleAuthUser,
  AuthTokens,
} from '@rahsheen/google-signin';

const Error = ({error}: {error: any}) => {
  if (!error) {
    return null;
  }
  const text = `${error.toString()} ${error.code ? error.code : ''}`;
  return <Text>{text}</Text>;
};

interface UserInfoProps {
  userInfo: GoogleAuthUser;
  tokens: AuthTokens;
}

const UserInfo: FunctionComponent<UserInfoProps> = ({userInfo, tokens}) => {
  return (
    <View>
      <Text>Welcome {userInfo.user.name}</Text>
      <Text>Your user info: {JSON.stringify(userInfo.user)}</Text>
    </View>
  );
};

const App = () => {
  const {userInfo, error, signIn, signOut, loading, tokens} = useGoogleSignIn(
    config,
    GoogleSignin,
  );

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <Header />
          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <View>
              <View style={styles.container}>
                {userInfo ? (
                  <View>
                    <UserInfo userInfo={userInfo} tokens={tokens} />
                    <Button title="sign out" onPress={signOut} />
                  </View>
                ) : (
                  <View>
                    <Button title="sign in" onPress={signIn} />
                  </View>
                )}
                <Error error={error} />
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});

export default App;
