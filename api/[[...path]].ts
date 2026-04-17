/**
 * Vercel serverless entry point.
 *
 * All /api/* requests from the rewrites in vercel.json land here and are
 * delegated to the Express app. This lets us share a single route tree
 * between local dev (`npm run dev:server`) and Vercel deployment.
 */

import 'dotenv/config';
import path from 'node:path';
import { createApp } from '../server/src/createApp.js';

// On Vercel, data/ sits at the project root alongside api/ and client/.
// process.cwd() points to the project root at runtime for bundled functions.
const app = createApp({
  dataDir: path.join(process.cwd(), 'data'),
});

export default app;
