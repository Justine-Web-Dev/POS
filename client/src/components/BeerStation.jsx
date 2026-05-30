import StationBoard from "./StationBoard";

function BeerStation() {
  return (
    <StationBoard
      station="Beer"
      displayLabel="Bar Display"
      title="Beer Station"
      subtitle="Active drink tickets routed to the bar line."
      emptyEmoji="🍺"
      emptyTitle="No active bar tickets"
      preparingLabel="pouring"
    />
  );
}

export default BeerStation;
