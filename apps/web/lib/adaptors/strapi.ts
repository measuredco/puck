import { Adaptor } from "../../types/Config";

const strapiAdaptor: Adaptor = {
  name: "Strapi.js",
  fetchList: async (adaptorParams: { resource: string }) => {
    const res = await fetch(
      `http://localhost:1337/api/${adaptorParams.resource}`,
      {
        headers: {
          Authorization:
            "bearer 76ef70c739ec2fe718bfff35fa64384f1ada1d11ca83e3deb432e23304dfddbbe295f785d7c6fe7985a0e7f138633edf8c8a4eb1c4208cd5734f3220c19c0736567a5d3cacc20bba37a1e7fbc9e83ce0e808ce8ad1055f10d3f1eec4a42f378521df8dd12f839930382d18bda55def0615d3ea2d5fdef5196406695c13c44102",
        },
      }
    );

    const body: { data: any[] } = await res.json();

    return body.data;
  },
};

export default strapiAdaptor;
