"use strict";

import { app, session, shell, protocol, BrowserWindow, ipcMain, globalShortcut } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import * as URL from 'url';
import * as path from 'path';
import * as fs from 'fs-extra';
import lowdb from './lowdb'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
log.transports.console.level = false;
log.transports.console.level = 'silly'
const isDevelopment = process.env.NODE_ENV !== "production";
autoUpdater.logger = log
autoUpdater.checkForUpdatesAndNotify()


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let loginWin;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

function createWindow() {
  // Create the browser window.

  win = new BrowserWindow({
    frame: false,
    fullscreen: true,
    // fullscreenable: true,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      additionalArguments: ['main-window'],
      enableRemoteModule: true,
      plugins: false
    }
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    // if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }

  win.on("closed", () => {
    win = null;
  });
}

function createLoginWindow() {
  // Create the browser window.
  console.log('open login window');
  loginWin = new BrowserWindow({
    frame: false,
    width: 868,
    height: 528,
    fullscreen: false,
    resizable: false,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      additionalArguments: ['login-window'],
      enableRemoteModule: true
    }
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    loginWin.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    // if (!process.env.IS_TEST) loginWin.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    loginWin.loadURL("app://./index.html");
  }

  loginWin.on("closed", () => {
    loginWin = null;
  });
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (process.platform !== "darwin") {
  app.quit();
  // }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  const isLogin = lowdb.get('isLogin').value()
  console.log('is ready. isLogin=', isLogin);
  globalShortcut.register('CommandOrControl+Shift+J', () => {
    log.debug('打开控制台')
    if (win) {
      win.webContents.openDevTools()
    }
    if (loginWin) {
      loginWin.webContents.openDevTools()
    }
  })
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  if (isLogin) {
    createWindow();
  } else {
    createLoginWindow();
  }
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

// 主进程监听
ipcMain.handle('channel', (event, { type, data }) => {
  let modal;
  let cacheModal;
  console.log("主进程监听，type：%s， data: %o", type, data)
  switch (type) {
    // case 'init':
    //   if (data.isLogin) {
    //     win.show()
    //     win.maximize()
    //   } else {
    //     createLoginWindow();
    //   }
    //   return { code: 1 }
    // case 'minimize':
    //   if (win && !win.isMinimized()) {
    //     win.minimize();
    //   }
    //   return { code: 1 }
    // case 'maximize':
    //   if (win && !win.isMaximized()) {
    //     win.maximize();
    //   } else {
    //     win.unmaximize();
    //   }
    //   return { code: 1 }
    case 'quit':
      if (loginWin && loginWin.closable) {
        loginWin.close()
      }
      if (win && win.closable) {
        win.close()
      }
      return { code: 1 }
    case 'login':
      // 关闭当前窗口，打开主窗口
      createWindow();
      if (loginWin) {
        loginWin.close()
      }
      return { code: 1 }
    case 'logout':
      createLoginWindow();
      if (win) {
        win.close()
      }
      return { code: 1 }
    case 'preview':
      // if (data.url.includes('.pdf')) {
      //   modal = new BrowserWindow({
      //     fullscreen: true,
      //     resizable: false,
      //     alwaysOnTop: true,
      //     parent: win,
      //   });
      //   modal.loadURL(data.url)
      // } else if (data.url.includes('.ppt') || data.url.includes('.pptx') || data.url.includes('.pps') || data.url.includes('.ppsx')) {
      modal = new BrowserWindow({
        show: false,
        webPreferences: {
          session: session.fromPartition('preview')
        }
      });
      modal.webContents.session.on('will-download', async (event, item) => {
        console.log("item", item)
        console.log('开始下载文件')
        const fileName = item.getFilename();
        const url = item.getURL();
        const startTime = item.getStartTime();
        const initialState = item.getState();
        const downloadPath = app.getPath('userData');
        const urlObj = URL.parse(url);

        let fileNum = 0;
        let savePath = path.join(downloadPath, 'temp', fileName);

        // savePath基础信息
        const ext = path.extname(savePath);
        const name = path.basename(savePath, ext);
        const dir = path.dirname(savePath);

        // 文件名自增逻辑
        while (fs.pathExistsSync(savePath)) {
          fileNum += 1;
          savePath = path.format({
            dir,
            ext,
            name: `${name}(${fileNum})`,
          });
        }


        // 设置下载目录，阻止系统dialog的出现
        item.setSavePath(savePath);

        // 下载任务完成
        item.on('done', (e, state) => { // eslint-disable-line
          shell.openPath(savePath)
        });

      })
      modal.webContents.downloadURL(data.url)
      // }
      return { code: 1 }
    case 'cacheFile':
      return new Promise((resolve, reject) => {
        cacheModal = new BrowserWindow({
          show: false,
          webPreferences: {
            session: session.fromPartition('cache')
          }
        });
        cacheModal.webContents.session.on('will-download', async (event, item) => {
          console.log('开始缓存文件')
          const fileName = item.getFilename();
          const url = item.getURL();
          const downloadPath = app.getPath('userData');
          const urlObj = URL.parse(url);
          const id = urlObj.query.split('=')[1]

          const saveBasePath = path.join(downloadPath, 'downloads', id);
          let savePath = path.join(saveBasePath, fileName);
          console.log("savePath", savePath)

          // 文件名自增逻辑
          if (fs.pathExistsSync(savePath)) {
            fs.removeSync(savePath);
          } else if (!fs.existsSync(saveBasePath)) {
            fs.mkdirpSync(saveBasePath);
          }

          // 设置下载目录，阻止系统dialog的出现
          item.setSavePath(savePath);

          // 下载任务完成
          item.on('done', (e, state) => { // eslint-disable-line
            // 写入缓存
            try {
              lowdb.set(`cache${id}`, savePath).write()
              console.log('缓存成功')
              resolve()
            } catch (error) {
              console.log('缓存失败', error);
              reject()
            }
          });

        })
        cacheModal.webContents.downloadURL(data.url)
      })
    case 'openCacheFile':
      shell.openPath(data.url)
      return { code: 1 }
    default:
      console.log('未知操作：', type)
      break;
  }
})

