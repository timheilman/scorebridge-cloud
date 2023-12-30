import dotenv from "dotenv";

import { logFn } from "../src/libs/logging";
import { deleteAccounts, userAttr } from "./deleteAccounts";
dotenv.config();
const log = logFn("ts-node-scripts.deleteEtherealAccounts");

deleteAccounts((user) => {
  return !!userAttr(user, "email")!.match(/@ethereal\.email$/);
})
  .then(() => log("deleteEtherealAccounts.success", "info"))
  .catch((e) => log("deleteEtherealAccounts.error", "error", e));
