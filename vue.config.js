module.exports = {
  pluginOptions: {
    // NOTE:https://www.electron.build
    // NOTE:https://nklayman.github.io/vue-cli-plugin-electron-builder/
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        appId: 'com.uniecloud.ppt-client',
        productName: 'ppt-client',
        copyright: 'Copyright©unicloud',
        directories: {
          output: './dist_electron' // 输出文件路径
        },
        win: {
          // win相关配置
          icon: 'public/icon.png', // 图标256*256
          target: [
            {
              target: 'nsis', // 不打包为安装程序
              arch: [
                'x64' //64位
                // "ia32", //32位
              ]
            }
          ],

        },
        publish: ['github']
      }
    }
  },
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          javascriptEnabled: true,
        },
      },
    },
  },
  configureWebpack: {
    devtool: 'source-map'
  }
}