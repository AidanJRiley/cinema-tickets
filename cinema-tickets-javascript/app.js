import TicketTypeRequest from "./src/pairtest/lib/TicketTypeRequest.js";
import TicketService from "./src/pairtest/TicketService.js";

const TicketServiceInstance = new TicketService();

try{
    TicketServiceInstance.purchaseTickets(112233,
        new TicketTypeRequest('ADULT',10),
        new TicketTypeRequest('CHILD', 4),
        new TicketTypeRequest('INFANT', 3)
    );
    console.log('Tickets Purchased Successfully');
} catch(error) {
    console.error(`Error: ${error.message}`);
}

const TicketServiceInstance2 = new TicketService();

try{
    TicketServiceInstance2.purchaseTickets(112233,
        new TicketTypeRequest('ADULT',23),
        new TicketTypeRequest('CHILD', 4),
        new TicketTypeRequest('INFANT', 3)
    );
    console.log('Tickets Purchased Successfully');
} catch(error) {
    console.error(`\nError purchasing tickets\n${error.message}`);
}