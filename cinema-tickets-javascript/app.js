import TicketTypeRequest from "./src/pairtest/lib/TicketTypeRequest.js";
import TicketService from "./src/pairtest/TicketService.js";
import { logger } from "./src/utils/logger.js";

const TicketServiceInstance = new TicketService();

try {
  TicketServiceInstance.purchaseTickets(
    1,
    new TicketTypeRequest("ADULT", 10),
    new TicketTypeRequest("CHILD", 4),
    new TicketTypeRequest("INFANT", 3),
  );
} catch (error) {
  logger.error(`Error: ${error.message}`);
}
