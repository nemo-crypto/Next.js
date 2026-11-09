'use client';
export default function GlobalError({ reset }: { reset: () => void }) {
    return <html lang='en'><body><main><h1>Something went wrong</h1><button onClick={reset}>Try again</button></main></body></html>;
}
