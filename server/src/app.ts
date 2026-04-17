import 'dotenv/config';
import { createApp } from './createApp.js';

const app = createApp();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`LingTube server running on port ${PORT}`);
});
