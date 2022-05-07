exports.up = (pgm) => {
  pgm.addColumns('albums', {
    cover: {
      type: 'TEXT',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('albums', 'cover');
};
