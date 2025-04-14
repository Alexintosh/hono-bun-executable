import app from './backend/src/index'; // Import your Hono app from index.ts
import open from 'open';

// Define the port (use environment variable or a default)
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Start the Bun server
const server = Bun.serve({
  fetch: app.fetch, // Use the fetch handler from your Hono app
  port: port,
  // hostname: "0.0.0.0", // Optional: listen on all interfaces
});

// Construct the URL using the actual port the server is listening on
const url = `http://localhost:${server.port}`;

console.log(`Server started. UI available at ${url}`);

// Open the default browser to the URL
(async () => {
  try {
    await open(url);
    console.log(`Default browser opened to ${url}`);
  } catch (error) {
    console.error(`Error opening browser: ${error}`);
    console.log(`Please navigate to ${url} manually.`);
  }
})();

// The Bun.serve call keeps the process running