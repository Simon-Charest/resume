const PORT = 3000;
const HOSTNAME = "127.0.0.1";

function main() {
    const fs = require('fs');
    const http = require('http');
    const path = require('path');
    const ejs = require('ejs');
    const express = require('express');
    const app = express();
    const resumePath = path.join(__dirname, '..', 'data', 'resume.json');

    // Set the view engine to EJS
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '..', 'views'));

    app.get('/', (req, res) => {
        fs.readFile(resumePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading JSON file:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            const resumeData = JSON.parse(data);
            // Render the index.ejs template and pass the resume data
            res.render('index', { resume: resumeData });
        });
    });

    app.listen(PORT, HOSTNAME, () => {
        console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
    });
}

main();
