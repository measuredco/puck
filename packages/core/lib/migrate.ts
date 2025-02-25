import { Data } from "../types";

type Migration = (props: Data & { [key: string]: any }) => Data;

const migrations: Migration[] = [
  // Migrate root to root.props
  (data) => {
    const rootProps = data.root.props || data.root;

    if (Object.keys(data.root).length > 0 && !data.root.props) {
      console.warn(
        "Migration applied: Root props moved from `root` to `root.props`."
      );

      return {
        ...data,
        root: {
          props: {
            ...rootProps,
          },
        },
      };
    }

    return data;
  },
];

export function migrate(data: Data): Data {
  return migrations?.reduce((acc, migration) => migration(acc), data) as Data;
}
