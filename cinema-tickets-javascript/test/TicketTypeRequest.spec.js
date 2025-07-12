import {describe, it, expect} from "vitest";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest.js";

describe('TicketTypeRequest', () => {
    it('throws a TypeError if number of tickets is not an integer', () => {
        expect(() => new TicketTypeRequest('ADULT', 'a')).toThrow(TypeError);
        expect(() => new TicketTypeRequest('ADULT', 'a')).toThrow('noOfTickets must be an integer');

        expect(() => new TicketTypeRequest('ADULT', true)).toThrow(TypeError);
        expect(() => new TicketTypeRequest('ADULT', true)).toThrow('noOfTickets must be an integer');
    });
    it('throws a TypeError if an invalid ticket type is provided', () => {
        expect(() => new TicketTypeRequest('STUDENT', 3)).toThrow(TypeError);
        expect(() => new TicketTypeRequest('STUDENT', 3)).toThrow('type must be ADULT, CHILD, or INFANT');
    });
    it('constructs a valid TicketTypeRequest instance', () => {
        const request = new TicketTypeRequest('CHILD', 2);
        expect(request.getTicketType()).toBe('CHILD');
        expect(request.getNoOfTickets()).toBe(2);
    });
});