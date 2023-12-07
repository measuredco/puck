import { Data } from "../types/Config";

type Migration = (props: Data & { [key: string]: any }) => Data;

export const migrations: Migration[] = [
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
