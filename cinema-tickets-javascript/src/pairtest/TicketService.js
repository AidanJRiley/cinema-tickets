import InvalidPurchaseException from "./lib/InvalidPurchaseException.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import { ticketTypes } from "../constants/ticketTypes.js";
import { MAX_TICKETS_PER_PURCHASE } from "../constants/rules.js";
import { ERROR_MESSAGES } from "../constants/errorMessages.js";
import { logger } from "../utils/logger.js";

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {
    logger.info(
      "purchaseTickets: attempting to purchase tickets for account " +
        accountId,
    );

    if (!this.#isAccountValid(accountId)) {
      throw new InvalidPurchaseException(ERROR_MESSAGES.INVALID_ACCOUNT_ID);
    }

    const ticketTypeCounts =
      this.#validateTicketRequestsAndGetCount(ticketTypeRequests);

    this.#validateBusinessRules(ticketTypeCounts);

    const totalSeatsRequired =
      this.#calculateNumberOfSeatsRequired(ticketTypeCounts);
    const totalPrice = this.#calculateTotalPrice(ticketTypeCounts);

    try {
      new SeatReservationService().reserveSeat(accountId, totalSeatsRequired);
      new TicketPaymentService().makePayment(accountId, totalPrice);
    } catch (err) {
      logger.error("Failed to complete purchase:", err);
      throw err;
    }

    this.#logPurchaseSummary(ticketTypeCounts, totalSeatsRequired, totalPrice);
  }

  #isAccountValid(accountId) {
    const isValid = Number(accountId) > 0;
    logger.debug(
      `isAccountValid: ${accountId} is ${isValid ? "valid" : "invalid"}`,
    );
    return isValid;
  }

  #validateTicketRequestsAndGetCount(ticketRequests) {
    logger.debug(
      "validateTicketRequestsAndGetCount: processing ticket requests",
    );
    const processedTicketTypes = new Set();
    const count = this.#initialiseCountFromValidTicketTypes();

    ticketRequests.forEach((ticketRequest) => {
      this.#validateTicketRequest(ticketRequest, processedTicketTypes);
      const ticketType = ticketRequest.getTicketType();
      count[ticketType] = ticketRequest.getNoOfTickets();
      processedTicketTypes.add(ticketType);
    });

    return count;
  }

  #validateTicketRequest(ticketRequest, processedTicketTypes) {
    logger.debug("validateTicketRequest: validating ticket request");
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
  }

  #validateBusinessRules(counts) {
    logger.debug(
      `validateBusinessRules: validating business rules for ticket requests`,
    );
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
    const total = this.#calculateTotalTicketCount(counts);
    if (total > MAX_TICKETS_PER_PURCHASE) {
      throw new InvalidPurchaseException(ERROR_MESSAGES.MAX_TICKETS_EXCEEDED);
    }
  }

  #calculateNumberOfSeatsRequired(totalTickets) {
    logger.debug(
      `calculateNumberOfSeatsRequired: calculating total number of seats required`,
    );
    let seats = 0;
    Object.entries(totalTickets).forEach(([key, value]) => {
      if (ticketTypes[key].seatRequired) seats += value;
    });

    return seats;
  }

  #calculateTotalTicketCount(counts) {
    logger.debug(
      `calculateTotalTicketCount: getting total tickets for requests`,
    );
    return Object.values(counts).reduce((sum, val) => sum + val, 0);
  }

  #calculateTotalPrice(totalTickets) {
    logger.debug(`calculateTotalPrice: calculating the total price`);
    let price = 0;
    Object.keys(totalTickets).forEach((key) => {
      price += totalTickets[key] * ticketTypes[key].price;
    });

    return price;
  }

  #initialiseCountFromValidTicketTypes() {
    logger.debug(
      "initialiseCountFromValidTicketTypes: getting ticket type count for valid tickets",
    );
    return Object.fromEntries(
      Object.keys(ticketTypes)
        .filter((type) => ticketTypes[type].isValid)
        .map((type) => [type, 0]),
    );
  }

  #logPurchaseSummary(ticketTypeCounts, totalSeatsRequired, totalPrice) {
    logger.info(`logPurchaseSummary
      Purchase Successful
      Number of Tickets: ${this.#calculateTotalTicketCount(ticketTypeCounts)}
      Number of Seats Reserved: ${totalSeatsRequired}
      Total Price: £${totalPrice.toFixed(2)}`);
  }
}
