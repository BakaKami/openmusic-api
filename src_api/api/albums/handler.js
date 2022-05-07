class AlbumHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
    this.postAlbumLikeHandler = this.postAlbumLikeHandler.bind(this);
    this.getAlbumLikesHandler = this.getAlbumLikesHandler.bind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    response.code(201);

    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;

    const album = await this._service.getAlbumById(id);
    const songs = await this._service.getSongsByAlbumId(id);

    return {
      status: 'success',
      data: {
        album: {
          id: album.id,
          name: album.name,
          year: album.year,
          songs: songs.map((song) => ({
            id: song.id,
            title: song.title,
            performer: song.performer,
          })),
          coverUrl: album.cover,
        },
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumLikeHandler(request, h) {
    let message;

    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    // check if album exists
    const album = await this._service.getAlbumById(id);

    const isLiked = await this._service.isAlbumLikedByUser(credentialId, id);

    if (isLiked) {
      await this._service.deleteLike(credentialId, id);
      message = `Batal memberi like pada album ${album.name}`;
    } else {
      await this._service.addLike(credentialId, id);
      message = `Album ${album.name} berhasil disukai`;
    }

    const response = h.response({
      status: 'success',
      message,
    });
    response.code(201);

    return response;
  }

  async getAlbumLikesHandler(request, h) {
    const { id } = request.params;

    const result = await this._service.getLikesByAlbumId(id);

    const response = h.response({
      status: 'success',
      data: {
        likes: result.likes,
      },
    });
    response.code(200);

    if (result.cache) {
      response.header('X-Data-Source', 'cache');
    }

    return response;
  }
}

module.exports = AlbumHandler;
