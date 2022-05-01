class ActivityHandler {
  constructor(activityService, playlistService) {
    this._activityService = activityService;
    this._playlistService = playlistService;

    this.getActivityByPlaylistIdHandler = this.getActivityByPlaylistIdHandler.bind(this);
  }

  async getActivityByPlaylistIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistService.verifyPlaylistAccess(id, credentialId);

    const playlistId = await this._activityService.getActivityByPlaylistId(id);
    const activities = await this._activityService.getActivityDetail(id);

    return {
      status: 'success',
      data: {
        playlistId,
        activities,
      },
    };
  }
}

module.exports = ActivityHandler;
