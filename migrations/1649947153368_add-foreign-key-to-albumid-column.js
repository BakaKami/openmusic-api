exports.up = (pgm) => {
  pgm.addConstraint('songs', 'fk_songs.album.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON UPDATE CASCADE ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('songs', 'fk_songs.album.id');
};
