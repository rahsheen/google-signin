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