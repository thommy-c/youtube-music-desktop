/*********************************************************************************
Copyright(C) 2019  Thommy Cambier <tmc@thommysweb.com>

    This program is free software: you can redistribute it and / or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 or any later version.

    This program is distributed "as is" in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.See the
    GNU General Public License for more details: <https://www.gnu.org/licenses/>.
*********************************************************************************/

const etn = require('electron');

let mainWindow;

let ytmusic = true;

let finishedLoading = false;

buttons = {
    "musicbtns": {
        "play": "#play-pause-button",
        "next": ".next-button",
        "prev": ".previous-button",
        "togglePlayer": ".toggle-player-page-button",
        "search": "ytmusic-search-box"
    },
    "ytbtns": {
        "play": ".ytp-play-button",
        "next": ".ytp-next-button",
        "prev": ".ytp-prev-button"
    }
}

etn.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        etn.app.quit();
    }
});

etn.app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});

// Creating the BrowserWindow
etn.app.on('ready', createWindow);

function createWindow() {
    mainWindow = new etn.BrowserWindow({
        width: 900,
        height: 600,
        title: "YouTube Music",
        icon: './assets/icon.png',
        show: false,
        darkTheme: true,
    });
    mainWindow.setMenuBarVisibility(false);
    mainWindow.setMenu(null);
    mainWindow.webContents.on('did-finish-load', () => finishedLoading = true);
    mainWindow.on('closed', () => win = null);
    if (ytmusic) {
        loadYTMusic();
    } else {
        loadYT();
    }
    registerKey('Ctrl+M', '', () => {
        if (ytmusic) {
            loadYT();
        } else {
            loadYTMusic();
        }
        ytmusic = !ytmusic;
    });
}

/**
 * Map a Keyboard Shortcut to a function. 
 * Default is to simulate a click on an HTML-Element.
 * The Binding is global, it'll work when the App is minimized.
 * @param {string} key - The Keyboard Shortcut to use (Electron-Accelerator). 
 * @param {string} buttonid - Reference to an HTML-Element. If callback is omitted, this Element will be clicked.
 * @param {function} [callback] - The function to execute when this Keyboard Shortcut is pressed. 
 * @example 
 * registerKey('ctrl+e', '#idOfButtonToClick');
 * registerKey('ctrl+i', '.classOfButtonToClick');
 * registerKey('ctrl+m', '', () => console.log('CTRL + M'));
 */
function registerKey(key, buttonid, callback) {
    if (!callback && buttonid) {
        return etn.globalShortcut.register(key, () => {
            mainWindow.webContents.executeJavaScript('document.querySelector(\'' + buttonid + '\').click()');
        });
    }
    return etn.globalShortcut.register(key, () => callback());
}

/**
 * Sets the did-finish-load handler to maximize (and show) 
 * the window if the given key is bound.
 * If the binding failed, it shows an error-message,
 * asking the user if they want to continue without media keys.
 * @param {boolean} keybind - The return value of electron.globalShortcut.register
 * @example
 * isKeyBound(registerKey('MediaPlayPause', btns.play));
 * @todo Save users decision whether they want to quit or not if the media keys don't work.
 */
function isKeyBound(keybind) {
    if (!keybind) {
        console.log('[ERROR]: Registration of Media Keys failed!');
        etn.dialog.showMessageBox(mainWindow, {
                type: 'warning',
                buttons: ['Go ahead', 'Quit'],
                defaultId: 0,
                title: 'Key Registration Failed',
                message: 'Can\'t Bind Media Keys',
                detail: 'This is because another program has already reserved them. \nA Media Player or Chrome for example. \nYou can still use the App, other Keybindings will work.'
            }, (res, checked) => {
                if (res === 1) {
                    etn.app.quit();
                } else {
                    if (finishedLoading) {
                        mainWindow.maximize();
                    } else {
                        mainWindow.webContents.on('did-finish-load', () => {
                            mainWindow.maximize();
                        });
                    }
                }
            }
        );
    } else {
        mainWindow.webContents.on('did-finish-load', () => {
            mainWindow.maximize();
        });
    }
}

function loadYT() {
    mainWindow.loadURL('https://youtube.com');
    /* PLAY/PAUSE */
    isKeyBound(registerKey('MediaPlayPause', buttons.ytbtns.play));
    /* NEXT TRACK */
    registerKey('MediaNextTrack', buttons.ytbtns.next);
    /* PREVIOUS TRACK */
    registerKey('MediaPreviousTrack', buttons.ytbtns.prev);
}

function loadYTMusic() {
    mainWindow.loadURL('https://music.youtube.com/library');
    /* PLAY/PAUSE */
    isKeyBound(registerKey('MediaPlayPause', buttons.musicbtns.play));
    /* NEXT TRACK */
    registerKey('MediaNextTrack', buttons.musicbtns.next);
    /* PREVIOUS TRACK */
    registerKey('MediaPreviousTrack', buttons.musicbtns.prev);
    /* Toggle Player Page */
    registerKey('Alt+1', buttons.musicbtns.togglePlayer);
}