// ---- server ---- //

import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const client = await getClient();

    await client.query(
      `
      INSERT INTO events(txn_id, amount, event_type, event_time) 
      VALUES ($1, $2, $3, $4)
      `.trim(),
      [
        formData.get("txnId"),
        formData.get("amount"),
        formData.get("eventType"),
        formData.get("eventTime"),
      ]
    );

    await client.end();
  } catch (e) {
    console.log("e :>> ", e);
  } finally {
    return redirect("/");
  }
};

// ---- client ---- //

import {
  Card,
  Title,
  Text,
  NumberInput,
  Grid,
  TextInput,
  Select,
  SelectItem,
  Button,
} from "@tremor/react";
import { getClient } from "db";
import { CheckCircle, Clock, DollarSign } from "lucide-react";
import { useState } from "react";

export default function CreateEvent() {
  const [value, setValue] = useState("");

  return (
    <>
      <Title>Create Event</Title>
      <Text>Fill in and submit the form below to create a transaction.</Text>

      <Form method="post" action="/create-event">
        <Card className="mt-6">
          <Grid numItems={1} numItemsMd={2} className="gap-6">
            <label className="text-sm text-gray-900">
              Transaction ID
              <TextInput
                placeholder="Enter an ID"
                className="mt-2"
                name="txnId"
                autoComplete="off"
              />
            </label>

            <label className="text-sm text-gray-900">
              Transaction Amount
              <NumberInput
                icon={DollarSign}
                placeholder="Enter an amount"
                className="mt-2"
                name="amount"
                autoComplete="off"
              />
            </label>

            <label className="text-sm text-gray-900">
              Event Time
              <NumberInput
                icon={Clock}
                placeholder="Enter an arbitrary number"
                className="mt-2"
                name="eventTime"
                autoComplete="off"
              />
            </label>

            <label className="text-sm text-gray-900">
              Event Type
              <Select
                placeholder="Select a type"
                className="mt-2"
                value={value}
                onValueChange={setValue}
              >
                <SelectItem value="TXN_AUTHED">
                  Authorize Transaction
                </SelectItem>
                <SelectItem value="TXN_SETTLED">Settle Transaction</SelectItem>
                <SelectItem value="TXN_AUTH_CLEARED">
                  Clear Transaction
                </SelectItem>
                <SelectItem value="PAYMENT_INITIATED">
                  Initiate Payment
                </SelectItem>
                <SelectItem value="PAYMENT_POSTED">Post Payment</SelectItem>
                <SelectItem value="PAYMENT_CANCELED">Cancel Payment</SelectItem>
              </Select>
              <input
                value={value}
                name="eventType"
                readOnly
                className="hidden"
              />
            </label>
          </Grid>

          <Button
            className="mt-8 w-full transition-colors"
            icon={CheckCircle}
            type="submit"
          >
            Submit
          </Button>
        </Card>
      </Form>
    </>
  );
}

// ---- seo ---- //

import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

