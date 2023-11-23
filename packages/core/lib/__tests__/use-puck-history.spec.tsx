import { _recordHistory } from "../use-puck-history";
import { AppState } from "../../types/Config";
import { defaultAppState } from "../../components/Puck/context";

const mockDispatch = jest.fn();

const mockedAppState1: AppState = {
  ...defaultAppState,
  data: {
    ...defaultAppState.data,
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

const mockedAppState2: AppState = {
  ...defaultAppState,
  data: {
    ...defaultAppState.data,
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

const mockedAppStateArray1: AppState = {
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
  ui: {
    leftSideBarVisible: true,
    rightSideBarVisible: true,
    arrayState: {
      "ArrayField-6f94973722d42695d4e7b8678e7dcca5affc70df": {
        items: [
          {
            _originalIndex: 0,
            _arrayId: "ArrayItem-46a064dbef49e8441afd782b10320b74f27f8bcb",
          },
          {
            _originalIndex: 1,
            _arrayId: "ArrayItem-5d99e3a7721edad0d127c9a6b010a37097dad610",
          },
          {
            _originalIndex: 2,
            _arrayId: "ArrayItem-222ea8b444fa799a8863eb32d057f3080ec99c65",
          },
        ],
        openId: "",
      },
    },
    itemSelector: { index: 0, zone: "default-zone" },
    componentList: {},
  },
};

const mockedAppStateArray2: AppState = {
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
  ui: {
    leftSideBarVisible: true,
    rightSideBarVisible: true,
    arrayState: {
      "ArrayField-6f94973722d42695d4e7b8678e7dcca5affc70df": {
        items: [
          {
            _originalIndex: 0,
            _arrayId: "ArrayItem-5d99e3a7721edad0d127c9a6b010a37097dad610",
          },
          {
            _originalIndex: 1,
            _arrayId: "ArrayItem-222ea8b444fa799a8863eb32d057f3080ec99c65",
          },
          {
            _originalIndex: 2,
            _arrayId: "ArrayItem-46a064dbef49e8441afd782b10320b74f27f8bcb",
          },
        ],
        openId: "",
      },
    },
    itemSelector: { index: 0, zone: "default-zone" },
    componentList: {},
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
      snapshot: mockedAppState1,
      newSnapshot: mockedAppState2,
      dispatch: mockDispatch,
      record,
    });

    // Rewind last history
    histories[histories.length - 1].rewind();

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "set",
      state: mockedAppState1,
    });
  });

  it("fast-forwards a diff correctly", () => {
    const histories: { rewind: () => void; forward: () => void }[] = [];
    const record = (history) => {
      histories.push(history);
    };

    _recordHistory({
      snapshot: mockedAppState1,
      newSnapshot: mockedAppState2,
      dispatch: mockDispatch,
      record,
    });

    histories[histories.length - 1].forward();

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "set",
      state: mockedAppState2,
    });
  });

  it("rewinds an array diff correctly", () => {
    const histories: any[] = [];
    const record = (history) => histories.push(history);

    _recordHistory({
      snapshot: mockedAppStateArray1,
      newSnapshot: mockedAppStateArray2,
      dispatch: mockDispatch,
      record,
    });

    // Rewind last history
    histories[histories.length - 1].rewind();

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "set",
      state: mockedAppStateArray1,
    });
  });

  it("fast-forwards a diff correctly", () => {
    const histories: any[] = [];
    const record = (history) => histories.push(history);

    _recordHistory({
      snapshot: mockedAppStateArray1,
      newSnapshot: mockedAppStateArray2,
      dispatch: mockDispatch,
      record,
    });

    histories[histories.length - 1].forward();

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "set",
      state: mockedAppStateArray2,
    });
  });
});
