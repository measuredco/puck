// puck is behaving weirdly between loaders/actions, so this is a workaround assuers that the path is always correct
export function getPuckPath({
  params,
  request,
}: {
  params: any;
  request: Request;
}) {
  let referer = request.headers.get("referer") || "http://localhost:3000";
  let puckPath =
    params.puckPath || new URL(referer).pathname.replace("/edit", "");

  // Get path, and default to slash for root path.
  if (!puckPath) puckPath = "/";

  return puckPath;
}
