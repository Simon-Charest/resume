const PROTOCOL = 'http';
const HOSTNAME = '0.0.0.0';
const PORT = process.env.PORT || 3000;
const DEFAULT_LANGUAGE = 'fr-ca';

async function main() {
    const cookieParser = require('cookie-parser');
    const express = require('express');
    const fs = require('fs').promises;
    const path = require('path');
    
    const assetsDir = path.join(__dirname, '..', 'assets');
    const dataDir = path.join(__dirname, '..', 'data');
    const iconsDir = path.join(assetsDir, 'icons');
    const imagesDir = path.join(assetsDir, 'images');
    const profileDir = path.join(imagesDir, 'profile');
    
    const app = express();
    app.use(cookieParser());

    // Middleware to set the language
    app.use((req, res, next) => {
        const lang = req.query.lang || req.cookies.lang || DEFAULT_LANGUAGE;
        res.cookie('lang', lang, {
            maxAge: 900000,
            httpOnly: true,
            sameSite: 'None',
            secure: true
        });
        res.locals.lang = lang;
        next();
    });

    // Serve static files from the assets directory
    app.use('/assets', express.static(path.join(__dirname, '../assets')));

    // Set the view engine to EJS
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '..', 'views'));

    app.get('/:route?', async (req, res) => {
        const route = req.params.route || 'index';

        try {
            const headerData = await fs.readFile(path.join(dataDir, 'header.json'), 'utf8');
            const pageData = await fs.readFile(path.join(dataDir, `${route}.json`), 'utf8');
            const jsonData = Object.assign({}, JSON.parse(headerData), JSON.parse(pageData));

            // Custom view
            if (route === "about") {
                await readDirectoryContents(res, route, jsonData);
            }
            
            else {
                res.render('index', { view: route, data: jsonData });
            }
        }
        
        catch (err) {
            console.error(`Error reading or parsing ${route} JSON files:`, err);

            return res.status(500).send('Internal Server Error');
        }
    });

    async function readDirectoryContents(res, view, jsonData) {
        try {
            // Read icons, images, and profile directories in parallel
            const [iconFiles, imageFiles, profileFiles] = await Promise.all([
                fs.readdir(iconsDir),
                fs.readdir(imagesDir),
                fs.readdir(profileDir)
            ]);

            // Create an object mapping filenames for icons and images
            const icons = iconFiles.reduce((acc, file) => {
                const key = path.parse(file).name;
                acc[key] = file;

                return acc;
            }, {});

            const images = imageFiles.reduce((acc, file) => {
                const key = path.parse(file).name;
                acc[key] = file;

                return acc;
            }, {});

            // Select a random profile image with full path
            const profilePicture = profileFiles[Math.floor(Math.random() * profileFiles.length)];

            // Render the EJS template with the directory contents and other data
            res.render(view, {
                view: "about",
                data: jsonData,
                icons,
                images,
                profilePicture,
                calculateLength,
                formatLength
            });
        }
        
        catch (err) {
            console.error('Error reading directory contents:', err);
            res.status(500).send('Internal Server Error');
        }
    }

    const calculateLength = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = endDate == null ? new Date() : new Date(endDate);
        const yearDiff = end.getFullYear() - start.getFullYear();
        const monthDiff = end.getMonth() - start.getMonth();
        const totalMonths = yearDiff * 12 + monthDiff;
        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;

        return { years, months };
    };

    const formatLength = ({ years, months }, lang) => {
        let string = '';

        if (years > 0) {
            string += `${years} ${years > 1 ? (lang === 'en-ca' ? 'years' : 'ans') : (lang === 'en-ca' ? 'year' : 'an')}`;
        }

        if (months > 0) {
            if (string.length > 0) {
                string += lang === 'en-ca' ? ' and ' : ' et ';
            }
            string += `${months} ${months > 1 ? (lang === 'en-ca' ? 'months' : 'mois') : (lang === 'en-ca' ? 'month' : 'mois')}`;
        }

        return string.length === 0 ? '0 months' : string;
    };

    app.listen(PORT, HOSTNAME, () => {
        console.log(`Server running at ${PROTOCOL}://${HOSTNAME}:${PORT}/`);
    });
}

main();
