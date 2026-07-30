const db = require('./db');
const {
  User,
  Collection,
  Track,
  Movie,
  CollectionTrack,
  CollectionMovie
} = require('./models');

// ----- Associations -----

// User <-> Collection (one-to-many, optional)
User.hasMany(Collection, { foreignKey: 'user_id', as: 'collections' });
Collection.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });

// Collection self-reference (parent/child tree)
Collection.belongsTo(Collection, { foreignKey: 'parent_id', as: 'parent' });
Collection.hasMany(Collection, { foreignKey: 'parent_id', as: 'children' });

// Collection <-> Track (many-to-many through CollectionTrack)
Collection.belongsToMany(Track, {
  through: CollectionTrack,
  foreignKey: 'collection_id',
  otherKey: 'track_id',
  as: 'tracks'
});
Track.belongsToMany(Collection, {
  through: CollectionTrack,
  foreignKey: 'track_id',
  otherKey: 'collection_id',
  as: 'collections'
});

// Collection <-> Movie (many-to-many through CollectionMovie)
Collection.belongsToMany(Movie, {
  through: CollectionMovie,
  foreignKey: 'collection_id',
  otherKey: 'movie_id',
  as: 'movies'
});
Movie.belongsToMany(Collection, {
  through: CollectionMovie,
  foreignKey: 'movie_id',
  otherKey: 'collection_id',
  as: 'collections'
});

module.exports = {
  db,
  User,
  Collection,
  Track,
  Movie,
  CollectionTrack,
  CollectionMovie
};