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
    const iconsDir = path.join(__dirname, '..', 'assets', 'icons');
    const imagesDir = path.join(__dirname, '..', 'assets', 'images');

    app.use(cookieParser());

    // Middleware to set the language
    app.use((req, res, next) => {
        const lang = req.query.lang || req.cookies.lang || DEFAULT_LANGUAGE;
        res.cookie('lang', lang, { maxAge: 900000, httpOnly: true });
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
    
            // Read icons directory
            fs.readdir(iconsDir, (err, iconFiles) => {
                if (err) {
                    console.error('Error reading icons directory:', err);
                    iconFiles = [];
                }
    
                // Read images directory
                fs.readdir(imagesDir, (err, imageFiles) => {
                    if (err) {
                        console.error('Error reading images directory:', err);
                        imageFiles = [];
                    }
    
                    // Create an object mapping filenames
                    const icons = {};
                    iconFiles.forEach(file => {
                        // Use filename without extension as key
                        const key = path.parse(file).name;
                        
                        // Map key to full filename
                        icons[key] = file;
                    });
    
                    const images = {};
                    imageFiles.forEach(file => {
                        // Use filename without extension as key
                        const key = path.parse(file).name;
                        
                        // Map key to full filename
                        images[key] = file;
                    });
                
                    const calculateLength = (startDate, endDate) => {
                        const start = new Date(startDate);
                        const end = endDate == null ? new Date() : new Date(endDate);
                        const yearDiff = end.getFullYear() - start.getFullYear();
                        const monthDiff = end.getMonth() - start.getMonth();
                        const totalMonths = yearDiff * 12 + monthDiff;
                        const years = Math.floor(totalMonths / 12);
                        const months = totalMonths % 12;

                        return { years: years, months: months };
                    };

                    const formatLength = ({ years, months }, lang) => {
                        let string = '';

                        if (years > 0) {
                            if (lang == 'en-ca') {
                                string += `${years} ${years > 1 ? 'years' : 'year'}`;
                            }

                            else {
                                string += `${years} ${years > 1 ? 'ans' : 'an'}`;
                            }
                        }

                        if (months > 0) {
                            if (string.length > 0) {
                                if (lang == 'en-ca') {
                                    string += ' and ';
                                }

                                else {
                                    string += ' et ';
                                }
                            }

                            if (lang == 'en-ca') {
                                string += `${months} ${months > 1 ? 'months' : 'month'}`;
                            }

                            else {
                                string += `${months} ${months > 1 ? 'mois' : 'mois'}`;
                            }
                        }

                        if (string.length === 0) {
                            string = '0 months';
                        }

                        return string;
                    };
                    
                    // Render the index.ejs template and pass the resume data and file lists
                    res.render('index', {
                        resume: resumeData,
                        icons,
                        images,
                        calculateLength,
                        formatLength
                    });
                });
            });
        });
    });

    app.listen(PORT, HOSTNAME, () => {
        console.log(`Server running at ${PROTOCOL}://${HOSTNAME}:${PORT}/`);
    });
}

main();
