import pg from "pg";

export async function getClient() {
  const client = new pg.Client(
    "postgres://postgres:password@localhost:5432/postgres"
  );

  await client.connect();
  return client;
}