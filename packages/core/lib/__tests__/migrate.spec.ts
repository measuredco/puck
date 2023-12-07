import { migrate } from "../migrate";

jest.spyOn(console, "warn").mockImplementation(() => {});

describe("migrate method", () => {
  it("should migrate root to root.props", () => {
    expect(migrate({ content: [], root: { title: "Hello, world" } })).toEqual({
      content: [],
      root: { props: { title: "Hello, world" } },
    });
  });
});
