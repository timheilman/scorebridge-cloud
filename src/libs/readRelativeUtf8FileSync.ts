import fs from "fs";
import path from "path";

export default function readRelativeUtf8FileSync(
  dirname: string,
  relativeFilePath: string,
) {
  function readFileSync(filePath: string): string {
    return fs.readFileSync(filePath, "utf8");
  }
  return readFileSync(path.join(dirname, relativeFilePath));
}
