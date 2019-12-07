# @rahsheen/google-signin

A simple React hook for using Google Signin on React and React Native.

## Why You Need This

Setting up Google Signin can be a pain. This simple hook aims to simplify the setup and usage so you can sign-in with Google and access Google API's in a simple way on multiple platforms.

It also makes the API's consistent between React and React Native to more easily share code.

### Prerequisites

Built on:

- "react": ">=16",
- "react-native": ">=0.59",
- "react-native-google-signin": ">=2.1"

### Installing

```bash
npm install @rahsheen/google-signin
```

For react-native, you will (for now) also need to install [react-native-google-signin](https://github.com/react-native-community/react-native-google-signin)

## Usage

### React JS [example](https://github.com/rahsheen/google-signin/tree/master/example)

```js
const { userInfo, error, signIn, signOut, loading } = useGoogleSignIn(config);
```

### React Native [example](https://github.com/rahsheen/google-signin/tree/master/rnExample)

```js
const {userInfo, error, signIn, signOut, loading, tokens} = useGoogleSignIn(
    config,
    GoogleSignin, // From react-native-google-signin
  );
```

## Built With

- [React](http://reactjs.org/)
- [React Native](https://facebook.github.io/react-native/)
- [Google OAuth2](https://developers.google.com/identity/protocols/OAuth2)

## Contributing

Yes, please!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

- [React Google Login](https://github.com/anthonyjgrove/react-google-login)
- [React Native Google Signin](https://github.com/react-native-community/react-native-google-signin)
