const fs = require('fs');
const path = require('path');

// Directories to create
const directories = [
    'uploads',
    'uploads/images',
    'uploads/videos',
    'logs'
];

// Create directories
function createDirectories() {
    console.log('Creating required directories...');
    directories.forEach(dir => {
        const dirPath = path.resolve(dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`Created directory: ${dirPath}`);
        } else {
            console.log(`Directory already exists: ${dirPath}`);
        }
    });
}

// Check environment file
function checkEnvFile() {
    console.log('\nChecking environment configuration...');
    const envPath = path.resolve('.env');
    const exampleEnvPath = path.resolve('.example.env');

    if (!fs.existsSync(envPath)) {
        console.warn('Warning: .env file not found!');
        if (fs.existsSync(exampleEnvPath)) {
            console.log('Copying .example.env to .env...');
            fs.copyFileSync(exampleEnvPath, envPath);
            console.log('Created .env file from .example.env');
        } else {
            console.error('Error: .example.env not found!');
            process.exit(1);
        }
    } else {
        console.log('✓ .env file exists');
    }
}

// Check node_modules
function checkDependencies() {
    console.log('\nChecking dependencies...');
    const nodeModulesPath = path.resolve('node_modules');
    const packageJsonPath = path.resolve('package.json');

    if (!fs.existsSync(nodeModulesPath)) {
        console.log('Installing dependencies...');
        require('child_process').execSync('yarn install', { stdio: 'inherit' });
    } else {
        console.log('✓ node_modules exists');
    }
}

// Main setup function
function setup() {
    console.log('Starting D.D backend setup...\n');
    
    try {
        createDirectories();
        checkEnvFile();
        checkDependencies();
        
        console.log('\nSetup completed successfully!');
        console.log('You can now start the server with: yarn dev');
    } catch (error) {
        console.error('\nSetup failed:', error.message);
        process.exit(1);
    }
}

// Run setup
setup(); 