class ExportsHandler {
  constructor(playlistService, producerService, validator) {
    this._playlistService = playlistService;
    this._producerService = producerService;
    this._validator = validator;

    this.postExportSongsHandler = this.postExportSongsHandler.bind(this);
  }

  async postExportSongsHandler(request, h) {
    this._validator.validateExportSongsPayload(request.payload);

    const { id: userId } = request.auth.credentials;
    const { playlistId } = request.params;

    await this._playlistService.verifyPlaylistOwner(playlistId, userId);

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._producerService.sendMessage('export:songs', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    });
    response.code(201);

    return response;
  }
}

module.exports = ExportsHandler;
