const ClientError = require('../../exceptions/ClientError');

/* eslint no-underscore-dangle: 0 */
class SongHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const {
        title, year, genre, performer, duration, albumId,
      } = request.payload;

      const songId = await this._service.addSong({
        title, year, genre, performer, duration, albumId,
      });

      const response = h.response({
        status: 'success',
        data: {
          songId,
        },
      });
      response.code(201);

      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);

        return response;
      }

      // else, SERVER ERROR
      const response = h.response({
        status: 'error',
        message: 'Sedang terjadi gangguan pada server',
      });
      response.code(500);
      console.error(error);

      return response;
    }
  }

  async getSongsHandler(request) {
    const { title, performer } = request.query;
    const songs = await this._service.getAllSongs();

    if (title != null && performer != null) {
      const selectedSongs = songs.filter((song) => (
        song.title.toLowerCase().includes(title.toLowerCase())
          && song.performer.toLowerCase().includes(performer.toLowerCase())));

      return {
        status: 'success',
        data: {
          songs: selectedSongs.map((song) => ({
            id: song.id,
            title: song.title,
            performer: song.performer,
          })),
        },
      };
    }

    if (title != null) {
      const selectedSongs = songs.filter((song) => (
        song.title.toLowerCase().includes(title.toLowerCase())));

      return {
        status: 'success',
        data: {
          songs: selectedSongs.map((song) => ({
            id: song.id,
            title: song.title,
            performer: song.performer,
          })),
        },
      };
    }

    if (performer != null) {
      const selectedSongs = songs.filter((song) => (
        song.performer.toLowerCase().includes(performer.toLowerCase())));

      return {
        status: 'success',
        data: {
          songs: selectedSongs.map((song) => ({
            id: song.id,
            title: song.title,
            performer: song.performer,
          })),
        },
      };
    }

    return {
      status: 'success',
      data: {
        songs: songs.map((song) => ({
          id: song.id,
          title: song.title,
          performer: song.performer,
        })),
      },
    };
  }

  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;

      const song = await this._service.getSongById(id);

      return {
        status: 'success',
        data: {
          song,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);

        return response;
      }

      // else, SERVER ERROR
      const response = h.response({
        status: 'error',
        message: 'Sedang terjadi gangguan pada server',
      });
      response.code(500);
      console.error(error);

      return response;
    }
  }

  async putSongByIdHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const { id } = request.params;

      await this._service.editSongById(id, request.payload);

      return {
        status: 'success',
        message: 'Lagu berhasil diperbarui',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);

        return response;
      }

      // else, SERVER ERROR
      const response = h.response({
        status: 'error',
        message: 'Sedang terjadi gangguan pada server',
      });
      response.code(500);
      console.error(error);

      return response;
    }
  }

  async deleteSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteSongById(id);

      return {
        status: 'success',
        message: 'Lagu berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);

        return response;
      }

      // else, SERVER ERROR
      const response = h.response({
        status: 'error',
        message: 'Sedang terjadi gangguan pada server',
      });
      response.code(500);
      console.error(error);

      return response;
    }
  }
}

module.exports = SongHandler;
