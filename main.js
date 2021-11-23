// Modules to control application life and create native browser window
const {app, BrowserWindow} = require('electron');
const path = require('path');

function createWindow () {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            enableRemoteModule: true
        }
    })

    // Load the index.html of the app.
    mainWindow.loadFile('index.html')
    // Do not allow to use devTools
    mainWindow.webContents.on("devtools-opened", () => { mainWindow.webContents.closeDevTools(); });
    // Hide default menu
    mainWindow.setMenuBarVisibility(false);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    createWindow()
  
    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

var {ipcMain} = require('electron');

ipcMain.on("error-sent", function(event, data){
    event.sender.send('error-answer', data);
});

ipcMain.on("jira-filter-response-sent", function(event, data){
    event.sender.send('jira-filter-answer', data);
});

ipcMain.on("jira-card-worklog-response-sent", function(event, data){
    event.sender.send('jira-card-worklog-answer', data);
});

ipcMain.on("aggregate-sent", function(event, data){
    event.sender.send('aggregate-answer', data);
});