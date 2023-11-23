import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getClient } from "db";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const client = await getClient();
    
    await client.query(
      `
      CREATE TABLE events (
        txn_id varchar(32),
        amount int,
        event_type varchar(32),
        event_time int
      );
      `.trim()
    );

    await client.end();
  } catch (e) {
    console.log("e :>> ", e);
  }

  return json({ success: true }, 200);
};
