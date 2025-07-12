import InvalidPurchaseException from './lib/InvalidPurchaseException.js';
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import {ticketTypes} from "./constants/ticketTypes.js";

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  purchaseTickets(accountId, ...ticketTypeRequests) {
    if(!this.#isAccountValid(accountId)) {
      throw new InvalidPurchaseException("Account id must be valid");
    }

    const ticketTypeCounts = this.#processTicketRequests(ticketTypeRequests)

    this.#validateBusinessRules(ticketTypeCounts);

    const totalSeatsRequired = this.#getNumberOfSeatsRequired(ticketTypeCounts)
    const totalPrice = this.#getTotalPrice(ticketTypeCounts)

    new SeatReservationService().reserveSeat(accountId, totalSeatsRequired)
    new TicketPaymentService().makePayment(accountId, totalPrice)

    console.log(`Request Summary
    Number of Tickets: ${this.#getTotalTicketCount(ticketTypeCounts)}
    Number of Seats Reserved: ${totalSeatsRequired}
    Total Price: £${totalPrice.toFixed(2)}`);
  }

  #isAccountValid(accountId){
    return Number(accountId) > 0
  }

  #processTicketRequests(ticketRequests){
    const processedTicketTypes = new Set()
    const count = {
      "ADULT": 0,
      "CHILD": 0,
      "INFANT": 0,
    }

    ticketRequests.forEach((ticketRequest) => {
      const ticketType = ticketRequest.getTicketType();
      const numberOfTickets = ticketRequest.getNoOfTickets();

      if(processedTicketTypes.has(ticketType)) {
        throw new InvalidPurchaseException("Ticket type already processed")
      }

      if(numberOfTickets < 1){
        throw new InvalidPurchaseException("Number of tickets must be greater than zero")
      }

      count[ticketType] = numberOfTickets
      processedTicketTypes.add(ticketType)
    })

    return count
  }

  #validateBusinessRules(counts) {
    // There must be at least one adult ticket purchased
    if (counts.ADULT < 1) {
      throw new InvalidPurchaseException("At least one adult ticket must be purchased");
    }

    // Infants sit on adults knee, therefore the number of adults must not be less than the number of infants
    if (counts.INFANT > counts.ADULT) {
      throw new InvalidPurchaseException("Each infant must be accompanied by one adult");
    }

    // Maximum number of tickets that can be requested at once
    const total = this.#getTotalTicketCount(counts);
    if (total > 25) {
      throw new InvalidPurchaseException("A maximum of 25 tickets can be purchased at once");
    }
  }

  #getNumberOfSeatsRequired(totalTickets){
    let seats = 0
    Object.entries(totalTickets).forEach(([key, value]) => {
      if(ticketTypes[key].seatRequired) seats += value
    })

    return seats
  }

  #getTotalTicketCount(counts) {
    return Object.values(counts).reduce((sum, val) => sum + val, 0);
  }

  #getTotalPrice(totalTickets){
    let price = 0
    Object.keys(totalTickets).forEach((key) => {
      price += totalTickets[key] * ticketTypes[key].price
    })

    return price
  }
}
