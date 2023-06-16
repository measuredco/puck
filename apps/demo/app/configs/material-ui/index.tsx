import { Config } from "core/types/Config";
import { CardDeck, CardDeckProps } from "./blocks/CardDeck";
import { ConfigProvider } from "antd/dist/antd";

type Props = {
  CardDeck: CardDeckProps;
};

// We avoid the name config as next gets confused
export const conf: Config<Props> = {
  // page: {
  //   render: ({ children }) => <ConfigProvider>{children}</ConfigProvider>,
  // },
  components: {
    CardDeck,
    // HeadingBlock: {
    //   fields: {
    //     title: { type: "text" },
    //   },
    //   render: ({ title = "Heading" }) => (
    //     <div style={{ padding: 64 }}>
    //       <h1>{title}</h1>
    //     </div>
    //   ),
    // },
  },
};

export default conf;
