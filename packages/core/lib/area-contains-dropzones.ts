import { Data } from "../types/Config";
import { findDropzonesForArea } from "./find-dropzones-for-area";

export const areaContainsDropzones = (data: Data, area: string) => {
  const dropzones = Object.keys(findDropzonesForArea(data, area));

  return dropzones.length > 0;
};
