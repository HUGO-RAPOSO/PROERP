import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'covers.openlibrary.org',
                pathname: '/b/**',
            },
            {
                protocol: 'https',
                hostname: 'tnxgorhammrpdboykcn.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
};

export default nextConfig;
