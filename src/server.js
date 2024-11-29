const compression = require('compression');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const winston = require('winston');

// Create a custom logger using Winston
const logger = winston.createLogger({
    level: 'info', // Default log level
    format: winston.format.combine(
        winston.format.timestamp(), // Add a timestamp to each log
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level}: ${message}`;
        })
    ),
    transports: [
        // Log to the console with color and simple format
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(), 
                winston.format.simple()  
            )
        }),

        // Log to a file for general logs
        new winston.transports.File({
            filename: 'logs/combined.log',
            level: 'info',  // Log all levels to the combined log
            maxsize: 5242880, // 5MB max size per log file
            maxFiles: 5, // Keep only 5 log files
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        }),
        
        // Log only errors to a separate error log file
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error', // Log only 'error' level logs to this file
            maxsize: 5242880, // 5MB max size per log file
            maxFiles: 5, // Keep only 5 log files
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        })
    ]
});

async function main() {
    const config = JSON.parse(await fs.promises.readFile('./config.json', 'utf8'));

    const HOSTNAME = '0.0.0.0';
    const PORT = process.env.PORT || 3000;
    const DEFAULT_LANGUAGE = 'fr-CA';
    const ROUTES = ['index', 'about', 'partners', 'media', 'contact', 'geekyStuff'];

    const dataDir = path.join(__dirname, '..', 'data');
    const publicDir = path.join(__dirname, '..', 'public');
    const viewsDir = path.join(__dirname, '..', 'views');
    const assetsDir = path.join(publicDir, 'assets');
    const iconsDir = path.join(assetsDir, 'icons');
    const imagesDir = path.join(assetsDir, 'images');
    const profileDir = path.join(imagesDir, 'profile');

    const db = new sqlite3.Database(path.join(dataDir, 'database.db'));
    db.close();

    let iconFiles = [];
    let imageFiles = [];
    let profileFiles = [];
    let data = '';

    // Read files in parallel and add error handling
    [iconFiles, imageFiles, profileFiles] = await Promise.all([
        fs.promises.readdir(iconsDir),
        fs.promises.readdir(imagesDir),
        fs.promises.readdir(profileDir)
    ]);
    data = await fs.promises.readFile(path.join(dataDir, 'data.json'), 'utf8');

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

    const app = express();
    
    // Enable compression
    app.use(compression());

    app.use(cookieParser());

    // Use the CORS middleware to allow requests from any origin
    app.use(cors());

    // Serve static files from the assets directory
    app.use('/assets', express.static(assetsDir));

    // Set the view engine to EJS
    app.set('view engine', 'ejs');
    app.set('views', viewsDir);
      
    // Middleware to set the language
    app.use((req, res, next) => {
        let lang = req.query.lang || req.cookies.lang || DEFAULT_LANGUAGE;
        res.cookie('lang', lang, {
            maxAge: 900000,
            httpOnly: true,
            sameSite: 'None',
            secure: true
        });
        res.locals.lang = lang;
        next();
    });

    // Serve static files from the .well-known/acme-challenge directory
    app.use('/.well-known/acme-challenge', express.static(path.join(publicDir, '.well-known', 'acme-challenge')));
    
    app.use('/public', express.static(publicDir));
    app.use('/favicon.ico', express.static(path.join(iconsDir, 'favicon_16x16.ico')));
    app.use('/robots.txt', express.static(path.join(publicDir, 'robots.txt')));

    // Route
    app.get('/:route?', cors(), async (req, res) => {
        const route = ROUTES.includes(req.params.route) ? req.params.route : "index";
        const view = "body";
        const dataPath = !ROUTES.includes(req.params.route) && req.params.route !== undefined ? "404.json" : `${route}.json`;
        const jsonData = Object.assign({}, JSON.parse(data), JSON.parse(await fs.promises.readFile(path.join(dataDir, dataPath), 'utf8')));
        const backgroundImage = `background_${res.locals.lang.toLowerCase()}.webp`;
        const profileImage = profileFiles[Math.floor(Math.random() * profileFiles.length)];
        res.render(view, {
            route,
            data: jsonData,
            icons,
            images,
            backgroundImage,
            profileImage,
            calculateMonth,
            calculateLength,
            formatLength,
            calculateSize,
            convertSize
        });
    });

    const calculateMonth = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = endDate == null ? new Date() : new Date(endDate);
        const yearDiff = end.getFullYear() - start.getFullYear();
        const monthDiff = end.getMonth() - start.getMonth();
        const totalMonth = yearDiff * 12 + monthDiff;

        return totalMonth;
    };

    const calculateLength = (startDate, endDate) => {
        const totalMonth = calculateMonth(startDate, endDate);
        const year = Math.floor(totalMonth / 12);
        const month = totalMonth % 12;

        return { year, month };
    };

    const formatLength = ({ year, month }, lang) => {
        let string = '';

        if (year > 0) {
            string += `${year} ${year > 1 ? (lang === 'en-CA' ? 'years' : 'ans') : (lang === 'en-CA' ? 'year' : 'an')}`;
        }

        if (month > 0) {
            if (string.length > 0) {
                string += lang === 'en-CA' ? ' and ' : ' et ';
            }

            string += `${month} ${month > 1 ? (lang === 'en-CA' ? 'months' : 'mois') : (lang === 'en-CA' ? 'month' : 'mois')}`;
        }

        return string.length === 0 ? '0 months' : string;
    };

    // Function to calculate the size of a directory recursively, excluding certain directories
    function calculateSize(
        directory = path.join(__dirname, '..'),
        ignores = [
            path.join(__dirname, '..', '.git'),
            path.join(__dirname, '..', 'node_modules'),
            path.join(__dirname, '..', 'public/*.zip')
        ],
        unit = "M"
    ) {
        const files = fs.readdirSync(directory);
        let size = 0;

        for (let file of files) {
            let filePath = path.join(directory, file);
            let stats = fs.statSync(filePath);

            // Skip ignored paths
            if (ignores.includes(filePath) || ignores.some(pattern => pattern.includes("*") && filePath.startsWith(pattern.replace("*", path.basename(filePath, path.extname(filePath)))))) {
                continue;
            }

            if (stats.isDirectory()) {
                // Recursive call
                size += calculateSize(filePath, ignores, unit);
            }
            
            else {
                // Add file size
                size += stats.size;
            }
        }

        return size;
    }

    function convertSize(byte, unit = '', round = null) {
        switch (unit) {
            case '': size = byte; break;
            case 'K': size = byte / 1024; break;
            case 'M': size = byte / (1024 ** 2); break;
            case 'G': size = byte / (1024 ** 3); break;
            case 'T': size = byte / (1024 ** 4); break;
        }

        if (round !== null) {
            size = Math.round(size * 10 ** round) / 10 ** round;
        }

        return `${size} ${unit}B`;
    }

    // General Error Handling Middleware
    app.use((err, req, res, next) => {
        logger.error(`Error occurred: ${err.message}\nStack: ${err.stack}`);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    });

    // Load SSL certificates (only in production)
    let options = {};

    if (config.environment === 'production') {
        options = {
            key: await fs.promises.readFile(path.join(config.certificates, 'privkey.pem')),
            cert: await fs.promises.readFile(path.join(config.certificates, 'cert.pem')),
            ca: await fs.promises.readFile(path.join(config.certificates, 'fullchain.pem'))
        };
    }

    // Start the server using HTTPS or HTTP
    if (config.environment === 'production') {
        https.createServer(options, app).listen(PORT, HOSTNAME, () => {
            logger.info(`HTTPS Server running at https://${HOSTNAME}:${PORT}/`);
        });
    }
    
    else {
        http.createServer(options, app).listen(PORT, HOSTNAME, () => {
            logger.info(`HTTP Server running at http://${HOSTNAME}:${PORT}/`);
        });
    }
}

main();
