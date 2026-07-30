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


router.get("/collections", async (req, res) => {
  try {
    const collections = await Collection.findAll({
      where: { parent_id: null },
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


// PATCH /collections/:parentId/children
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

module.exports = router;