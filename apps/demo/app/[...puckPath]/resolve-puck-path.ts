const resolvePuckPath = (
  puckPath: string[] = []
): {
  suffix: "edit" | "preview" | "";
  path: string;
} => {
  const lastPath = puckPath.length > 0 && puckPath[puckPath.length - 1];

  const suffix = lastPath === "edit" || lastPath === "preview" ? lastPath : "";

  return {
    suffix,
    path: `/${(Boolean(suffix)
      ? [...puckPath].slice(0, puckPath.length - 1)
      : puckPath
    ).join("/")}`,
  };
};

export default resolvePuckPath;
