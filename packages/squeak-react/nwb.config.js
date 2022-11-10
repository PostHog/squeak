module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: {
      global: 'Squeak',
      externals: {
        react: 'React'
      }
    }
  }
}
