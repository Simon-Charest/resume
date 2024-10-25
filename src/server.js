const PROTOCOL = 'http';
const HOSTNAME = '0.0.0.0';
const PORT = process.env.PORT || 3000;
const DEFAULT_LANGUAGE = 'fr-ca';

function main() {
    const fs = require('fs');
    const path = require('path');
    const express = require('express');
    const cookieParser = require('cookie-parser');
    const app = express();
    const resumePath = path.join(__dirname, '..', 'data', 'resume.json');

    app.use(cookieParser());

    // Middleware to set the language
    app.use((req, res, next) => {
        // Set default language
        const lang = req.query.lang || req.cookies.lang || DEFAULT_LANGUAGE;

        // Set cookie
        res.cookie('lang', lang, { maxAge: 900000, httpOnly: true });

        // Set the language in res.locals for use in routes
        res.locals.lang = lang;
        
        next();
    });

    // Serve static files from the assets directory
    app.use('/assets', express.static(path.join(__dirname, '../assets')));

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
            
            // Render the index.ejs template and pass the resume data and content
            res.render('index', {
                resume: resumeData
            });
        });
    });

    app.listen(PORT, HOSTNAME, () => {
        console.log(`Server running at ${PROTOCOL}://${HOSTNAME}:${PORT}/`);
    });
}

main();
