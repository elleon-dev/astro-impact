import { defaultFirestoreProps } from "../../utils";
import { addRepair, getRepairId } from "../../collections";

export const createRepair = async (repair: Repair): Promise<void> => {
  const { assignCreateProps } = defaultFirestoreProps();
  const repairId = getRepairId();

  await addRepair(assignCreateProps({ ...repair, id: repairId }));
};
