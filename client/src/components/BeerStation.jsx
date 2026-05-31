import StationBoard from "./StationBoard";

function BeerStation() {
  return (
    <div className="h-full min-h-0">
    <StationBoard
      station="Beer"
      displayLabel="Bar Display"
      title="Beer Station"
      subtitle="Active drink tickets routed to the bar line."
      emptyEmoji="🍺"
      emptyTitle="No active bar tickets"
      preparingLabel="pouring"
    />
    </div>
  );
}

export default BeerStation;
