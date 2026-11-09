export const Config = {
    apiDomain: process.env.NEXT_PUBLIC_API_URL,
    apiDomainFuture: process.env.NEXT_PUBLIC_API_FUTURES,
    websiteDomain: process.env.NEXT_PUBLIC_WEBSITE_URL,
    WebSocketDomain: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
    staticDomain: process.env.NEXT_PUBLIC_STATIC_URL,
    cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || undefined,
    languageParamName: process.env.NEXT_PUBLIC_LANGUAGE_PARAM_NAME || 'language',
};
