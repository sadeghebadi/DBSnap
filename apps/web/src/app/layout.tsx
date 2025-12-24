import { getConfig } from '@dbsnap/shared';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    if (typeof window === 'undefined') {
        const config = getConfig();
        console.log(`DBSnap Web starting on port ${config.API_PORT}...`);
    }

    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
