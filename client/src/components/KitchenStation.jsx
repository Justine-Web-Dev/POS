import StationBoard from "./StationBoard";

function KitchenStation() {
  return (
    <StationBoard
      station="Kitchen"
      displayLabel="Kitchen Display"
      title="Kitchen Station"
      subtitle="Active food tickets routed to the kitchen line."
      emptyEmoji="🍳"
      emptyTitle="No active kitchen tickets"
      preparingLabel="cooking"
    />
  );
}

export default KitchenStation;
