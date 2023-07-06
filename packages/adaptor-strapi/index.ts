import { Adaptor } from "@measured/puck/types/Config";

type AdaptorParams = { apiToken: string; url: string; resource: string };

const strapiAdaptor: Adaptor<AdaptorParams> = {
  name: "Strapi.js",
  fetchList: async (adaptorParams) => {
    if (!adaptorParams) {
      return null;
    }

    const res = await fetch(
      `${adaptorParams.url}/api/${adaptorParams.resource}`,
      {
        headers: {
          Authorization: `bearer ${adaptorParams.apiToken}`,
        },
      }
    );

    const body: { data: Record<string, any>[] } = await res.json();

    return body.data;
  },
};

export default strapiAdaptor;
