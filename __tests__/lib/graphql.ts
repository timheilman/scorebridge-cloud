import axios, { AxiosHeaders } from "axios";

const throwOnErrors = ({ query, variables, errors }) => {
  if (errors) {
    const errorMessage = `
query: ${query.substring(0, 100)}

variables: ${JSON.stringify(variables, null, 2)}

error: ${JSON.stringify(errors, null, 2)}
    `;
    throw new Error(errorMessage);
  }
};

const graphQl = async (
  url,
  query,
  variables = {},
  auth = null,
  apiKey = null
) => {
  const headers: Record<string, string> = {};
  if (auth) {
    headers.Authorization = auth;
  }
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  try {
    console.log("Posting raw-dogged GQL");
    const resp = await axios.post(
      url,
      {
        query,
        variables: JSON.stringify(variables),
      },
      { headers }
    );
    console.log("Done posting raw-dogged GQL");

    const { data, errors } = resp.data;
    throwOnErrors({ query, variables, errors });
    return data;
  } catch (err) {
    console.log("Did I throwOnErrors?");
    console.log(err);
    throw err;
  }
};

export default graphQl;
