/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        outputStandalone: true,
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/questions',
                permanent: false,
            },
        ]
    },
}

module.exports = nextConfig
