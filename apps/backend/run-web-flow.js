require('dotenv').config({ path: '../../config/.env' });
const newman = require('newman');

newman.run(
  {
    collection: require('./collections/web-flow.postman_collection.json'),
    environment: require('./environments/web.postman_environment.json'),
    envVar: [
      { key: 'webBaseUrl', value: process.env.WEB_BASE_URL },
      { key: 'webEmail', value: process.env.WEB_USER_EMAIL },
      { key: 'webPassword', value: process.env.WEB_USER_PASSWORD },
    ],
    reporters: ['cli', 'htmlextra'],
    reporter: {
      htmlextra: {
        export: './newman/web-flow-report.html',
      },
    },
  },
  (err) => {
    if (err) throw err;
  }
);
