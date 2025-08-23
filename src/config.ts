import dotenv from 'dotenv';
dotenv.config();

export interface Config {
    googleCredentialsPath?: string;
    googleClientId?: string;
    googleClientSecret?: string;
    googleRefreshToken?: string;
    port: number;
    isProduction: boolean;
}

export function loadConfig(): Config {
    // For Google Calendar API, we support multiple auth methods:
    // 1. Service account credentials file path
    // 2. OAuth2 credentials (client ID, secret, refresh token)
    
    const googleCredentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    // Validate that at least one authentication method is provided
    if (!googleCredentialsPath && !(googleClientId && googleClientSecret && googleRefreshToken)) {
        throw new Error(
            'Google Calendar authentication required. Set either:\n' +
            '1. GOOGLE_APPLICATION_CREDENTIALS (path to service account key file), or\n' +
            '2. GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN'
        );
    }

    const port = parseInt(process.env.PORT || '8080', 10);
    const isProduction = process.env.NODE_ENV === 'production';

    return {
        googleCredentialsPath,
        googleClientId,
        googleClientSecret,
        googleRefreshToken,
        port,
        isProduction,
    };
}