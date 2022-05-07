class UploadsHandler {
  constructor(storageService, albumService, validator) {
    this._storageService = storageService;
    this._albumService = albumService;
    this._validator = validator;

    this.postUploadAlbumCoverHandler = this.postUploadAlbumCoverHandler.bind(this);
  }

  async postUploadAlbumCoverHandler(request, h) {
    const { cover } = request.payload;
    const { id } = request.params;

    this._validator.validateImageHeaders(cover.hapi.headers);

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    await this._albumService.updateAlbumCover(id, `http://${process.env.HOST}:${process.env.PORT}/albums/${id}/covers/${filename}`);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);

    return response;
  }
}

module.exports = UploadsHandler;
