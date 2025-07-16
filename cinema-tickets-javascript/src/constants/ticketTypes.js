// ticket prices must be an integer
export const ticketTypes = {
  ADULT: { price: 25, seatRequired: true, isValid: true },
  CHILD: { price: 15, seatRequired: true, isValid: true },
  INFANT: { price: 0, seatRequired: false, isValid: true },

  // example ticket types
  // STUDENT: { price: 20, seatRequired: true, isValid: false },
  // CONCESSION: { price: 15, seatRequired: true, isValid: false },
};

export function getValidTicketTypes() {
  return Object.keys(ticketTypes).filter(
    (ticketType) => ticketTypes[ticketType].isValid,
  );
}
