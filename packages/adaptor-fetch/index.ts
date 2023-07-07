import { Adaptor } from "@measured/puck";

function createAdaptor(
  name: string,
  input: RequestInfo | URL,
  map?: (data: any) => Record<string, any>[]
): Adaptor;

function createAdaptor(
  name: string,
  input: RequestInfo | URL,
  init?: RequestInit,
  map?: (data: any) => Record<string, any>[]
): Adaptor;

function createAdaptor(
  name: string,
  input: RequestInfo | URL,
  initOrMap?: unknown,
  map?: (data: any) => Record<string, any>[]
): Adaptor {
  return {
    name,
    fetchList: async () => {
      if (typeof initOrMap === "function") {
        const res = await fetch(input);
        const body = await res.json();

        return initOrMap(body);
      }

      const res = await fetch(input, initOrMap as RequestInit);
      const body = await res.json();

      return map ? map(body) : body;
    },
  };
}

export default createAdaptor;
