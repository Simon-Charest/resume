const PROTOCOL = "http";
const HOSTNAME = "0.0.0.0";
const PORT = process.env.PORT || 3000;
const DEFAULT_LANGUAGE = "fr-ca";

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
        const lang = req.query.lang || req.cookies.lang || DEFAULT_LANGUAGE; // Default language
        res.cookie('lang', lang, { maxAge: 900000, httpOnly: true }); // Set cookie
        res.locals.lang = lang; // Set the language in res.locals for use in routes
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
            const lang = res.locals.lang;

            // Prepare content based on the selected language
            const content = {
                "en-ca": {
                    title: "Welcome",
                    message: "This is an English message."
                },
                "fr-ca": {
                    title: "Bienvenue",
                    message: "Ceci est un message en français."
                }
            };

            // Render the index.ejs template and pass the resume data and content
            res.render('index', {
                resume: resumeData,
                title: content[lang].title,
                message: content[lang].message
            });
        });
    });

    app.listen(PORT, HOSTNAME, () => {
        console.log(`Server running at ${PROTOCOL}://${HOSTNAME}:${PORT}/`);
    });
}

main();
