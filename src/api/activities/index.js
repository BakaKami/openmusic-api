const ActivityHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'activities',
  version: '1.0.0',
  register: async (server, { activityService, playlistService }) => {
    const activityHandler = new ActivityHandler(activityService, playlistService);

    server.route(routes(activityHandler));
  },
};
