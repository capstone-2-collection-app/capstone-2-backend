const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const db = require('./db.js');

const isBcryptHash = (str) => /^\$2[aby]\$\d{2}\$/.test(str);

/* 
    User Table
*/
const User = db.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },  
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  isGuest: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async(user) =>{
      if (!isBcryptHash(user.password)) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});


/*
    COllections table
*/
const Collection = db.define('Collection', {
  collection_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Collection_id'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true // collection can exist without a user
  },
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true // null = top-level collection
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'collections',
  timestamps: true
});

/* 
    Music Table
*/
const Track = db.define('Track', {
  track_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Track_id'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  artist: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'track',
  timestamps: true
});


/* 
    Movie Table
*/
const Movie = db.define('Movie', {
  movie_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Movie_id'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  director: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'movie',
  timestamps: true
});


const CollectionTrack = db.define('CollectionTrack', {
  collection_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  track_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  }
}, {
  tableName: 'collection_tracks',
  timestamps: false
});


const CollectionMovie = db.define('CollectionMovie', {
  collection_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  movie_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  }
}, {
  tableName: 'collection_movies',
  timestamps: false
});




module.exports = {
  User,
  Collection,
  Track,
  Movie,
  CollectionTrack,
  CollectionMovie
};
