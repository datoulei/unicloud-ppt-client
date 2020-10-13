"use strict";

import { app, screen, session, shell, protocol, BrowserWindow, ipcMain, globalShortcut, Menu } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import * as path from 'path';
import * as fs from 'fs-extra';
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
let previewWin;

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

function createTimerWindow(minutes = 30, position) {
  log.info('open timer window');
  let display = screen.getPrimaryDisplay()
  let x = display.bounds.x;
  let y = display.bounds.y;
  let width = display.bounds.width;
  let height = display.bounds.height;
  switch (position) {
    case 'leftTop':
      x += 24;
      y += 24;
      break;
    case 'rightTop':
      x += width - 110 - 24;
      y += 24;
      break;
    case 'leftBottom':
      x += 24;
      y += height - 48 - 24;
      break;
    case 'rightBottom':
      x += width - 110 - 24;
      y += height - 48 - 24;
      break;
    default:
      break;
  }
  timerWin = new BrowserWindow({
    frame: false,
    width: 110,
    height: 48,
    x,
    y,
    fullscreen: false,
    transparent: true,
    hasShadow: false,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      additionalArguments: ['timer-window'],
      webSecurity: false
      // enableRemoteModule: true
    }
  })

  timerWin.setAlwaysOnTop(true, 'screen-saver')

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    log.info("createTimerWindow -> process.env.WEBPACK_DEV_SERVER_URL", process.env.WEBPACK_DEV_SERVER_URL)
    // Load the url of the dev server if in development mode
    timerWin.loadFile('../public/timer.html', {
      query: { time: minutes }
    });
    // timerWin.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '/timer');
    // if (!process.env.IS_TEST) loginWin.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    // timerWin.loadURL("app://./index.html");
    timerWin.loadURL(`app://./timer.html?time=${minutes}`);
  }
  // timerWin.webContents.openDevTools();

  timerWin.on("closed", () => {
    timerWin = null;
  });

  watchSlideShowEnd()
}

const watchSlideShowEnd = () => {
  log.info('开始监听ppt')
  try {
    var winax = require('winax');
    var interval = setInterval(function () {
      winax.peekAndDispatchMessages(); // allows ActiveX event to be dispatched
    }, 50);
    var application = new ActiveXObject('PowerPoint.Application');
    var connectionPoints = winax.getConnectionPoints(application);
    var connectionPoint = connectionPoints[0];
    connectionPoint.advise({
      SlideShowEnd: () => {
        log.info('触发关闭事件')
        try {
          timerWin.close()
        } catch (error) { }
        clearInterval(interval);
        application.Quit();
        winax.release(application);
      }
    })
  } catch (e) {
    log.error(e)
    clearInterval(interval);
    application.Quit();
    winax.release(application);
  }
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
  // Menu.setApplicationMenu(new Menu())
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
    await lowdb.read()
    const screen = lowdb.get('screen').value()
    const downloadPath = app.getPath('userData');
    const saveBasePath = path.join(downloadPath, 'temp');
    log.info("saveBasePath", saveBasePath)
    // savePath基础信息
    const ext = path.extname(fileName);
    log.info("ext=", ext)
    const name = path.basename(fileName, ext);
    log.info("name=", name)
    const saveName = `${screen.id}-${name}-${Date.now()}`
    log.info("saveName=", saveName)
    const savePath = path.format({
      dir: saveBasePath,
      ext,
      name: saveName,
    });
    log.info("savePath=", savePath)

    if (!fs.existsSync(saveBasePath)) {
      fs.mkdirpSync(saveBasePath);
    }

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
    item.on('done', (e, state) => { // eslint-disable-line
      if (state === 'completed') {
        log.info('下载完成, 准备打开文件=', savePath)
        shell.openPath(savePath)
      }
    });

  });
  session.fromPartition('cache').on('will-download', async (event, item, webContent) => {
    try {
      log.info('开始缓存文件', webContent.itemId)
      await lowdb.read()
      const loginType = lowdb.get('loginType').value()
      const screen = lowdb.get('screen').value()
      log.info("loginType", loginType)
      const fileName = item.getFilename();
      log.info("fileName", fileName)
      const downloadPath = app.getPath('userData');
      const id = webContent.itemId
      log.info("id", id)

      const saveBasePath = path.join(downloadPath, 'downloads');
      const ext = path.extname(fileName);
      log.info("ext=", ext)
      const name = path.basename(fileName, ext);
      log.info("name=", name)
      const saveName = `${screen.id}-${name}-${Date.now()}`
      log.info("saveName=", saveName)

      const savePath = path.format({
        dir: saveBasePath,
        ext,
        name: saveName,
      });

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
          // await lowdb.update(`cache:${loginType}:${id}`, savePath).write()
          log.info('缓存成功')
          win.webContents.send(`cache:${id}`, { result: true, savePath })
        } else {
          log.info('缓存失败', e);
          win.webContents.send(`cache:${id}`, { result: false, savePath })
        }
      });
    } catch (error) {
      log.info('缓存文件失败：', error)
    }
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
        previewWin = new BrowserWindow({
          fullscreen: true,
        })
        previewWin.loadURL(data.url);
        previewWin.on("closed", () => {
          previewWin = null;
          globalShortcut.unregister('Escape')
        });
        globalShortcut.register('Escape', () => {
          log.info('Escape is pressed')
          try {
            previewWin.close()
            timerWin.close()
          } catch (error) {

          }
        })
      } else {
        log.info('预览其他文件')
        previewWin = new BrowserWindow({
          show: false,
          webPreferences: {
            session: session.fromPartition('preview')
          }
        });
        previewWin.webContents.downloadURL(data.url)
      }
      if (data.minutes > 0) {
        try {
          timerWin.close()
        } catch (error) {

        }
        setTimeout(() => {
          createTimerWindow(data.minutes, data.position)
        }, 3000);
      }
      return { code: 1 }
    case 'cacheFile':
      cacheModal = new BrowserWindow({
        show: false,
        webPreferences: {
          session: session.fromPartition('cache')
        }
      });
      cacheModal.webContents.itemId = data.itemId
      cacheModal.webContents.downloadURL(data.url)
      return { code: 1 }
    case 'openCacheFile':
      // if (data.url.includes('.pdf')) {
      //   log.info('预览pdf文件')
      //   shell.openPath(data.url)
      // } else {
      // }
      shell.openPath(data.url)
      if (data.minutes > 0) {
        try {
          timerWin.close()
        } catch (error) {

        }
        setTimeout(() => {
          createTimerWindow(data.minutes, data.position)
        }, 3000);
      }
      return { code: 1 }
    default:
      log.info('未知操作：', type)
      break;
  }
})