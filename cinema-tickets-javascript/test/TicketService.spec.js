import {describe, it, vi, expect, afterEach} from "vitest";
import TicketService from "../src/pairtest/TicketService.js";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest.js";
import SeatReservationService from "../src/thirdparty/seatbooking/SeatReservationService.js";
import TicketPaymentService from "../src/thirdparty/paymentgateway/TicketPaymentService.js";
import {ticketTypes} from "../src/pairtest/constants/ticketTypes.js";
import InvalidPurchaseException from "../src/pairtest/lib/InvalidPurchaseException.js";

// Mock external services
vi.mock('../src/thirdparty/paymentgateway/TicketPaymentService.js', () => ({
    default: vi.fn(() => ({
        makePayment: vi.fn()
    }))
}))
vi.mock('../src/thirdparty/seatbooking/SeatReservationService.js', () => ({
    default: vi.fn(() => ({
        reserveSeat: vi.fn()
    }))
}))

// restores mocks after each test
afterEach(() => {
    vi.restoreAllMocks();
});

describe('External services are being mocked correctly', () => {
    it("should return the mocked return value for TicketPaymentService.makePayment", () => {
        const accountId = 1
        const numberOfTickets = 2
        const ticketType = "ADULT"
        const totalCostOfTicket = ticketTypes[ticketType].price * numberOfTickets

        const ticketService = new TicketService();

        ticketService.purchaseTickets(accountId, new TicketTypeRequest(ticketType, numberOfTickets));

        const paymentServiceInstance = TicketPaymentService.mock.results[0].value;

        expect(paymentServiceInstance.makePayment).toHaveBeenCalledWith(accountId, totalCostOfTicket);
        expect(paymentServiceInstance.makePayment).toHaveBeenCalledTimes(1);
    });
    it("should return the mocked return value for SeatReservationService.reserveSeat", () => {
        const accountId = 1
        const numberOfTickets = 3
        const ticketType = "ADULT"

        const ticketService = new TicketService();

        ticketService.purchaseTickets(accountId, new TicketTypeRequest(ticketType, numberOfTickets));

        const seatServiceInstance = SeatReservationService.mock.results[0].value;

        expect(seatServiceInstance.reserveSeat).toHaveBeenCalledWith(accountId, numberOfTickets);
        expect(seatServiceInstance.reserveSeat).toHaveBeenCalledTimes(1);
    });
})

describe('TicketService purchaseTickets happy path', () => {
    it('processes a valid purchase with adult ticket type', () => {
        const accountId = 1;
        const ticketService = new TicketService();

        ticketService.purchaseTickets(
            accountId,
            new TicketTypeRequest('ADULT', 2),
        );

        // expected values
        const totalSeats = 2;
        const totalPrice = 2 * ticketTypes.ADULT.price

        const seatServiceInstance = SeatReservationService.mock.results[0].value;
        const paymentServiceInstance = TicketPaymentService.mock.results[0].value;

        expect(seatServiceInstance.reserveSeat).toHaveBeenCalledWith(accountId, totalSeats);
        expect(paymentServiceInstance.makePayment).toHaveBeenCalledWith(accountId, totalPrice);

        expect(seatServiceInstance.reserveSeat).toHaveBeenCalledTimes(1);
        expect(paymentServiceInstance.makePayment).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledTimes(1) // Successful requests calls console.log
    });
    it('processes a valid purchase with adult and children ticket types', () => {
        const accountId = 1;
        const ticketService = new TicketService();

        ticketService.purchaseTickets(
            accountId,
            new TicketTypeRequest('ADULT', 2),
            new TicketTypeRequest('CHILD', 3)
        );

        // expected values
        const totalSeats = 2 + 3;
        const totalPrice =
            2 * ticketTypes.ADULT.price +
            3 * ticketTypes.CHILD.price;

        const seatServiceInstance = SeatReservationService.mock.results[0].value;
        const paymentServiceInstance = TicketPaymentService.mock.results[0].value;

        expect(seatServiceInstance.reserveSeat).toHaveBeenCalledWith(accountId, totalSeats);
        expect(paymentServiceInstance.makePayment).toHaveBeenCalledWith(accountId, totalPrice);

        expect(seatServiceInstance.reserveSeat).toHaveBeenCalledTimes(1);
        expect(paymentServiceInstance.makePayment).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledTimes(1) // Successful requests calls console.log
    });
    it('processes a valid purchase with adult, children and infant ticket types', () => {
        const accountId = 1;
        const ticketService = new TicketService();

        ticketService.purchaseTickets(
            accountId,
            new TicketTypeRequest('ADULT', 2),
            new TicketTypeRequest('CHILD', 3),
            new TicketTypeRequest('INFANT', 2)
        );

        // expected values
        const totalSeats = 2 + 3;
        const totalPrice =
            2 * ticketTypes.ADULT.price +
            3 * ticketTypes.CHILD.price;

        const seatServiceInstance = SeatReservationService.mock.results[0].value;
        const paymentServiceInstance = TicketPaymentService.mock.results[0].value;

        expect(seatServiceInstance.reserveSeat).toHaveBeenCalledWith(accountId, totalSeats);
        expect(paymentServiceInstance.makePayment).toHaveBeenCalledWith(accountId, totalPrice);

        expect(seatServiceInstance.reserveSeat).toHaveBeenCalledTimes(1);
        expect(paymentServiceInstance.makePayment).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledTimes(1) // Successful requests calls console.log
    });
});

