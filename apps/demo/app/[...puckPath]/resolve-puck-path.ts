const resolvePuckPath = (puckPath: string[]) => {
  const isEdit = puckPath[puckPath.length - 1] === "edit";

  return {
    isEdit,
    path: `/${(isEdit
      ? [...puckPath].slice(0, puckPath.length - 1)
      : [...puckPath]
    ).join("/")}`,
  };
};

export default resolvePuckPath;
