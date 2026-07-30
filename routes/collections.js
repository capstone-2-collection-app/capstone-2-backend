const express = require("express");
const {
  db,
  User,
  Collection,
  Track,
  Movie,
  CollectionTrack,
  CollectionMovie
} = require("../database/index")
const router = express.Router()


// GET all top-level collections belonging to the current guest,
// with two levels of nested children (children + grandchildren) included.
router.get("/collections", async (req, res) => {
  try {
    const collections = await Collection.findAll({
      where: { parent_id: null, guest_id: req.guestId},
      include: {
        model: Collection,
        as: 'children',
        include: {
          model: Collection,
          as: 'children' // grandchildren
        }
      }
    });
    res.json(collections);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// GET a single collection by its primary key, with two levels of nested children included.
// NOTE: currently has no ownership check and no "not found" check - see below.
router.get("/collections/:id", async (req, res) => {
  try {
    const collection = await Collection.findByPk(req.params.id, {
        include: {
            model: Collection,
            as: 'children',
            include: {
            model: Collection,
            as: 'children' // grandchildren
            }
        }

    });
    res.json(collection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


// Creates a new child collection under an existing parent collection.
// NOTE: comment says PATCH but this is actually a POST route - see below.
router.post('/collections/:parentId/children', async (req, res) => {
  try {
    const { parentId } = req.params;
    const { name, category } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'name and category are required' });
    }

    const parent = await Collection.findByPk(parentId);
    if (!parent) {
      return res.status(404).json({ error: 'Parent collection not found' });
    }

    // Ownership check
    if (parent.guest_id !== req.guestId) {
      return res.status(403).json({ error: 'You do not have access to this collection' });
    }

    const child = await Collection.create({
      name,
      category,
      parent_id: parent.collection_id,
      user_id: parent.user_id
    });

    res.status(201).json(child);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Creates a new top-level collection (no parent) owned by the current guest.
router.post('/collections', async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'name and category are required' });
    }

    const collection = await Collection.create({
      name,
      category,
      guest_id: req.guestId
    });

    res.status(201).json(collection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


module.exports = router;