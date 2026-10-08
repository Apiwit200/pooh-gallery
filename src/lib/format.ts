export const formatEv = (ev: number | null) =>
  ev == null ? "EV —" : `EV ${ev < 0 ? "−" : ""}${Math.abs(ev).toFixed(1)}`;
