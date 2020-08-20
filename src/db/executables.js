// Defines the Executables Table
const db = require('electron-db');

// ID
// Program Name
// Program Path
// Description
// Icon path
// Created At
// Last Opened


const TABLENAME = 'executables';


function initDB() {
    // Should automatically generate json db in AppData directory
    if (!db.tableExists(TABLENAME)) {
        db.createTable('executables', (succ, msg) => {
            console.log("Success: " + succ);
            console.log("Message: " + msg);
        });
    }
}


function createEntry(data) {

    const { program_name, program_path, icon_path, description } = data;

    db.getRows(TABLENAME, {
        program_path: program_path,
    }, (succ, result) => {
        console.log("Success: " + succ);
        console.log(result);

        const datetime = Date.now();
        const row = {
            id: 0,
            program_name: program_name,
            program_path: program_path,
            icon_path: icon_path,
            description: description,
            created_at: datetime,
            last_opened: datetime,
        };

        // This is bad style, change to async await in future
        db.insertTableContent(TABLENAME, row, (succ, msg) => {
            console.log("Success: " + succ);
            console.log("Message: " + msg);
        });
    });
}

// Returns a list of all entries
async function getEntries() {
    const entries = await new Promise((resolve) => {
        db.getAll(TABLENAME, (succ, data) => {
            console.log("data:", data);
            if (succ) {
                resolve(data);
            } else {
                resolve([]);
            }
        });
    });
    console.log(entries);
    return entries;
}


// Exports
module.exports = {
    initDB,
    createEntry,
    getEntries,
};