require('dotenv').config({ path: '../../config/.env' });
const newman = require('newman');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const argMap = {};

args.forEach((arg, index) => {
  if (arg.startsWith('--') && args[index + 1] && !args[index + 1].startsWith('--')) {
    const key = arg.slice(2);
    const value = args[index + 1];
    argMap[key] = value;
  }
});

const project = argMap.project || 'sales';
const flow = argMap.flow || 'auth';
const type = argMap.type || 'mobile';

const validProjects = ['sales', 'movilidad_medellin', 'medellin', 'lv', 'amva'];
const validFlows = ['auth', 'mobile-flow', 'web-flow'];
const validTypes = ['mobile', 'web'];

if (!validProjects.includes(project)) {
  console.error(`Invalid project: ${project}`);
  console.error(`Valid projects: ${validProjects.join(', ')}`);
  process.exit(1);
}

if (!validFlows.includes(flow)) {
  console.error(`Invalid flow: ${flow}`);
  console.error(`Valid flows: ${validFlows.join(', ')}`);
  process.exit(1);
}

if (!validTypes.includes(type)) {
  console.error(`Invalid type: ${type}`);
  console.error(`Valid types: ${validTypes.join(', ')}`);
  process.exit(1);
}

const collectionPath = path.join(__dirname, 'collections', project, `${flow}.postman_collection.json`);
const envFile = type === 'mobile' 
  ? `${project}.postman_environment.json`
  : `web.${project}.postman_environment.json`;
const environmentPath = path.join(__dirname, 'environments', 'projects', envFile);

if (!fs.existsSync(collectionPath)) {
  console.error(`Collection not found: ${collectionPath}`);
  console.error(`Available flows for ${project}: check collections/${project}/`);
  process.exit(1);
}

if (!fs.existsSync(environmentPath)) {
  console.error(`Environment not found: ${environmentPath}`);
  process.exit(1);
}

const envVars = [];

if (type === 'mobile') {
  envVars.push(
    { key: 'callsign', value: process.env.MOBILE_USER_CALLSIGN },
    { key: 'password', value: process.env.MOBILE_USER_PASSWORD }
  );
} else {
  envVars.push(
    { key: 'webEmail', value: process.env.WEB_USER_EMAIL },
    { key: 'webPassword', value: process.env.WEB_USER_PASSWORD }
  );
}

const reportDir = `./newman/reports/${project}`;
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const reportPath = `${reportDir}/${flow}-${timestamp}.html`;

console.log(`\n🚀 Running: ${flow} (${type}) - Project: ${project}`);
console.log(`   Collection: ${collectionPath}`);
console.log(`   Environment: ${environmentPath}`);
console.log(`   Report: ${reportPath}\n`);

newman.run(
  {
    collection: require(collectionPath),
    environment: require(environmentPath),
    envVar: envVars,
    reporters: ['cli', 'htmlextra'],
    reporter: {
      htmlextra: {
        export: reportPath,
        showEnvironmentData: true,
      },
    },
  },
  (err) => {
    if (err) {
      console.error('❌ Test execution failed:', err.message);
      process.exit(1);
    }
    console.log('\n✅ Test execution completed successfully');
  }
);
