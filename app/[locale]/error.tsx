'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
    return <main role='alert'><h1>Unable to load this page</h1><p>Please try again.</p><button onClick={reset}>Try again</button></main>;
}
