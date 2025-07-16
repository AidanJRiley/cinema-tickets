import { describe, it, vi, expect, afterEach, beforeEach } from "vitest";
import TicketService from "../src/pairtest/TicketService.js";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest.js";
import SeatReservationService from "../src/thirdparty/seatbooking/SeatReservationService.js";
import TicketPaymentService from "../src/thirdparty/paymentgateway/TicketPaymentService.js";
import { ticketTypes } from "../src/constants/ticketTypes.js";
import InvalidPurchaseException from "../src/pairtest/lib/InvalidPurchaseException.js";
import { MAX_TICKETS_PER_PURCHASE } from "../src/constants/rules.js";
import { ERROR_MESSAGES } from "../src/constants/errorMessages.js";

// Mock external services
vi.mock("../src/thirdparty/paymentgateway/TicketPaymentService.js", () => ({
  default: vi.fn(() => ({
    makePayment: vi.fn(),
  })),
}));
vi.mock("../src/thirdparty/seatbooking/SeatReservationService.js", () => ({
  default: vi.fn(() => ({
    reserveSeat: vi.fn(),
  })),
}));

// Common test setup
let ticketService;
let accountId;
beforeEach(() => {
  ticketService = new TicketService();
  accountId = 1;
});

// Restores mocks after each test
afterEach(() => {
  vi.restoreAllMocks();
});

describe("External services are being mocked correctly", () => {
  it("should return the mocked return value for TicketPaymentService.makePayment", () => {
    const numberOfTickets = 2;
    const ticketType = "ADULT";
    const totalCostOfTicket = ticketTypes[ticketType].price * numberOfTickets;

    ticketService.purchaseTickets(
      accountId,
      new TicketTypeRequest(ticketType, numberOfTickets),
    );

    const paymentServiceInstance = TicketPaymentService.mock.results[0].value;

    expect(paymentServiceInstance.makePayment).toHaveBeenCalledWith(
      accountId,
      totalCostOfTicket,
    );
    expect(paymentServiceInstance.makePayment).toHaveBeenCalledTimes(1);
  });
  it("should return the mocked return value for SeatReservationService.reserveSeat", () => {
    const numberOfTickets = 3;
    const ticketType = "ADULT";

    ticketService.purchaseTickets(
      accountId,
      new TicketTypeRequest(ticketType, numberOfTickets),
    );

    const seatServiceInstance = SeatReservationService.mock.results[0].value;

    expect(seatServiceInstance.reserveSeat).toHaveBeenCalledWith(
      accountId,
      numberOfTickets,
    );
    expect(seatServiceInstance.reserveSeat).toHaveBeenCalledTimes(1);
  });
});

describe("When calls to external services fail", () => {
  it("should throw an error if SeatReservationService.reserveSeat fails", () => {
    const error = new Error("Seat reservation failed");

    // Mock reserveSeat to throw
    SeatReservationService.mockImplementation(() => {
      return {
        reserveSeat: () => {
          throw error;
        },
      };
    });

    const ticketRequestMock = {
      getTicketType: () => "ADULT",
      getNoOfTickets: () => 1,
    };

    expect(() =>
      ticketService.purchaseTickets(accountId, ticketRequestMock),
    ).toThrow(error);
  });

  it("should throw an error if TicketPaymentService.makePayment fails", () => {
    const error = new Error("Payment failed");

    SeatReservationService.mockImplementation(() => {
      return {
        reserveSeat: () => {},
      };
    });

    TicketPaymentService.mockImplementation(() => {
      return {
        makePayment: () => {
          throw error;
        },
      };
    });

    const ticketRequestMock = {
      getTicketType: () => "ADULT",
      getNoOfTickets: () => 1,
    };

    expect(() =>
      ticketService.purchaseTickets(accountId, ticketRequestMock),
    ).toThrow(error);
  });
});

