import createAdaptor from "@measured/puck-adaptor-fetch/index";

const createStrapiAdaptor = (url: string, apiToken: string) =>
  createAdaptor(
    "Strapi.js",
    url,
    {
      headers: {
        Authorization: `bearer ${apiToken}`,
      },
    },
    (body) =>
      body.data.map(({ attributes, ...item }) => ({
        ...item,
        ...attributes,
      }))
  );

export default createStrapiAdaptor;
