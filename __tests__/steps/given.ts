import chance from "chance";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();
const lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz";

export const aRandomClubName = (): string =>
  `Randomized Club Name ${chance().string({
    length: 8,
    pool: lowerCaseLetters,
  })}`;
export const aRandomUser = (): {
  name: string;
  password: string;
  email: string;
} => {
  const firstName = chance().first({ nationality: "en" });
  const lastName = chance().first({ nationality: "en" });
  const suffix = chance().string({
    length: 4,
    pool: lowerCaseLetters,
  });
  const name = `${firstName} ${lastName} ${suffix}`;
  const password = `${chance().string({ length: 8 })}`;
  const email = `tdh+sb-test-random-user-${firstName}-${lastName}-${suffix}@stanfordalumni.org`;

  return {
    name,
    password,
    email,
  };
};
