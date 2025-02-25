import { ExternalField } from "@/core/types";

import { BaseEntry, ContentfulClientApi, createClient } from "contentful";

export { createClient };

export type Entry<Fields extends Record<string, any> = {}> = BaseEntry & {
  fields: Fields;
};

export function createFieldContentful<T extends Entry = Entry>(
  contentType: string,
  options: {
    client?: ContentfulClientApi<undefined>;
    space?: string;
    accessToken?: string;
    titleField?: string;
    filterFields?: ExternalField["filterFields"];
    initialFilters?: ExternalField["initialFilters"];
  } = {}
) {
  const {
    space,
    accessToken,
    titleField = "title",
    filterFields,
    initialFilters,
  } = options;

  if (!options.client) {
    if (!space || !accessToken) {
      throw new Error(
        'field-contentful: Must either specify "client", or "space" and "accessToken"'
      );
    }
  }

  const client =
    options.client ||
    createClient({ space: space!, accessToken: accessToken! });

  const field: ExternalField<T> = {
    type: "external",
    placeholder: "Select from Contentful",
    showSearch: true,
    fetchList: async ({ query, filters = {} }) => {
      const entries = await client.getEntries({
        ...filters,
        content_type: contentType,
        query,
      });

      return entries.items;
    },
    mapRow: ({ fields }) => fields,
    getItemSummary: (item) =>
      item.fields[titleField as keyof typeof item.fields],
    filterFields,
    initialFilters,
  };

  return field;
}

export default createFieldContentful;
