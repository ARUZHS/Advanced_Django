const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 5173,
    host: 'localhost', // Explicitly set the host
    allowedHosts: 'all' // Ensure it binds correctly
  }
})

