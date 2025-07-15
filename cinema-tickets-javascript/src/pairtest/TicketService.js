import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import { ticketTypes } from "./constants/ticketTypes.js";
import { MAX_TICKETS_PER_PURCHASE } from "./constants/rules.js";
import { ERROR_MESSAGES } from "./constants/errorMessages.js";

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {
    if (!this.#isAccountValid(accountId)) {
      throw new InvalidPurchaseException(ERROR_MESSAGES.INVALID_ACCOUNT_ID);
    }

    const ticketTypeCounts = this.#processTicketRequests(ticketTypeRequests);

    this.#validateBusinessRules(ticketTypeCounts);

    const totalSeatsRequired = this.#getNumberOfSeatsRequired(ticketTypeCounts);
    const totalPrice = this.#getTotalPrice(ticketTypeCounts);

    try {
      new SeatReservationService().reserveSeat(accountId, totalSeatsRequired);
      new TicketPaymentService().makePayment(accountId, totalPrice);
    } catch (err) {
      console.error("Failed to complete purchase:", err);
      throw err;
    }

    this.#logPurchaseSummary(ticketTypeCounts, totalSeatsRequired, totalPrice);
  }

  #isAccountValid(accountId) {
    return Number(accountId) > 0;
  }

  #processTicketRequests(ticketRequests) {
    const processedTicketTypes = new Set();
    const count = this.#getCountFromValidTicketTypes();

    ticketRequests.forEach((ticketRequest) => {
      const ticketType = ticketRequest.getTicketType();
      const numberOfTickets = ticketRequest.getNoOfTickets();

      if (!ticketTypes[ticketType]) {
        throw new InvalidPurchaseException(
          ERROR_MESSAGES.INVALID_TICKET_TYPE(ticketType),
        );
      }

      if (processedTicketTypes.has(ticketType)) {
        throw new InvalidPurchaseException(
          ERROR_MESSAGES.TICKET_TYPE_ALREADY_PROCESSED,
        );
      }

      if (numberOfTickets < 1) {
        throw new InvalidPurchaseException(
          ERROR_MESSAGES.TICKET_COUNT_MUST_BE_POSITIVE,
        );
      }

      count[ticketType] = numberOfTickets;
      processedTicketTypes.add(ticketType);
    });

    return count;
  }

  #validateBusinessRules(counts) {
    // There must be at least one adult ticket purchased
    if (counts.ADULT < 1) {
      throw new InvalidPurchaseException(
        ERROR_MESSAGES.MUST_HAVE_AT_LEAST_ONE_ADULT,
      );
    }

    // Infants sit on adults knee, therefore the number of adults must not be less than the number of infants
    if (counts.INFANT > counts.ADULT) {
      throw new InvalidPurchaseException(
        ERROR_MESSAGES.INFANTS_MUST_HAVE_ADULTS,
      );
    }

    // Maximum number of tickets that can be requested at once
    const total = this.#getTotalTicketCount(counts);
    if (total > MAX_TICKETS_PER_PURCHASE) {
      throw new InvalidPurchaseException(ERROR_MESSAGES.MAX_TICKETS_EXCEEDED);
    }
  }

  #getNumberOfSeatsRequired(totalTickets) {
    let seats = 0;
    Object.entries(totalTickets).forEach(([key, value]) => {
      if (ticketTypes[key].seatRequired) seats += value;
    });

    return seats;
  }

  #getTotalTicketCount(counts) {
    return Object.values(counts).reduce((sum, val) => sum + val, 0);
  }

  #getTotalPrice(totalTickets) {
    let price = 0;
    Object.keys(totalTickets).forEach((key) => {
      price += totalTickets[key] * ticketTypes[key].price;
    });

    return price;
  }

  #getCountFromValidTicketTypes() {
    return Object.fromEntries(
      Object.keys(ticketTypes)
        .filter((type) => ticketTypes[type].isValid)
        .map((type) => [type, 0]),
    );
  }

  #logPurchaseSummary(ticketTypeCounts, totalSeatsRequired, totalPrice) {
    console.log(`Request Summary
  Number of Tickets: ${this.#getTotalTicketCount(ticketTypeCounts)}
  Number of Seats Reserved: ${totalSeatsRequired}
  Total Price: £${totalPrice.toFixed(2)}`);
  }
}
