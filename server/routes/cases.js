import express from 'express';
import fs from 'fs';
const router = express.Router();

const cases = JSON.parse(fs.readFileSync('./config/cases.json'));

router.get('/', (req, res) => {
  const result = Object.entries(cases).map(([key, val]) => ({
    ...val,
    id: key
  }));
  res.json(result);
});

export default router;