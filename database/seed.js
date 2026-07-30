const { db, User, Collection, Track, Movie } = require('./index'); // adjust path to wherever your associations file lives

const seed = async () => {
  try {
    // Wipe and recreate all tables based on current models
    await db.sync({ force: true });

    // ----- Users -----
    const alice = await User.create({ name: 'Alice Johnson', email: 'alice@example.com' });
    const bob = await User.create({ name: 'Bob Smith', email: 'bob@example.com' });

    // ----- Tracks -----
    const track1 = await Track.create({ name: 'Blinding Lights', artist: 'The Weeknd' });
    const track2 = await Track.create({ name: 'Levitating', artist: 'Dua Lipa' });
    const track3 = await Track.create({ name: 'Bohemian Rhapsody', artist: 'Queen' });

    // ----- Movies -----
    const movie1 = await Movie.create({ title: 'Inception', director: 'Christopher Nolan' });
    const movie2 = await Movie.create({ title: 'Parasite', director: 'Bong Joon-ho' });

    // ----- Collections -----
    // Top-level collection owned by Alice
    const alicesFavorites = await Collection.create({
      user_id: alice.id,
      category: 'music',
      name: "Alice's Favorites"
    });

    // Child collection nested under Alice's Favorites
    const alicesRoadTrip = await Collection.create({
      user_id: alice.id,
      parent_id: alicesFavorites.collection_id,
      category: 'music',
      name: 'Road Trip Mix'
    });

    // Collection owned by Bob
    const bobsWatchlist = await Collection.create({
      user_id: bob.id,
      category: 'movies',
      name: "Bob's Watchlist"
    });

    // Collection with no owner (allowed since user_id is nullable)
    const orphanCollection = await Collection.create({
      category: 'music',
      name: 'Unclaimed Mixtape'
    });

    // ----- Many-to-many associations -----
    // Alice's Favorites gets tracks 1 and 2
    await alicesFavorites.addTracks([track1, track2]);

    // Road Trip Mix gets track 2 and 3 (track2 shared across two collections - allowed)
    await alicesRoadTrip.addTracks([track2, track3]);

    // Bob's Watchlist gets both movies
    await bobsWatchlist.addMovies([movie1, movie2]);

    // Orphan collection gets track1 (same track, different collection - allowed)
    await orphanCollection.addTrack(track1);

    console.log('Seed data created successfully.');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await db.close();
  }
};

seed();