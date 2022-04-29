require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const albums = require('./api/albums');
const authentications = require('./api/authentications');
const songs = require('./api/songs');
const users = require('./api/users');
const ClientError = require('./exceptions/ClientError');
const AlbumService = require('./services/postgres/AlbumService');
const AuthenticationService = require('./services/postgres/AuthenticationService');
const SongService = require('./services/postgres/SongService');
const UserService = require('./services/postgres/UserService');
const PlaylistService = require('./services/postgres/PlaylistService');
const TokenManager = require('./tokenize/TokenManager');
const AlbumValidator = require('./validator/albums');
const SongValidator = require('./validator/songs');
const UsersValidator = require('./validator/users');
const AuthenticationValidator = require('./validator/authentications');
const playlists = require('./api/playlists');
const PlaylistValidator = require('./validator/playlists');
const CollaborationService = require('./services/postgres/CollaborationService');
const CollaborationValidator = require('./validator/collaborations');
const collaborations = require('./api/collaborations');

const init = async () => {
  const collaborationService = new CollaborationService();
  const albumService = new AlbumService();
  const songService = new SongService();
  const userService = new UserService();
  const authenticationService = new AuthenticationService();
  const playlistService = new PlaylistService(collaborationService);

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // register JWT plugin
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // define JWT auth strategy
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumService,
        validator: AlbumValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songService,
        validator: SongValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: userService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationService,
        userService,
        tokenManager: TokenManager,
        validator: AuthenticationValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistService,
        validator: PlaylistValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationService,
        playlistService,
        validator: CollaborationValidator,
      },
    },
  ]);

  // error handling
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);

      return newResponse;
    }

    if (response instanceof Error) {
      // authentication error
      if (response.output.payload.statusCode === 401) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.output.payload.statusCode);

        return newResponse;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'Sedang terjadi gangguan pada server',
      });
      newResponse.code(500);
      console.log(response.message);

      return newResponse;
    }

    return response.continue || response;
  });

  await server.start();
  console.log(`Server running at ${server.info.uri}`);
};

init();
