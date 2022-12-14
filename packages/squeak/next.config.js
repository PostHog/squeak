const removeImports = require('next-remove-imports')()
const fs = require('fs')

const { withSentryConfig } = require('@sentry/nextjs')

fs.writeFileSync('./prisma/ca-cert.crt', process.env.DATABASE_CA_CERT)

/** @type {import('next').NextConfig} */
const moduleExports = {
    reactStrictMode: true,
    outputFileTracing: true,
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

const sentryWebpackPluginOptions = {
    // Additional config options for the Sentry Webpack plugin. Keep in mind that
    // the following options are set automatically, and overriding them is not
    // recommended:
    //   release, url, org, project, authToken, configFile, stripPrefix,
    //   urlPrefix, include, ignore

    silent: true, // Suppresses all logs
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options.
}

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = removeImports(withSentryConfig(moduleExports, sentryWebpackPluginOptions))
