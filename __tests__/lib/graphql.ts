import axios, { AxiosResponse } from "axios";

import { logFn } from "../../src/libs/logging";

const log = logFn("__tests__.lib.graphql.");

const throwOnErrors = ({
  query,
  variables,
  errors,
}: {
  query: string;
  variables: Record<string, unknown>;
  errors: Record<string, unknown>;
}) => {
  if (errors) {
    const errorMessage = `
query: ${query.substring(0, 100)}
variables: ${JSON.stringify(variables, null, 2)}
errors: ${JSON.stringify(errors, null, 2)}
    `;
    throw new Error(errorMessage);
  }
};

const graphQl = async (
  url: string,
  query: string,
  variables = {},
  auth: string | null = null,
  apiKey: string | null = null,
) => {
  const headers: Record<string, string> = {};
  if (auth) {
    headers.Authorization = auth;
  }
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  try {
    log("gql.axiosPost.start", "debug");
    const resp: AxiosResponse<
      Record<"data" | "errors", Record<string, unknown>>
    > = await axios.post(
      url,
      {
        query,
        variables: JSON.stringify(variables),
      },
      { headers },
    );
    log("gql.axiosPost.endSuccess", "debug");

    const { data, errors } = resp.data;
    throwOnErrors({ query, variables, errors });
    return data;
  } catch (err) {
    log("gql.axiosPost.endError", "debug", err);
    throw err;
  }
};

export default graphQl;
