import { rootDroppableId } from "../../../lib/root-droppable-id";
import {
  defaultState,
  dzZoneCompound,
  expectIndexed,
  testSetup,
} from "../__helpers__";

describe("Reducer", () => {
  const { executeSequence } = testSetup();

  describe("replace action", () => {
    describe("with DropZones", () => {
      it("should replace in content", () => {
        const newState = executeSequence(defaultState, [
          () => ({
            type: "insert",
            componentType: "Comp",
            destinationZone: rootDroppableId,
            destinationIndex: 0,
            id: "1",
          }),
          () => ({
            type: "replace",
            destinationZone: rootDroppableId,
            destinationIndex: 0,
            data: {
              type: "Comp",
              props: {
                id: "1",
                prop: "Changed",
              },
            },
          }),
        ]);

        expect(newState.data.content.length).toBe(1);
        expect(newState.data.content[0].props.prop).toBe("Changed");
        expectIndexed(newState, newState.data.content[0], [rootDroppableId], 0);
      });

      it("should replace in a zone", () => {
        const newState = executeSequence(defaultState, [
          () => ({
            type: "insert",
            componentType: "Comp",
            destinationZone: dzZoneCompound,
            destinationIndex: 0,
            id: "1",
          }),
          () => ({
            type: "replace",
            destinationZone: dzZoneCompound,
            destinationIndex: 0,
            data: {
              type: "Comp",
              props: {
                id: "1",
                prop: "Changed",
              },
            },
          }),
        ]);

        expect(newState.data.zones?.[dzZoneCompound].length).toBe(1);
        expect(newState.data.zones?.[dzZoneCompound][0].props.prop).toBe(
          "Changed"
        );
        expectIndexed(newState, newState.data.content[0], [rootDroppableId], 0);
      });
    });

    describe("with slots", () => {
      it("should replace in deep slots", () => {
        const newState = executeSequence(defaultState, [
          () => ({
            type: "insert",
            componentType: "Comp",
            destinationZone: "root:slot",
            destinationIndex: 0,
            id: "1",
          }),
          () => ({
            type: "replace",
            destinationZone: "root:slot",
            destinationIndex: 0,
            data: {
              type: "CompWithDefaults",
              props: { id: "1", slot: [{ type: "Comp", props: {} }] },
            },
          }),
        ]);

        const item = newState.data.root.props?.slot[0];

        expect(newState.data.root.props?.slot.length).toBe(1);
        expect(item?.props.id).toBe("1");
        expect(item?.props.slot[0].props.id).toBe("mockId-2");
        expectIndexed(newState, item, ["root:slot"], 0);
      });
    });
  });
});
