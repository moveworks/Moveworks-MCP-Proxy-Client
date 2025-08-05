import { Client } from "pg";

// Database connection configuration
const storeDbConfig = {
  host: Bun.env.PGHOST,
  port: Number(Bun.env.PGPORT),
  user: Bun.env.PGUSER,
  password: Bun.env.PGPASSWORD,
  database: Bun.env.STORE_DB,
};

const blogDbConfig = {
  host: Bun.env.PGHOST,
  port: Number(Bun.env.PGPORT),
  user: Bun.env.PGUSER,
  password: Bun.env.PGPASSWORD,
  database: Bun.env.BLOG_DB,
};

async function setupSchema() {
  // Connect to store_db
  const storeClient = new Client(storeDbConfig);
  await storeClient.connect();

  // Create tables in store_db
  await storeClient.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      product_name VARCHAR(100) NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("Tables created in store_db");

  await storeClient.end();

  // Connect to blog_db
  const blogClient = new Client(blogDbConfig);
  await blogClient.connect();

  // Create tables in blog_db
  await blogClient.query(`
    CREATE TABLE IF NOT EXISTS authors (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      author_id INTEGER REFERENCES authors(id),
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log("Tables created in blog_db");

  await blogClient.end();
}

setupSchema().catch((err) => {
  console.error("Error setting up schema:", err);
  process.exit(1);
});
