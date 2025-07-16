import TicketTypeRequest from "./src/pairtest/lib/TicketTypeRequest.js";
import TicketService from "./src/pairtest/TicketService.js";

const TicketServiceInstance = new TicketService();
const accountId = 1;

TicketServiceInstance.purchaseTickets(
  accountId,
  new TicketTypeRequest("ADULT", 10),
  new TicketTypeRequest("CHILD", 4),
  new TicketTypeRequest("INFANT", 3),
);
