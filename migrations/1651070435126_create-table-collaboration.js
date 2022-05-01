exports.up = (pgm) => {
  pgm.createTable('collaborations', {
    id: {
      type: 'VARCHAR(30)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(30)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(30)',
      notNull: true,
    },
  });

  pgm.addConstraint('collaborations', 'unique_playlist_id_and_user_id', 'UNIQUE(playlist_id, user_id)');
  pgm.addConstraint('collaborations', 'fk_collaborations.playlist.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON UPDATE CASCADE ON DELETE CASCADE');
  pgm.addConstraint('collaborations', 'fk_collaborations.user.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('collaborations');
};
