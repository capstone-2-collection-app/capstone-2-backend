const express = require("express");
const app = express();
const {db} = require("./database/index.js");

app.use(express.json());


app.get('/search', async (req, res) => {
  try {
    const apiKey = process.env.LASTFM_API_KEY;
    const search = req.query.search || req.body.search;

    if (!search) {
      return res.status(400).json({ error: 'search is required in request body' });
    }

    const url = `http://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(search)}&api_key=${apiKey}&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch from Last.fm' });
    }

    const data = await response.json();
    const tracks = data.results?.trackmatches?.track || []
    const simplified = tracks.map(({name, artist}) => ({name, artist}));
    res.json(simplified);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


db.sync()
  .then(() => {
    app.listen(3000, () => console.log('Server running on port 3000'));
  })
  .catch((err) => console.error(err));