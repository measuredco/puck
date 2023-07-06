export const createAdaptor = (
  input: RequestInfo | URL,
  init?: RequestInit,
  name: string = "API"
) => ({
  name,
  fetchList: async () => {
    const res = await fetch(input, init);
    const body: { data: Record<string, any>[] } = await res.json();

    return body.data;
  },
});

export default createAdaptor;
