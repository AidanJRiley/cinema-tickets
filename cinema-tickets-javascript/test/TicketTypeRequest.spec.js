import { describe, it, expect } from "vitest";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest.js";
import { ERROR_MESSAGES } from "../src/pairtest/constants/errorMessages.js";

describe("TicketTypeRequest", () => {
  it("throws a TypeError if number of tickets input is a string", () => {
    const result = () => new TicketTypeRequest("ADULT", "a");
    expect(result).toThrowError(
      new TypeError(ERROR_MESSAGES.NO_OF_TICKETS_INTEGER),
    );
  });

  it("throws a TypeError if number of tickets input is a boolean", () => {
    const result = () => new TicketTypeRequest("ADULT", true);
    expect(result).toThrowError(
      new TypeError(ERROR_MESSAGES.NO_OF_TICKETS_INTEGER),
    );
  });

  it("throws a TypeError if an invalid ticket type is provided", () => {
    const result = () => new TicketTypeRequest("ELDER", 3);
    expect(result).toThrowError(
      new TypeError(ERROR_MESSAGES.INVALID_TICKET_TYPES()),
    );
  });

  it("constructs a valid TicketTypeRequest instance", () => {
    const request = new TicketTypeRequest("CHILD", 2);
    expect(request.getTicketType()).toBe("CHILD");
    expect(request.getNoOfTickets()).toBe(2);
  });
});
