const ExportsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { playlistService, producerService, validator }) => {
    const exportsHandler = new ExportsHandler(playlistService, producerService, validator);

    server.route(routes(exportsHandler));
  },
};
