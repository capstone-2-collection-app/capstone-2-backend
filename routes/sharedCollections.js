const express = require("express");
const jwt = require("jsonwebtoken");
const { Collection } = require("../database/index");

const router = express.Router();

async function getCollectionDetails(collection, depth = 0) {
  const tracks = await collection.getTracks({
    attributes: ["track_id", "name", "artist"],
    joinTableAttributes: [],
  });

  const movies = await collection.getMovies({
    attributes: ["movie_id", "title", "director"],
    joinTableAttributes: [],
  });

  const children = [];

  if (depth < 2) {
    const childCollections = await Collection.findAll({
      where: { parent_id: collection.collection_id },
      attributes: ["collection_id", "name", "category"],
    });

    for (const child of childCollections) {
      const childDetails = await getCollectionDetails(child, depth + 1);
      children.push(childDetails);
    }
  }

  return {
    collection_id: collection.collection_id,
    name: collection.name,
    category: collection.category,
    tracks,
    movies,
    children,
  };
}

// This route is public so a visitor can open a shared link without logging in.
router.get("/shared/:shareToken", async (req, res) => {
  try {
    let verifiedToken;

    try {
      verifiedToken = jwt.verify(
        req.params.shareToken,
        process.env.JWT_SECRET,
      );
    } catch {
      return res.status(404).json({ error: "Shared collection not found" });
    }

    if (
      verifiedToken.purpose !== "collection-share" ||
      !verifiedToken.collection_id
    ) {
      return res.status(404).json({ error: "Shared collection not found" });
    }

    const collection = await Collection.findByPk(verifiedToken.collection_id, {
      attributes: ["collection_id", "name", "category"],
    });

    if (!collection) {
      return res.status(404).json({ error: "Shared collection not found" });
    }

    const collectionDetails = await getCollectionDetails(collection);
    res.status(200).json(collectionDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