describe("TicketService purchaseTickets happy path", () => {
  it("processes a valid purchase with adult ticket type", () => {
    ticketService.purchaseTickets(accountId, new TicketTypeRequest("ADULT", 2));

    // expected values
    const totalSeats = 2;
    const totalPrice = 2 * ticketTypes.ADULT.price;

    const seatServiceInstance = SeatReservationService.mock.results[0].value;
    const paymentServiceInstance = TicketPaymentService.mock.results[0].value;

    expect(seatServiceInstance.reserveSeat).toHaveBeenCalledWith(
      accountId,
      totalSeats,
    );
    expect(paymentServiceInstance.makePayment).toHaveBeenCalledWith(
      accountId,
      totalPrice,
    );

    expect(seatServiceInstance.reserveSeat).toHaveBeenCalledTimes(1);
    expect(paymentServiceInstance.makePayment).toHaveBeenCalledTimes(1);
  });
  it("processes a valid purchase with adult and children ticket types", () => {
    ticketService.purchaseTickets(
      accountId,
      new TicketTypeRequest("ADULT", 2),
      new TicketTypeRequest("CHILD", 3),
    );

    // expected values
    const totalSeats = 2 + 3;
    const totalPrice =
      2 * ticketTypes.ADULT.price + 3 * ticketTypes.CHILD.price;

    const seatServiceInstance = SeatReservationService.mock.results[0].value;
    const paymentServiceInstance = TicketPaymentService.mock.results[0].value;

    expect(seatServiceInstance.reserveSeat).toHaveBeenCalledWith(
      accountId,
      totalSeats,
    );
    expect(paymentServiceInstance.makePayment).toHaveBeenCalledWith(
      accountId,
      totalPrice,
    );

    expect(seatServiceInstance.reserveSeat).toHaveBeenCalledTimes(1);
    expect(paymentServiceInstance.makePayment).toHaveBeenCalledTimes(1);
  });
  it("processes a valid purchase with adult, children and infant ticket types", () => {
    ticketService.purchaseTickets(
      accountId,
      new TicketTypeRequest("ADULT", 2),
      new TicketTypeRequest("CHILD", 3),
      new TicketTypeRequest("INFANT", 2),
    );

    // expected values
    const totalSeats = 2 + 3;
    const totalPrice =
      2 * ticketTypes.ADULT.price + 3 * ticketTypes.CHILD.price;

    const seatServiceInstance = SeatReservationService.mock.results[0].value;
    const paymentServiceInstance = TicketPaymentService.mock.results[0].value;

    expect(seatServiceInstance.reserveSeat).toHaveBeenCalledWith(
      accountId,
      totalSeats,
    );
    expect(paymentServiceInstance.makePayment).toHaveBeenCalledWith(
      accountId,
      totalPrice,
    );

    expect(seatServiceInstance.reserveSeat).toHaveBeenCalledTimes(1);
    expect(paymentServiceInstance.makePayment).toHaveBeenCalledTimes(1);
  });
});

