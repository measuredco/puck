import { Config, UserGenerics } from "../types";
import { flattenAllSlots } from "./flatten-slots";

export const flattenData = <
  UserConfig extends Config = Config,
  G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>
>(
  data: G["UserData"]
) => {
  const slots = flattenAllSlots(data);
  const slotsAndZones = {
    ...(data.zones || {}),
    ...slots,
  } as Record<string, G["UserData"]["content"]>;

  return Object.keys(slotsAndZones).reduce<G["UserComponentData"][]>(
    (acc, zone) => [...acc, ...slotsAndZones[zone]],
    data.content
  );
};
