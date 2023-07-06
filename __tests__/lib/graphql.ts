import axios from "axios";
import _ from "lodash";

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

const graphQl = async (url, query, variables = {}, auth = null) => {
  const headers: Record<string, unknown> = {};
  if (auth) {
    headers.Authorization = auth;
  }

  try {
    const resp = await axios.post(
      url,
      {
        query,
        variables: JSON.stringify(variables),
      },
      { headers: { Authorization: auth } }
    );

    const { data, errors } = resp.data;
    throwOnErrors({ query, variables, errors });
    return data;
  } catch (err) {
    const errors = _.get(err, "response.data.errors");
    throwOnErrors({ query, variables, errors });
    throw err;
  }
};

export default graphQl;
