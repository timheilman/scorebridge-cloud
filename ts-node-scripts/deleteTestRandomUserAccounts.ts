import dotenv from "dotenv";

import { logFn } from "../src/libs/logging";
import { deleteAccounts, userAttr } from "./deleteAccounts";
const log = logFn("ts-node-scripts.deleteEtherealAccounts");

dotenv.config();
deleteAccounts((user) => {
  return !!userAttr(user, "email")!.match(/^tdh\+sb-test-random-user/);
})
  .then(() => log("deleteTestRandomUserAccounts.success", "info"))
  .catch((e) => log("deleteTestRandomUserAccounts.error", "error", e));
