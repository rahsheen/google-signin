# @rahsheen/google-signin

A simple React hook for using Google Signin on React and React Native.

## Why You Need This

Setting up Google Signin can be a pain. This simple hook aims to simplify the setup and usage so you can sign-in with Google and access Google API's in a simple way on multiple platforms.

It also makes the API's consistent between React and React Native to more easily share code.

### Prerequisites

Built on:

"react": ">=16",
"react-native": ">=0.59",
"react-native-google-signin": ">=2.1"

### Installing

```
npm install @rahsheen/google-signin
```

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

* [React](http://reactjs.org/)
* [React Native](https://facebook.github.io/react-native/)

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* [React Google Login](https://github.com/anthonyjgrove/react-google-login)
* [React Native Google Signin](https://github.com/react-native-community/react-native-google-signin)
