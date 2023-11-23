// ---- server ---- //

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getClient } from "db";
import summarize from "~/summarize";

const colors = {
  increase: "emerald",
  moderateIncrease: "emerald",
  unchanged: "orange",
  moderateDecrease: "rose",
  decrease: "rose",
};

export async function loader({ request }: LoaderFunctionArgs) {
  // fetch events data from db
  const client = await getClient();
  const res = await client.query("SELECT * FROM events");
  await client.end();

  const output = summarize(res.rows);

  return json({
    kpis: [
      {
        title: "Available Credit",
        metric: `$ ${output.availableCredit}`,
        metricPrev: "$ 5,456",
        delta: "34.3%",
        deltaType: "moderateIncrease",
        color: colors["moderateIncrease"],
      },
      {
        title: "Payable Balance",
        metric: `$ ${output.payableBalance}`,
        metricPrev: "$ 1,000",
        delta: "10.9%",
        deltaType: "moderateDecrease",
        color: colors["moderateDecrease"],
      },
    ],
    pendingTxns: output.pendingTxns,
    settledTxns: output.settledTxns,
  });
}

// ---- client ---- //

import {
  Card,
  Title,
  Text,
  Grid,
  Col,
  Metric,
  Flex,
  BadgeDelta,
} from "@tremor/react";
import { Circle } from "lucide-react";

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <>
      <Title>Dashboard</Title>
      <Text>Hey, Shlok! Hope you're having a wonderful day.</Text>

      <Grid numItemsLg={6} className="gap-6 mt-6 h-full">
        <Col numColSpanLg={2}>
          <div className="space-y-6">
            {data.kpis.map((item) => (
              <Card key={item.title}>
                <Text>{item.title}</Text>
                <Flex
                  justifyContent="start"
                  alignItems="baseline"
                  className="truncate space-x-3 mt-1"
                >
                  <Metric>{item.metric}</Metric>
                  <Text className="truncate">from {item.metricPrev}</Text>
                </Flex>
                <Flex justifyContent="start" className="space-x-2 mt-4">
                  <BadgeDelta deltaType={item.deltaType} />
                  <Flex justifyContent="start" className="space-x-1 truncate">
                    <Text color={item.color as any}>{item.delta}</Text>
                    <Text className="truncate">to previous month</Text>
                  </Flex>
                </Flex>
              </Card>
            ))}
          </div>
        </Col>

        <Col numColSpanLg={4}>
          <Card>
            {data.settledTxns.length > 0 && (
              <>
                <Text>Settled Transactions</Text>
                <div className="mt-4 mb-8 space-y-4">
                  {data.settledTxns.map((txn) => (
                    <div className="flex items-center px-4 py-2 rounded-md bg-emerald-50/50 border border-emerald-100">
                      <Text>@{txn.txnId}</Text>
                      <Title className="ml-4">{txn.amount}</Title>
                      <div className="flex items-center gap-x-4 ml-auto">
                        <Text>Authorized at: {txn.initialTime}</Text>
                        <Circle fill="000000" className="h-1 w-1" />
                        <Text>Settled at: {txn.finalTime}</Text>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {data.pendingTxns.length > 0 && (
              <>
                <Text className="">Pending Transactions</Text>
                <div className="mt-4 space-y-4">
                  {data.pendingTxns.map((txn) => (
                    <div className="flex items-center px-4 py-2 rounded-md bg-amber-50/50 border border-amber-100">
                      <Text>@{txn.txnId}</Text>
                      <Title className="ml-4">{txn.amount}</Title>
                      <div className="flex items-center gap-x-4 ml-auto">
                        <Text>Authorized at: {txn.initialTime}</Text>
                        <Circle fill="000000" className="h-1 w-1" />
                        <Text>Pending</Text>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </Col>
      </Grid>
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
