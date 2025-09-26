import express from 'express';

const router = express.Router();

// Basic in-memory placeholder. Replace with Mongo-backed implementation if needed.
router.get('/', async (_req, res) => {
  res.json({ ok: true, reviews: [] });
});

export default router;


