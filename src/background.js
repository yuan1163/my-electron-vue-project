'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import path from 'path'
import fs from 'fs'

const isDevelopment = process.env.NODE_ENV !== 'production'

let mainWindow

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // 創建瀏覽器窗口
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // 使用插件時需要加載的配置
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    mainWindow.loadURL('app://./index.html')
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // 安裝 Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools 安裝失敗:', e.toString())  
    }
  }
  createWindow()
})

ipcMain.handle('generate-and-print-pdf', async (event, content, showPrintDialog) => {
  try {
    console.log('生成 PDF...')
    const pdfData = await mainWindow.webContents.printToPDF({
      printBackground: true,
      landscape: false,
      pageSize: 'A4',
    })

    const pdfPath = path.join(app.getPath('temp'), 'output.pdf')
    fs.writeFileSync(pdfPath, pdfData)
    console.log('PDF 生成於:', pdfPath)

    console.log('嘗試列印...')
    
    const printWindow = new BrowserWindow({ show: false })
    await printWindow.loadFile(pdfPath)
    
    const printResult = await new Promise((resolve) => {
      printWindow.webContents.print({ 
        silent: !showPrintDialog,
        printBackground: true,
      }, (success, failureReason) => {
        console.log('列印結果:', success ? '成功' : '失敗')
        if (!success) console.log('失敗原因:', failureReason)
        resolve(success)
      })
    })

    printWindow.close()

    if (printResult) {
      console.log('列印作業成功發送')
      return { success: true, message: 'PDF 已生成並開始列印' }
    } else {
      throw new Error('列印被取消或失敗')
    }
  } catch (error) {
    console.error('生成或列印 PDF 時發生錯誤', error)
    return { success: false, error: error.message }
  }
})

if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}