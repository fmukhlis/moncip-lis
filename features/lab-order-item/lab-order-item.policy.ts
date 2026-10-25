export function ensureLabOrderItemHasNoActiveSpecimen(labOrderItem: {
  specimens: { endedAt: Date | null }[];
}) {
  if (labOrderItem.specimens.some(({ endedAt }) => !endedAt)) {
    throw new Error("Lab order item already has an active specimen");
  }
}
