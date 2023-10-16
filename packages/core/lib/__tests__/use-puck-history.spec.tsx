import { _recordHistory } from "../use-puck-history";
import { AppData } from "../../types/Config";
import { defaultAppData } from "../../components/Puck/context";

const mockDispatch = jest.fn();

const mockedAppData1: AppData = {
  ...defaultAppData,
  data: {
    ...defaultAppData.data,
    content: [
      {
        type: "MyComponent",
        props: {
          id: "123",
          title: "Hello, world",
        },
      },
    ],
  },
};

const mockedAppData2: AppData = {
  ...defaultAppData,
  data: {
    ...defaultAppData.data,
    content: [
      {
        type: "MyComponent",
        props: {
          id: "123",
          title: "Goodbye, world",
        },
      },
    ],
  },
};

const mockedAppDataArray1: AppData = {
  data: {
    content: [
      {
        type: "ButtonGroup",
        props: {
          buttons: [
            { label: "Learn more", href: "#", variant: "primary" },
            { label: "Button", href: "#", variant: "primary" },
            { label: "Button", href: "#", variant: "primary" },
          ],
          id: "ButtonGroup-7fc86319954fbb0551a24282018c3d2a10b14fbd",
        },
      },
    ],
    root: { title: "" },
    zones: {},
  },
  state: {
    leftSideBarVisible: true,
    arrayState: {
      "ArrayField-6f94973722d42695d4e7b8678e7dcca5affc70df": {
        items: [
          {
            _arrayId: "ArrayItem-46a064dbef49e8441afd782b10320b74f27f8bcb",
            data: { label: "Learn more", href: "#", variant: "primary" },
          },
          {
            _arrayId: "ArrayItem-5d99e3a7721edad0d127c9a6b010a37097dad610",
            data: { label: "Button", href: "#", variant: "primary" },
          },
          {
            _arrayId: "ArrayItem-222ea8b444fa799a8863eb32d057f3080ec99c65",
            data: { label: "Button", href: "#", variant: "primary" },
          },
        ],
        openId: "",
      },
    },
    itemSelector: { index: 0, zone: "default-zone" },
  },
};

const mockedAppDataArray2: AppData = {
  data: {
    content: [
      {
        type: "ButtonGroup",
        props: {
          buttons: [
            { label: "Button", href: "#", variant: "primary" },
            { label: "Button", href: "#", variant: "primary" },
          ],
          id: "ButtonGroup-7fc86319954fbb0551a24282018c3d2a10b14fbd",
        },
      },
    ],
    root: { title: "" },
    zones: {},
  },
  state: {
    leftSideBarVisible: true,
    arrayState: {
      "ArrayField-6f94973722d42695d4e7b8678e7dcca5affc70df": {
        items: [
          {
            _arrayId: "ArrayItem-5d99e3a7721edad0d127c9a6b010a37097dad610",
            data: { label: "Button", href: "#", variant: "primary" },
          },
          {
            _arrayId: "ArrayItem-222ea8b444fa799a8863eb32d057f3080ec99c65",
            data: { label: "Button", href: "#", variant: "primary" },
          },
          {
            _arrayId: "ArrayItem-46a064dbef49e8441afd782b10320b74f27f8bcb",
            data: { label: "Learn more", href: "#", variant: "primary" },
          },
        ],
        openId: "",
      },
    },
    itemSelector: { index: 0, zone: "default-zone" },
  },
};

describe("usePuckHistory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rewinds a diff correctly", () => {
    const histories: { rewind: () => void; forward: () => void }[] = [];
    const record = (history) => histories.push(history);

    _recordHistory({
      snapshot: mockedAppData1,
      newSnapshot: mockedAppData2,
      dispatch: mockDispatch,
      record,
    });

    // Rewind last history
    histories[histories.length - 1].rewind();

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "set",
      appData: mockedAppData1,
    });
  });

  it("fast-forwards a diff correctly", () => {
    const histories: { rewind: () => void; forward: () => void }[] = [];
    const record = (history) => {
      histories.push(history);
    };

    _recordHistory({
      snapshot: mockedAppData1,
      newSnapshot: mockedAppData2,
      dispatch: mockDispatch,
      record,
    });

    histories[histories.length - 1].forward();

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "set",
      appData: mockedAppData2,
    });
  });

  it("rewinds an array diff correctly", () => {
    const histories: any[] = [];
    const record = (history) => histories.push(history);

    _recordHistory({
      snapshot: mockedAppDataArray1,
      newSnapshot: mockedAppDataArray2,
      dispatch: mockDispatch,
      record,
    });

    // Rewind last history
    histories[histories.length - 1].rewind();

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "set",
      appData: mockedAppDataArray1,
    });
  });

  it("fast-forwards a diff correctly", () => {
    const histories: any[] = [];
    const record = (history) => histories.push(history);

    _recordHistory({
      snapshot: mockedAppDataArray1,
      newSnapshot: mockedAppDataArray2,
      dispatch: mockDispatch,
      record,
    });

    histories[histories.length - 1].forward();

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "set",
      appData: mockedAppDataArray2,
    });
  });
});
