import { renderHook } from "@testing-library/react";
import { useActionHistory } from "../use-action-history";

test("test", () => {
  const { result } = renderHook(() => useActionHistory());
  expect(result.current.histories).toEqual([]);
});
