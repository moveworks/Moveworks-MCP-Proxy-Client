import { Client } from "pg";
import { faker } from "@faker-js/faker";

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

async function seedStoreDb() {
  const client = new Client(storeDbConfig);
  await client.connect();

  // Insert users
  for (let i = 0; i < 100; i++) {
    const name = faker.person.fullName();
    const email = faker.internet.email({
      firstName: name.split(" ")[0],
      lastName: name.split(" ")[1],
    });
    await client.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING",
      [name, email]
    );
  }

  // Get user IDs for orders
  const userIdsResult = await client.query("SELECT id FROM users");
  const userIds = userIdsResult.rows.map((row) => row.id);

  // Insert orders
  for (let i = 0; i < 500; i++) {
    const userId = faker.helpers.arrayElement(userIds);
    const productName = faker.commerce.productName();
    const price = parseFloat(faker.commerce.price({ min: 10, max: 1000 }));
    await client.query(
      "INSERT INTO orders (user_id, product_name, price) VALUES ($1, $2, $3)",
      [userId, productName, price]
    );
  }

  console.log("Seeded store_db with 100 users and 500 orders");
  await client.end();
}

async function seedBlogDb() {
  const client = new Client(blogDbConfig);
  await client.connect();

  // Insert authors
  for (let i = 0; i < 50; i++) {
    const name = faker.person.fullName();
    const email = faker.internet.email({
      firstName: name.split(" ")[0],
      lastName: name.split(" ")[1],
    });
    await client.query(
      "INSERT INTO authors (name, email) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING",
      [name, email]
    );
  }

  // Get author IDs for posts
  const authorIdsResult = await client.query("SELECT id FROM authors");
  const authorIds = authorIdsResult.rows.map((row) => row.id);

  // Insert posts
  for (let i = 0; i < 200; i++) {
    const authorId = faker.helpers.arrayElement(authorIds);
    const title = faker.lorem.sentence({ min: 3, max: 8 });
    const content = faker.lorem.paragraphs({ min: 2, max: 5 });
    await client.query(
      "INSERT INTO posts (author_id, title, content) VALUES ($1, $2, $3)",
      [authorId, title, content]
    );
  }

  console.log("Seeded blog_db with 50 authors and 200 posts");
  await client.end();
}

async function seedAll() {
  try {
    await seedStoreDb();
    await seedBlogDb();
    console.log("All databases seeded successfully");
  } catch (err) {
    console.error("Error seeding databases:", err);
    process.exit(1);
  }
}

seedAll();
