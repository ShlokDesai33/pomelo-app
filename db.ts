import pg from "pg";

export async function getClient() {
  const client = new pg.Client(
    "postgres://postgres:password@postgres:5432/postgres"
  );

  await client.connect();
  return client;
}