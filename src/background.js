"use strict";

import { app, screen, session, shell, protocol, BrowserWindow, ipcMain, globalShortcut, Menu } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import * as URL from 'url';
import * as path from 'path';
import * as fs from 'fs-extra';
import md5 from 'md5';
import lowdb from './lowdb'
// import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
log.transports.console.level = false;
log.transports.console.level = 'silly'
const isDevelopment = process.env.NODE_ENV !== "production";
// autoUpdater.logger = log
// autoUpdater.checkForUpdatesAndNotify()


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let loginWin;
let timerWin;

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
  log.info('open login window');
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

function createTimerWindow() {
  log.info('open timer window');
  // const displays = screen.getAllDisplays()
  // log.info("createTimerWindow -> displays", displays)
  // let display = displays[1];
  let display = screen.getPrimaryDisplay();
  let width = display.bounds.width;
  timerWin = new BrowserWindow({
    frame: false,
    width: 110,
    height: 48,
    x: width - 110 - 24,
    y: 48,
    transparent: true,
    hasShadow: false,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      additionalArguments: ['timer-window'],
      enableRemoteModule: true
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    log.info("createTimerWindow -> process.env.WEBPACK_DEV_SERVER_URL", process.env.WEBPACK_DEV_SERVER_URL)
    // Load the url of the dev server if in development mode
    timerWin.loadFile('../public/timer.html', {
      query: { time: '30' }
    });
    // timerWin.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '/timer');
    // if (!process.env.IS_TEST) loginWin.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    // timerWin.loadURL("app://./index.html");
    timerWin.loadFile('./public/timer.html');
  }
  // timerWin.webContents.openDevTools();

  timerWin.on("closed", () => {
    timerWin = null;
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

// lowdb.unset('isLogin').write()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  Menu.setApplicationMenu(new Menu())
  const loginType = lowdb.get('loginType').value()
  log.info('is ready. loginType=', loginType);
  globalShortcut.register('CommandOrControl+Shift+J', () => {
    log.info('打开控制台')
    if (win) {
      win.webContents.openDevTools()
    }
    if (loginWin) {
      loginWin.webContents.openDevTools()
    }
    if (timerWin) {
      timerWin.webContents.openDevTools()
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
  if (loginType) {
    createWindow();
    // createTimerWindow()
  } else {
    createLoginWindow();
  }
  session.fromPartition('preview').on('will-download', async (event, item) => {
    log.info('开始下载预览文件')
    const fileName = item.getFilename();
    // const url = item.getURL();
    // const startTime = item.getStartTime();
    // const initialState = item.getState();
    const downloadPath = app.getPath('userData');

    const saveBasePath = path.join(downloadPath, 'temp');
    log.info("saveBasePath", saveBasePath)
    // savePath基础信息
    const ext = path.extname(fileName);
    log.info("ext=", ext)
    const name = path.basename(fileName, ext);
    log.info("name=", name)
    const md5Name = `${md5(name + Date.now())}`
    log.info("md5Name=", md5Name)
    const savePath = path.format({
      dir: saveBasePath,
      ext,
      name: md5Name,
    });
    log.info("savePath=", savePath)

    if (!fs.existsSync(saveBasePath)) {
      fs.mkdirpSync(saveBasePath);
    }

    // 设置下载目录，阻止系统dialog的出现
    item.setSavePath(savePath);

    // 下载任务完成
    item.on('done', (e, state) => { // eslint-disable-line
      if (state === 'completed') {
        log.info('下载完成, 准备打开文件=', savePath)
        shell.openPath(savePath)
      }
    });

  });
  session.fromPartition('cache').on('will-download', async (event, item) => {
    log.info('开始缓存文件')
    const loginType = lowdb.get('loginType').value()
    const fileName = item.getFilename();
    const url = item.getURL();
    const downloadPath = app.getPath('userData');
    const urlObj = URL.parse(url);
    const id = urlObj.query.split('=')[1]

    const saveBasePath = path.join(downloadPath, 'downloads', id, loginType);
    let savePath = path.join(saveBasePath, fileName);

    if (!fs.existsSync(saveBasePath)) {
      fs.mkdirpSync(saveBasePath);
    }

    // 文件名自增逻辑
    // if (fs.existsSync(savePath)) {
    //   fs.removeSync(savePath);
    // }
    log.info('当前文件缓存地址：', savePath);
    // 设置下载目录，阻止系统dialog的出现
    item.setSavePath(savePath);

    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        log.info('Download is interrupted but can be resumed')
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          log.info('Download is paused')
        } else {
          log.info(`Received bytes: ${item.getReceivedBytes()}`)
        }
      }
    })

    // 下载任务完成
    item.on('done', async (e, state) => { // eslint-disable-line
      const loginType = lowdb.get('loginType').value()
      // 写入缓存
      if (state === 'completed') {
        await lowdb.set(`cache:${loginType}:${id}`, savePath).write()
        log.info('缓存成功')
        win.webContents.send(`cache:${id}`, { result: true })
      } else {
        log.info('缓存失败');
        win.webContents.send(`cache:${id}`, { result: false })
      }
    });

  })
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
  log.info("主进程监听，type：%s， data: %o", type, data)
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
      if (data.url.includes('.pdf')) {
        log.info('预览pdf文件')
        let _modal = new BrowserWindow({
          frame: true,
          fullscreen: true,
        })
        _modal.loadURL(data.url)
      } else {
        log.info('预览其他文件')
        modal = new BrowserWindow({
          show: false,
          webPreferences: {
            session: session.fromPartition('preview')
          }
        });
        modal.webContents.downloadURL(data.url)
      }
      return { code: 1 }
    case 'cacheFile':
      cacheModal = new BrowserWindow({
        show: false,
        webPreferences: {
          session: session.fromPartition('cache')
        }
      });
      cacheModal.webContents.downloadURL(data.url)
      return { code: 1 }
    case 'openCacheFile':
      if (data.url.includes('.pdf')) {
        log.info('预览pdf文件')
        let _modal = new BrowserWindow({
          frame: true,
          fullscreen: true,
        })
        _modal.loadFile(data.url)
      } else {
        shell.openPath(data.url)
      }
      return { code: 1 }
    default:
      log.info('未知操作：', type)
      break;
  }
})

