module.exports = {
  collection: './collections/auth.postman_collection.json',
  environment: './environments/mobile.postman_environment.json',
  reporters: ['cli', 'htmlextra'],
  reporter: {
    htmlextra: {
      export: './newman/report.html',
    },
  },
};
