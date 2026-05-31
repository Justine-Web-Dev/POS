import StationBoard from "./StationBoard";

function KitchenStation() {
  return (
    <div className="h-full min-h-0">
    <StationBoard
      station="Kitchen"
      displayLabel="Kitchen Display"
      title="Kitchen Station"
      subtitle="Active food tickets routed to the kitchen line."
      emptyEmoji="🍳"
      emptyTitle="No active kitchen tickets"
      preparingLabel="cooking"
    />
    </div>
  );
}

export default KitchenStation;
