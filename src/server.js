const compression = require('compression');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const fs = require('fs').promises;
const http = require('http');
const https = require('https');
const path = require('path');
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
    const config = JSON.parse(await fs.readFile('./config.json', 'utf8'));

    const HOSTNAME = '0.0.0.0';
    const PORT = process.env.PORT || 3000;
    const DEFAULT_LANGUAGE = 'fr-CA';

    const assetsDir = path.join(__dirname, '..', 'assets');
    const dataDir = path.join(__dirname, '..', 'data');
    const publicDir = path.join(__dirname, '..', 'public');
    const viewsDir = path.join(__dirname, '..', 'views');
    const iconsDir = path.join(assetsDir, 'icons');
    const imagesDir = path.join(assetsDir, 'images');
    const profileDir = path.join(imagesDir, 'profile');

    let iconFiles = [];
    let imageFiles = [];
    let profileFiles = [];
    let data = '';

    // Read files in parallel and add error handling
    try {
        [iconFiles, imageFiles, profileFiles] = await Promise.all([
            fs.readdir(iconsDir),
            fs.readdir(imagesDir),
            fs.readdir(profileDir)
        ]);
        data = await fs.readFile(path.join(dataDir, 'data.json'), 'utf8');
    }
    
    catch (err) {
        logger.error(`Error reading directories or data file: ${err.message}\nStack: ${err.stack}`);
        process.exit(1);
    }

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

    app.use('/favicon.ico', express.static(path.join(iconsDir, 'favicon_16x16.ico')));
    app.use('/robots.txt', express.static('robots.txt'));

    // Accept the following command syntax: https://dynamicdns.DOMAIN/update?host=@&domain=DOMAIN&password=PASSWORD&ip=IP
    app.use('/update', function (req, res, next) {
    });

    // Route with error handling
    app.get('/:route?', cors(), async (req, res, next) => {
        const route = req.params.route || 'index';
        let routeData;

        try {
            routeData = await fs.readFile(path.join(dataDir, `${route}.json`), 'utf8');
        }
        
        catch (err) {
            return next(new Error(`Error reading route data for ${route}: ${err.message}`));
        }

        let jsonData;

        try {
            jsonData = Object.assign({}, JSON.parse(data), JSON.parse(routeData));
        }
        
        catch (err) {
            return next(new Error(`Error parsing JSON data for ${route}: ${err.message}`));
        }

        const backgroundImage = `background_${res.locals.lang.toLowerCase()}.webp`;
        const profileImage = profileFiles[Math.floor(Math.random() * profileFiles.length)];
        const view = route === "about" ? "about" : "index";

        res.render(view, {
            route,
            data: jsonData,
            icons,
            images,
            backgroundImage,
            profileImage,
            calculateMonth,
            calculateLength,
            formatLength
        });
    });

    const calculateMonth = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = endDate == null ? new Date() : new Date(endDate);
        const yearDiff = end.getFullYear() - start.getFullYear();
        const monthDiff = end.getMonth() - start.getMonth();
        const totalMonth= yearDiff * 12 + monthDiff;

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

    // General Error Handling Middleware
    app.use((err, req, res, next) => {
        logger.error(`Error occurred: ${err.message}\nStack: ${err.stack}`);
        res.status(500).json({ message: 'Internal Server Error', error: err.message });
    });

    // Load SSL certificates (only in production)
    let options = {};

    if (config.environment === 'production') {
        try {
            options = {
                key: await fs.readFile(path.join(config.certificates, 'privkey.pem')),
                cert: await fs.readFile(path.join(config.certificates, 'cert.pem')),
                ca: await fs.readFile(path.join(config.certificates, 'fullchain.pem'))
            };
        }
        
        catch (err) {
            logger.error(`Error loading SSL certificates: ${err.message}\nStack: ${err.stack}`);
            process.exit(1);
        }
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

main().catch(err => {
    logger.error(`Fatal error during startup: ${err.message}\nStack: ${err.stack}`);
    process.exit(1);
});
