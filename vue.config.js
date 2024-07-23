module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: "my-electron-vue-project",
        appId: "com.example.my-electron-vue-project",
        directories: {
          output: "dist_electron"
        },
        files: [
          "dist/**/*",
          "node_modules/**/*",
          "package.json"
        ],
        mac: {
          icon: "build/icons/icon.icns"
        },
        win: {
          icon: "build/icons/icon.ico"
        },
        linux: {
          icon: "build/icons"
        }
      }
    }
  }
}