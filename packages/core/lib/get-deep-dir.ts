type Dir = "ltr" | "rtl";

export function getDeepDir(el: Element | null | undefined) {
  function findDir(node: Element | null): Dir {
    if (!node) return "ltr";

    const d = node.getAttribute("dir") as Dir | "";

    return d || findDir(node.parentElement);
  }

  return el ? findDir(el) : "ltr";
}
