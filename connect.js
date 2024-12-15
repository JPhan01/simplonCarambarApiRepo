import sqlite3 from "sqlite3";
const sql3 = sqlite3.verbose();

const DB = new sql3.Database("./jokesData.db", sqlite3.OPEN_READWRITE, connected);

function connected(err){
    if (err){
        console.log(err.message);
        return 
    }
    console.log("Created DB ou DB already exists");
}



let sql = "CREATE TABLE IF NOT EXISTS jokes(id_joke INTEGER PRIMARY KEY, question TEXT NOT NULL UNIQUE, answer TEXT NOT NULL UNIQUE)";
DB.run(sql, [], (err)=>{
    if (err){ console.log("error with creating the table");
        return;
    }
    console.log("table created");
});

export {DB};