describe("TicketService purchaseTickets correctly applies business rules", () => {
  // successful purchases
  it("does not reserve seats for infants", () => {
    ticketService.purchaseTickets(
      accountId,
      new TicketTypeRequest("ADULT", 3),
      new TicketTypeRequest("INFANT", 3),
    );

    // Expected values
    const expectedPrice =
      3 * ticketTypes.ADULT.price + 3 * ticketTypes.INFANT.price;
    const expectedSeats = 3; // Only adults and children require seats

    const seatServiceInstance = SeatReservationService.mock.results[0].value;
    const paymentServiceInstance = TicketPaymentService.mock.results[0].value;

    expect(seatServiceInstance.reserveSeat).toHaveBeenCalledWith(
      accountId,
      expectedSeats,
    );
    expect(paymentServiceInstance.makePayment).toHaveBeenCalledWith(
      accountId,
      expectedPrice,
    );
  });
  it("successfully purchases 25 tickets", () => {
    ticketService.purchaseTickets(
      accountId,
      new TicketTypeRequest("ADULT", 25),
    );

    // expected values
    const totalSeats = 25;
    const totalPrice = 25 * ticketTypes.ADULT.price;

    const seatServiceInstance = SeatReservationService.mock.results[0].value;
    const paymentServiceInstance = TicketPaymentService.mock.results[0].value;

    expect(seatServiceInstance.reserveSeat).toHaveBeenCalledWith(
      accountId,
      totalSeats,
    );
    expect(paymentServiceInstance.makePayment).toHaveBeenCalledWith(
      accountId,
      totalPrice,
    );

    expect(seatServiceInstance.reserveSeat).toHaveBeenCalledTimes(1);
    expect(paymentServiceInstance.makePayment).toHaveBeenCalledTimes(1);
  });

  // InvalidPurchaseExceptions
  it("throws an InvalidPurchaseException if accountId is invalid", () => {
    accountId = 0;
    const result = () =>
      ticketService.purchaseTickets(
        accountId,
        new TicketTypeRequest("ADULT", 1),
      );

    expect(result).toThrow(InvalidPurchaseException);
    expect(result).toThrow(ERROR_MESSAGES.INVALID_ACCOUNT_ID);
  });
  it("throws an InvalidPurchaseException if ticket type is not invalid", () => {
    // creating invalid request as creating an instance of TicketTypeRequest with an invalid ticket would fail
    const invalidRequest = {
      getTicketType: () => "KING",
      getNoOfTickets: () => 1,
    };

    const result = () =>
      ticketService.purchaseTickets(accountId, invalidRequest);

    expect(result).toThrow(InvalidPurchaseException);
    expect(result).toThrow(
      ERROR_MESSAGES.INVALID_TICKET_TYPE(invalidRequest.getTicketType()),
    );
  });
  it("throws an InvalidPurchaseException when more than the maximum tickets are requested", () => {
    const tooManyTickets = MAX_TICKETS_PER_PURCHASE + 1;

    const result = () =>
      ticketService.purchaseTickets(
        1,
        new TicketTypeRequest("ADULT", tooManyTickets),
      );

    expect(result).toThrow(InvalidPurchaseException);
    expect(result).toThrow(ERROR_MESSAGES.MAX_TICKETS_EXCEEDED);
  });

  it("throws an InvalidPurchaseException when no adult tickets are requested", () => {
    const result = () =>
      ticketService.purchaseTickets(
        1,
        new TicketTypeRequest("CHILD", 1),
        new TicketTypeRequest("INFANT", 1),
      );

    expect(result).toThrow(InvalidPurchaseException);
    expect(result).toThrow(ERROR_MESSAGES.MUST_HAVE_AT_LEAST_ONE_ADULT);
  });
  it("throws InvalidPurchaseException if no ticket requests are passed", () => {
    const result = () => ticketService.purchaseTickets(accountId);
    expect(result).toThrow(InvalidPurchaseException);
    expect(result).toThrow(ERROR_MESSAGES.MUST_HAVE_AT_LEAST_ONE_ADULT);
  });
  it("throws an InvalidPurchaseException if there are more infant than adult tickets requested", () => {
    const result = () =>
      ticketService.purchaseTickets(
        accountId,
        new TicketTypeRequest("ADULT", 2),
        new TicketTypeRequest("INFANT", 3),
      );

    expect(result).toThrow(InvalidPurchaseException);
    expect(result).toThrow(ERROR_MESSAGES.INFANTS_MUST_HAVE_ADULTS);
  });
  it("throws an InvalidPurchaseException if zero tickets are requested", () => {
    const result = () =>
      ticketService.purchaseTickets(1, new TicketTypeRequest("ADULT", 0));
    expect(result).toThrow(InvalidPurchaseException);
    expect(result).toThrow(ERROR_MESSAGES.TICKET_COUNT_MUST_BE_POSITIVE);
  });

  it("throws an InvalidPurchaseException if a negative number of tickets is requested", () => {
    const result = () =>
      ticketService.purchaseTickets(1, new TicketTypeRequest("ADULT", -1));
    expect(result).toThrow(InvalidPurchaseException);
    expect(result).toThrow(ERROR_MESSAGES.TICKET_COUNT_MUST_BE_POSITIVE);
  });
  it("throws an InvalidPurchaseException if the same ticket type is processed twice", () => {
    const result = () => {
      ticketService.purchaseTickets(
        accountId,
        new TicketTypeRequest("ADULT", 1),
        new TicketTypeRequest("ADULT", 2),
      );
    };
    expect(result).toThrow(InvalidPurchaseException);
    expect(result).toThrow(ERROR_MESSAGES.TICKET_TYPE_ALREADY_PROCESSED);
  });
  it("throws an InvalidPurchaseException if the total price is not an integer", () => {
    const originalPrice = ticketTypes.ADULT.price;
    ticketTypes.ADULT.price = 12.5;

    const result = () =>
      ticketService.purchaseTickets(
        accountId,
        new TicketTypeRequest("ADULT", 1),
      );

    expect(result).toThrow(InvalidPurchaseException);
    expect(result).toThrow(ERROR_MESSAGES.PRICE_MUST_BE_INTEGER);

    ticketTypes.ADULT.price = originalPrice; // Reset after test
  });
});
