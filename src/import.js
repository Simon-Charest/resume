const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

async function main() {
    const dataDir = path.join(__dirname, '..', 'data');

    console.log('Connecting to database...')
    const db = new sqlite3.Database(path.join(dataDir, 'database.db'));

    console.log(`Reading directory ${dataDir}...`)
    fs.readdirSync(dataDir).forEach(file => {
        if (file.endsWith('.json')) {
            // Read the content of the JSON file
            console.log(`Reading file ${file}...`)
            let filePath = path.join(dataDir, file);
            let jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            let table = `t_${path.basename(file, path.extname(file))}`;
    
            db.serialize(() => {
                // Create the table dynamically

                console.log(`Creating table ${table}...`)
                db.run(`CREATE TABLE IF NOT EXISTS ${table} (json_content TEXT);`);

                console.log(`Deleting from table ${table}...`)
                db.run(`DELETE FROM ${table};`);

                // Insert JSON content into the database
                console.log(`Inserting into table ${table}...`)
                const stmt = db.prepare(`INSERT INTO ${table} (json_content) VALUES (?);`);
                stmt.run(JSON.stringify(jsonData));
                stmt.finalize();
            });
        }
    });

    console.log('Disconnecting from database...')
    db.close();

    console.log('** DONE **')
}

main();
