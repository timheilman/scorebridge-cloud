import chance from "chance";

const aRandomUser = (): { name: string; password: string; email: string } => {
  const firstName = chance().first({ nationality: "en" });
  const lastName = chance().first({ nationality: "en" });
  const suffix = chance().string({
    length: 4,
    pool: "abcdefghijklmnopqrstuvwxyz",
  });
  const name = `${firstName} ${lastName} ${suffix}`;
  const password = chance().string({ length: 8 });
  const email = `${firstName}-${lastName}-${suffix}@appsyncmasterclass.com`;

  return {
    name,
    password,
    email,
  };
};

// eslint-disable-next-line import/prefer-default-export
export { aRandomUser };
