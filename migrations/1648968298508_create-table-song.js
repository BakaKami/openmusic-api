/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('song', {
    id: {
      type: 'VARCHAR(30)',
      primaryKey: true,
    },
    title: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'SMALLINT',
      notNull: true,
    },
    genre: {
      type: 'TEXT',
      notNull: true,
    },
    performer: {
      type: 'TEXT',
      notNull: true,
    },
    duration: {
      type: 'SMALLINT',
    },
    albumid: {
      type: 'TEXT',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('song');
};
