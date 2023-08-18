import fs from "fs";
import path from "path";

export default function readRelativeUtf8FileSync(relativeFilePath: string) {
  function readFileSync(filePath: string): string {
    return fs.readFileSync(filePath, "utf8");
  }
  return readFileSync(path.join(__dirname, relativeFilePath));
}
