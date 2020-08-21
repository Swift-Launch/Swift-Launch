const { app, BrowserWindow, Menu, dialog } = require('electron')
const electron = require('electron');
const os = require('os');
const url = require('url');
const path = require('path');
const shell = require('electron').shell
const { execFile } = require('child_process');
const ipc = electron.ipcMain

// For development only
try { require('electron-reloader')(module); } catch (_) {}

// Database
const { initDB, createEntry, getEntries } = require('./src/db/executables');
const { worker } = require('cluster');



function createWindow(){
    //creates a new window
    mainWindow = new BrowserWindow({
        webPreferences: {nodeIntegration: true}, //required to allow chromium to interact with electron
        icon: path.join(__dirname, "assets/icon.png")  //sets icon to whatever icon.jpg is in assets
    });
    //loads the html content into the main window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'src/index.html'), //loads html file as webpage in chromium
        protocol: 'file:',
        slashes: true
    }));
    
    mainWindow.on('dom-ready', (e) => {
        console.log('dom-ready');
    });
    //Sets top window toolbar to custom one made in toolBarTemplate(file,help,etc.)
    Menu.setApplicationMenu(Menu.buildFromTemplate(toolBarTemplate));
    
    //quit app when hit X
    mainWindow.on('close', function(){app.quit()});    
}

// Called when initialization is complete
app.whenReady().then(() => {
    createWindow();
    initDB();  //will not create new db if db JSON file already exists
});


function addProgram() {
    //change this function to be able to add files to launcher, this will be called if user clicks
    //file -> add a program
    console.log("added");
    var filePath = dialog.showOpenDialogSync({
        filters:
        [
            {name: 'Application', extensions: ['exe']}
        ]
    });
    // Adds program data into the DB
    addToDB(filePath)
    return filePath
}
function removeProgram() {
    //change this function to be able to select a file to remove from launcher, this will be called if user clicks
    //file -> remove a program
    console.log("removed");
}

function changeTheme() {
    // Change the theme of the program
}

function addToDB(filePath){
    //this function should add a new entry to our backend with the name of a newly added application
    //and any other information that we will store
    createEntry({
        program_name: findEXEName(filePath),
        program_path: filePath,
        icon_path: "",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum metus eros, viverra ut erat ut, cursus bibendum sapien. Sed dictum mi ut est accumsan, vel.",
    });
}




var programPath = "D:\\Quixel for Texturing\\Quixel Mixer.exe"; //this will track path of current program that the launch button will launch
function launchProgram(){
    // execute the file
    const child = execFile(programPath, (error,stdout,stderror) => {
        if (error) {
            throw error;
        }
        console.log(stdout);
    });
}


// <---------- IPC Receiving ---------------->

// <--- IPC from index.js --->
ipc.on('addProgram', (event) =>{
    var filePath = addProgram()
    let namePath = findEXEName(filePath);
    event.reply("makeButton", namePath)   //replies to addprogram request by requesting the renderer make a button
});

ipc.on('launchProgram', (event)=>{
    launchProgram()
});

// Note: ipc name "displayContent" is the same name as the one being sent out. This may not work, but I think it's easier to understand that they are linked together.
// Maybe using a naming convention of "displayContent{file name}" might be easier to understand
ipc.on('displayContent', (event, args)=>{
    event.reply('displayContentRenderer', args); // pass in path as name (for now)
});


//---------------Helper Functions --------------------------
function findEXEName(filePath){
    //take a file path to an executable file and finds the name of the executable without ".exe"
    if(!filePath)
        return ""
    let t;
    if(os.platform() == "win32"){
        t = filePath.toString().split("\\")
        t = t[t.length-1]
        t = t.split(".")[0]
    }
    else{
        t = filePath.toString().split("/")
        t = t[t.length-1]
        t = t.split(".")[0]
    }
    return t
}

// Top window toolbar template
const toolBarTemplate = [
    // ------ File Start ----------
    {
        label:'File',
        submenu:[
            {
                label:'Add a program',
                click(){  //on click functions to do
                    addProgram();
                }
            },
            {
                label:'Remove a program',
                click(){
                    removeProgram();
                }
            }
        ]
    },
    // -------- File End ---------
    // ------ Edit Start ----------
    {
        label:'Edit',
        submenu:[
            {
                label:'Change Theme',
                click() {
                    changeTheme();
                }
            }
        ]
    },
    // -------- Edit End ---------
    // -------- Info Start -------
    {
        label:'Info',
        submenu:[
            {
                label:'Github',
                click() {
                    shell.openExternal('https://github.com/Swift-Launch/Swift-Launch');
                }
            }
        ]
    },
    // -------- Info End -------
    //--------- Devtools Start ------------
    {
        label:'Devtools',
        click(item,focusedWindow){
            focusedWindow.toggleDevTools();
        }
    },
    {
        label: 'Reload',
        click(item,focusedWindow){
            focusedWindow.reload();
        }
    }
    //--------Devtools end --------
]









































































































