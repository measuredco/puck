import { Adaptor } from "core/types/Config";

type AdaptorParams = { apiToken: string; resource: string };

export const strapiAdaptor: Adaptor<AdaptorParams> = {
  name: "Strapi.js",
  fetchList: async (adaptorParams) => {
    if (!adaptorParams) {
      return null;
    }

    const res = await fetch(
      `http://localhost:1337/api/${adaptorParams.resource}`,
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
