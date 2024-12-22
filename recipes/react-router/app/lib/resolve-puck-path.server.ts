export function resolvePuckPath(path: string = "") {
  const url = new URL(path, "https://placeholder.com/");
  const segments = url.pathname.split("/");
  const isEditorRoute = segments.at(-1) === "edit";
  const pathname = isEditorRoute
    ? segments.slice(0, -1).join("/")
    : url.pathname;

  return {
    isEditorRoute,
    path: new URL(pathname, "https://placeholder.com/").pathname,
  };
}
