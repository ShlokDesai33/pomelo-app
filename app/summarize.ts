interface Transaction {
  initialTime: number;
  finalTime?: number;
  amount: number;
  state: "PENDING" | "FINALIZED" | "CLEARED";
}

interface Event {
  event_type: string;
  txn_id: string;
  event_time: number;
  amount: number;
}

export default function summarize(data: Event[]) {
  let availableCredit = 10000;
  let payableBalance = 0;
  const transactions: { [key: string]: Transaction } = {};

  for (const event of data) {
    if (event["event_type"] === "TXN_AUTHED") {
      if (
        availableCredit < 0 ||
        availableCredit < event["amount"] ||
        transactions[event["txn_id"]]
      ) {
        continue;
      }

      transactions[event["txn_id"]] = {
        initialTime: event["event_time"],
        amount: event["amount"],
        state: "PENDING",
      };

      availableCredit -= event["amount"];
    } else if (event["event_type"] === "TXN_SETTLED") {
      const txn_id = event["txn_id"];

      if (!transactions[txn_id]) {
        throw new Error(`Transaction with ID: ${txn_id} was never authorized.`);
      } else if (event["event_time"] <= transactions[txn_id]["initialTime"]) {
        throw new Error(
          `Transaction with ID: ${txn_id} was settled before authorized.`
        );
      } else if (transactions[txn_id]["state"] !== "PENDING") {
        throw new Error(`Transaction with ID: ${txn_id} was not pending.`);
      }

      const authedTxn = transactions[txn_id];
      const newAmount = event.amount || authedTxn["amount"];

      availableCredit += authedTxn["amount"];
      availableCredit -= newAmount;
      payableBalance += newAmount;

      transactions[txn_id].amount = newAmount;
      transactions[txn_id].finalTime = event["event_time"];
      transactions[txn_id].state = "FINALIZED";
    } else if (event["event_type"] === "TXN_AUTH_CLEARED") {
      const txn_id = event["txn_id"];

      if (!transactions[txn_id]) {
        throw new Error(`Transaction with ID: ${txn_id} was never authorized.`);
      } else if (event["event_time"] <= transactions[txn_id]["initialTime"]) {
        throw new Error(
          `Transaction with ID: ${txn_id} was cleared before authorized.`
        );
      } else if (transactions[txn_id]["state"] !== "PENDING") {
        throw new Error(`Transaction with ID: ${txn_id} was not pending.`);
      }

      const authedTxn = transactions[txn_id];
      availableCredit += authedTxn["amount"];

      transactions[txn_id].finalTime = event["event_time"];
      transactions[txn_id].state = "CLEARED";
    } else if (event["event_type"] === "PAYMENT_INITIATED") {
      if (transactions[event["txn_id"]]) {
        continue;
      }

      transactions[event["txn_id"]] = {
        initialTime: event["event_time"],
        amount: event["amount"],
        state: "PENDING",
      };

      if (payableBalance <= 0 || Math.abs(event["amount"]) > payableBalance) {
        throw new Error("Cannot pay off balance yet or payment too large.");
      }

      payableBalance -= Math.abs(event["amount"]);
    } else if (event["event_type"] === "PAYMENT_POSTED") {
      const txn_id = event["txn_id"];

      if (!transactions[txn_id]) {
        throw new Error(`Payment with ID: ${txn_id} was never initiated.`);
      } else if (event["event_time"] <= transactions[txn_id]["initialTime"]) {
        throw new Error(
          `Payment with ID: ${txn_id} was posted before initiated.`
        );
      } else if (transactions[txn_id]["state"] !== "PENDING") {
        throw new Error(`Payment with ID: ${txn_id} was not pending.`);
      }

      availableCredit += Math.abs(transactions[txn_id]["amount"]);

      transactions[txn_id].finalTime = event["event_time"];
      transactions[txn_id].state = "FINALIZED";
    } else if (event["event_type"] === "PAYMENT_CANCELED") {
      const txn_id = event["txn_id"];

      if (!transactions[txn_id]) {
        throw new Error(`Payment with ID: ${txn_id} was never initiated.`);
      } else if (event["event_time"] <= transactions[txn_id]["initialTime"]) {
        throw new Error(
          `Payment with ID: ${txn_id} was canceled before initiated.`
        );
      } else if (transactions[txn_id]["state"] !== "PENDING") {
        throw new Error(`Payment with ID: ${txn_id} was not pending.`);
      }

      payableBalance += Math.abs(transactions[txn_id]["amount"]);

      transactions[txn_id].finalTime = event["event_time"];
      transactions[txn_id].state = "CLEARED";
    } else {
      throw new Error(`Invalid event type: ${event["event_type"]}.`);
    }
  }

  const sortedTransactions: { [key: string]: Transaction } = {};
  Object.keys(transactions)
    .sort((a, b) => transactions[b].initialTime - transactions[a].initialTime)
    .forEach((key) => {
      sortedTransactions[key] = transactions[key];
    });

  let pendingTxns = [];
  let settledTxns = [];
  let settledCount = 0;

  for (const txn_id in sortedTransactions) {
    const event = sortedTransactions[txn_id];
    if (event.state === "PENDING") {
      if (event.amount < 0) {
        pendingTxns.push({
          txnId: txn_id,
          amount: `-$${Math.abs(event.amount)}`,
          initialTime: event.initialTime,
        });
      } else {
        pendingTxns.push({
          txnId: txn_id,
          amount: `$${event.amount}`,
          initialTime: event.initialTime,
        });
      }
    } else if (event.state === "FINALIZED" && settledCount < 3) {
      if (event.amount < 0) {
        settledTxns.push({
          txnId: txn_id,
          amount: `-$${Math.abs(event.amount)}`,
          initialTime: event.initialTime,
          finalTime: event.finalTime,
        });
      } else {
        settledTxns.push({
          txnId: txn_id,
          amount: `$${event.amount}`,
          initialTime: event.initialTime,
          finalTime: event.finalTime,
        });
      }
      settledCount += 1;
    }
  }

  return {
    availableCredit,
    payableBalance,
    pendingTxns,
    settledTxns,
  };
}
