require('dotenv').config({ path: '../../config/.env' });
const newman = require('newman');

newman.run(
  {
    collection: require('./collections/mobile-flow.postman_collection.json'),
    environment: require('./environments/mobile.postman_environment.json'),
    envVar: [
      { key: 'callsign', value: process.env.MOBILE_USER_CALLSIGN },
      { key: 'password', value: process.env.MOBILE_USER_PASSWORD },
    ],
    reporters: ['cli', 'htmlextra'],
    reporter: {
      htmlextra: {
        export: './newman/mobile-flow-report.html',
      },
    },
  },
  (err) => {
    if (err) throw err;
  }
);