describe('TicketService purchaseTickets correctly applies business rules', ()=>{
    // successful purchases
    it('does not reserve seats for infants', () => {
        const accountId = 1;
        const ticketService = new TicketService();

        ticketService.purchaseTickets(
            accountId,
            new TicketTypeRequest('ADULT', 3),
            new TicketTypeRequest('INFANT', 3)
        );

        // Expected values
        const expectedPrice =
            3 * ticketTypes.ADULT.price +
            3 * ticketTypes.INFANT.price;
        const expectedSeats = 3 // Only adults and children require seats

        const seatServiceInstance = SeatReservationService.mock.results[0].value;
        const paymentServiceInstance = TicketPaymentService.mock.results[0].value;

        expect(seatServiceInstance.reserveSeat).toHaveBeenCalledWith(accountId, expectedSeats);
        expect(paymentServiceInstance.makePayment).toHaveBeenCalledWith(accountId, expectedPrice);
    });
    it('successfully purchases 25 tickets', ()=>{
        const accountId = 1;
        const ticketService = new TicketService();

        ticketService.purchaseTickets(accountId, new TicketTypeRequest('ADULT', 25));

        // expected values
        const totalSeats = 25;
        const totalPrice = 25 * ticketTypes.ADULT.price

        const seatServiceInstance = SeatReservationService.mock.results[0].value;
        const paymentServiceInstance = TicketPaymentService.mock.results[0].value;

        expect(seatServiceInstance.reserveSeat).toHaveBeenCalledWith(accountId, totalSeats);
        expect(paymentServiceInstance.makePayment).toHaveBeenCalledWith(accountId, totalPrice);

        expect(seatServiceInstance.reserveSeat).toHaveBeenCalledTimes(1);
        expect(paymentServiceInstance.makePayment).toHaveBeenCalledTimes(1);
        expect(console.log).toHaveBeenCalledTimes(1) // Successful requests calls console.log
    })

    // InvalidPurchaseExceptions
    it('throws an InvalidPurchaseException if accountId is invalid', () => {
        const ticketService = new TicketService();

        expect(() =>
            ticketService.purchaseTickets(0, new TicketTypeRequest('ADULT', 1))
        ).toThrow(InvalidPurchaseException);

        expect(() =>
            ticketService.purchaseTickets(0, new TicketTypeRequest('ADULT', 1))
        ).toThrow("Account id must be valid");
    });
    it('throws an InvalidPurchaseException when more than 25 tickets are requested', ()=>{
        const ticketService = new TicketService();

        expect(() =>
            ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 26))
        ).toThrow(InvalidPurchaseException);

        expect(() =>
            ticketService.purchaseTickets(1, new TicketTypeRequest('ADULT', 26))
        ).toThrow("A maximum of 25 tickets can be purchased at once");
    })
    it('throws an InvalidPurchaseException when no adult tickets are requested', ()=>{
        const ticketService = new TicketService();

        expect(() =>
            ticketService.purchaseTickets(
                1,
                new TicketTypeRequest('CHILD', 1),
                new TicketTypeRequest('INFANT', 1),
        )
        ).toThrow(InvalidPurchaseException);

        expect(() =>
            ticketService.purchaseTickets(
                1,
                new TicketTypeRequest('CHILD', 1),
                new TicketTypeRequest('INFANT', 1),
        )
        ).toThrow('At least one adult ticket must be purchased');
    })
    it('throws an InvalidPurchaseException if there are more infant than adult tickets requested', ()=>{
        const accountId = 1;
        const ticketService = new TicketService();

        expect(() =>
            ticketService.purchaseTickets(
                accountId,
                new TicketTypeRequest('ADULT', 2),
                new TicketTypeRequest('INFANT', 3),
            )
        ).toThrow(InvalidPurchaseException);

        expect(() =>
            ticketService.purchaseTickets(
                accountId,
                new TicketTypeRequest('ADULT', 2),
                new TicketTypeRequest('INFANT', 3),
            )
        ).toThrow('Each infant must be accompanied by one adult');


    })
    it('throws an InvalidPurchaseException if an invalid number of tickets is requested', ()=>{
        const accountId = 1;
        const ticketService = new TicketService();

        expect(() =>
            ticketService.purchaseTickets(
                accountId,
                new TicketTypeRequest('ADULT', 0),
            )
        ).toThrow(InvalidPurchaseException);

        expect(() =>
            ticketService.purchaseTickets(
                accountId,
                new TicketTypeRequest('ADULT', 0),
            )
        ).toThrow('Number of tickets must be greater than zero');

        expect(() =>
            ticketService.purchaseTickets(
                1,
                new TicketTypeRequest('ADULT', -1),
            )
        ).toThrow('Number of tickets must be greater than zero');
    })
    it('throws an InvalidPurchaseException if the same ticket type is processed twice', () => {
        const accountId = 1;
        const ticketService = new TicketService();
        expect(() => {
            ticketService.purchaseTickets(accountId, new TicketTypeRequest('ADULT', 1), new TicketTypeRequest('ADULT', 2));
        }).toThrow(InvalidPurchaseException);

        expect(() => {
            ticketService.purchaseTickets(accountId, new TicketTypeRequest('ADULT', 1), new TicketTypeRequest('ADULT', 2));
        }).toThrow('Ticket type already processed');
    });
})
