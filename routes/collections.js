const express = require("express");
const { Op, fn, col, where } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const {
  db,
  User,
  Collection,
  Track,
  Movie,
  CollectionTrack,
  CollectionMovie,
} = require("../database/index");

// import auth middleware
const requireAuth = require("./../middleware/requireAuth");

const router = express.Router();

// protect the backend route
router.use(requireAuth);

// GET all top-level collections belonging to the current guest,
// with two levels of nested children (children + grandchildren) included.
router.get("/collections", async (req, res) => {
  console.log("req.user:", req.user);
  try {
    const collections = await Collection.findAll({
      where: { parent_id: null, user_id: req.user.id },
      include: {
        model: Collection,
        as: "children",
        include: {
          model: Collection,
          as: "children", // grandchildren
        },
      },
    });
    res.json(collections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// GET a single collection by its primary key, with two levels of nested children included.
// NOTE: currently has no ownership check and no "not found" check - see below.
router.get("/collections/:id", async (req, res) => {
  try {
    const collection = await Collection.findByPk(req.params.id, {
      include: {
        model: Collection,
        as: "children",
        include: {
          model: Collection,
          as: "children", // grandchildren
        },
      },
    });
    res.json(collection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Creates a new child collection under an existing parent collection.
router.post("/collections/:parentId/children", async (req, res) => {
  try {
    const { parentId } = req.params;
    const { name, category } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: "name and category are required" });
    }

    const parent = await Collection.findByPk(parentId);
    if (!parent) {
      return res.status(404).json({ error: "Parent collection not found" });
    }

    // Ownership check
    if (parent.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You do not have access to this collection" });
    }

    const child = await Collection.create({
      name,
      category: category?.toLowerCase(),
      parent_id: parent.collection_id,
      user_id: parent.user_id,
    });

    res.status(201).json(child);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Adds a song to a collection. If the track doesn't exist yet, it creates it;
// if it already exists, it reuses it and just links it to this collection.
router.post("/collections/:id/tracks", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, artist } = req.body;

    if (!name || !artist) {
      return res.status(400).json({ error: "name and artist are required" });
    }

    const collection = await Collection.findByPk(id);
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    if (collection.category != "music") {
      return res.status(400).json({ error: "Collection of wrong category" });
    }

    if (collection.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You do not have access to this collection" });
    }

    const [track] = await Track.findOrCreate({
      where: { name, artist },
    });

    await collection.addTrack(track);

    res.status(201).json(track);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Creates a new top-level collection (no parent) owned by the current guest.
router.post("/collections", async (req, res) => {
  
  try {
    const { name, category } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: "name and category are required" });
    }

    const collection = await Collection.create({
      name,
      category: category?.toLowerCase(),
      user_id: req.user.id,
    });

    res.status(201).json(collection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Creates a share token for a collection owned by the current user.
router.post("/collections/:id/share", async (req, res) => {
  try {
    const collection = await Collection.findByPk(req.params.id);

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    if (collection.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You do not have access to this collection" });
    }

    if (!collection.share_token) {
      collection.share_token = uuidv4();
      await collection.save();
    }

    res.status(200).json({ share_token: collection.share_token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.delete("/collections/:id", async (req, res) => {
  try {
    console.log("hit");
    const collection = await Collection.findByPk(req.params.id);
    console.log(collection);
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    if (collection.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You do not have access to this collection" });
    }

    await collection.destroy();
    console.log(collection, "deleted");

    res.status(204).send(); // 204 No Content - standard for a successful delete
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// GET tracks belonging to a specific collection
router.get("/collections/:id/tracks", async (req, res) => {
  console.log("hit")
  try {
    const collection = await Collection.findByPk(req.params.id);

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    const tracks = await collection.getTracks();
    console.log(tracks)
    res.json(tracks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// DELETE - unlink a track from a collection (does not delete the Track row itself)
router.delete("/collections/:id/tracks/:trackId", async (req, res) => {
  try {
    const collection = await Collection.findByPk(req.params.id);

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    const track = await Track.findByPk(req.params.trackId);

    if (!track) {
      return res.status(404).json({ error: "Track not found" });
    }

    await collection.removeTrack(track);

    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});



// // GET movies belonging to a specific collection
// router.get("/collections/:id/movies", async (req, res) => {
//   try {
//     const collection = await Collection.findByPk(req.params.id);

//     if (!collection) {
//       return res.status(404).json({ error: "Collection not found" });
//     }

//     const movies = await Movie.findAll({
//       where: { collection_id: req.params.id },
//     });

//     res.json(movies);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// });

// DELETE - unlink a movie from a collection (does not delete the Movie row itself)
// router.delete("/collections/:id/movies/:movieId", async (req, res) => {
//   try {
//     const collection = await Collection.findByPk(req.params.id);

//     if (!collection) {
//       return res.status(404).json({ error: "Collection not found" });
//     }

//     const movie = await Movie.findByPk(req.params.movieId);

//     if (!movie) {
//       return res.status(404).json({ error: "Movie not found" });
//     }

//     await collection.removeMovie(movie);

//     res.status(204).end();
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// });

module.exports = router;
