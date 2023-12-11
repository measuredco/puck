import { ReactNode } from "react";
import { loadOverrides } from "../load-overrides";

describe("load-overrides", () => {
  it("should curry the overrides for any given override", () => {
    const loaded = loadOverrides({
      overrides: {
        header: ({ children }) => `${children} | 1` as any,
      },
      plugins: [
        {
          overrides: {
            header: ({ children }) => `${children} | 2` as any,
          },
        },
        {
          overrides: {
            header: ({ children }) => `${children} | 3` as any,
          },
        },
      ],
    });

    expect(loaded.header!({ actions: "", children: "0" })).toBe(
      "0 | 1 | 2 | 3"
    );
  });

  it("should curry the overrides for fieldTypes", () => {
    const loaded = loadOverrides({
      overrides: {
        fieldTypes: { text: ({ children }) => `${children} | 1` as any },
      },
      plugins: [
        {
          overrides: {
            fieldTypes: { text: ({ children }) => `${children} | 2` as any },
          },
        },
        {
          overrides: {
            fieldTypes: { text: ({ children }) => `${children} | 3` as any },
          },
        },
      ],
    });

    expect(loaded.fieldTypes!.text!({ children: "0" } as any)).toBe(
      "0 | 1 | 2 | 3"
    );
  });
});
