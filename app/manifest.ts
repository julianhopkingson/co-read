import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'co-read',
        short_name: 'co-read',
        description: 'A minimalist minimalist space for reading and discussing books.',
        start_url: '/',
        display: 'standalone',
        background_color: '#f7f5f2',
        theme_color: '#f7f5f2',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    };
}
