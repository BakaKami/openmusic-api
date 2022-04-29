class PlaylistHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistsByIdHandler = this.deletePlaylistsByIdHandler.bind(this);
    this.postSongPlaylistByIdHandler = this.postSongPlaylistByIdHandler.bind(this);
    this.getSongPlaylistByIdHandler = this.getSongPlaylistByIdHandler.bind(this);
    this.deleteSongPlaylistByIdHandler = this.deleteSongPlaylistByIdHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: owner } = request.auth.credentials;
    const playlistId = await this._service.addPlaylist({ name, owner });

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);

    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getAllPlaylists(credentialId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistsByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongPlaylistByIdHandler(request, h) {
    this._validator.validatePostSongPlaylistPayload(request.payload);

    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, credentialId);
    await this._service.addSongToPlaylistBySongId(id, { songId });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);

    return response;
  }

  async getSongPlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, credentialId);
    const playlist = await this._service.getPlaylistById(id);
    const songs = await this._service.getSongsByPlaylistId(id);

    return {
      status: 'success',
      data: {
        playlist: {
          id: playlist.id,
          name: playlist.name,
          username: playlist.username,
          songs: songs.map((song) => ({
            id: song.id,
            title: song.title,
            performer: song.performer,
          })),
        },
      },
    };
  }

  async deleteSongPlaylistByIdHandler(request) {
    this._validator.validateDeleteSongPlaylistPayload(request.payload);

    const { id } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(id, credentialId);
    await this._service.deleteSongFromPlaylistBySongId(id, { songId });

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }
}

module.exports = PlaylistHandler;
