import {it, describe, expect} from "vitest"
import {ticketTypes} from "../src/pairtest/constants/ticketTypes.js";

describe("ticketTypes price definitions", () => {
    it("provides the correct prices for ADULT, CHILD, and INFANT tickets", () => {
        const expectedPrices = {
            ADULT: 25,
            CHILD: 15,
            INFANT: 0,
        };

        expect(ticketTypes.ADULT.price).toEqual(expectedPrices.ADULT);
        expect(ticketTypes.CHILD.price).toEqual(expectedPrices.CHILD);
        expect(ticketTypes.INFANT.price).toEqual(expectedPrices.INFANT);
    });

    it("does not define prices for unsupported ticket types", () => {
        expect(ticketTypes?.ELDERLY?.price).toBeUndefined();
        expect(ticketTypes?.CONCESSION?.price).toBeUndefined();
        expect(ticketTypes?.BABY?.price).toBeUndefined();
    });

    it("includes exactly three ticket types", () => {
        expect(Object.keys(ticketTypes)).toHaveLength(3);
    });
});

describe("ticketTypes seat requirement flags", () => {
    it("correctly specifies whether each ticket type requires a seat", () => {
        const expectedSeatRequirements = {
            ADULT: true,
            CHILD: true,
            INFANT: false,
        };

        expect(ticketTypes.ADULT.seatRequired).toEqual(expectedSeatRequirements.ADULT);
        expect(ticketTypes.CHILD.seatRequired).toEqual(expectedSeatRequirements.CHILD);
        expect(ticketTypes.INFANT.seatRequired).toEqual(expectedSeatRequirements.INFANT);
    });

    it("does not define seat requirements for unsupported ticket types", () => {
        expect(ticketTypes?.ELDERLY?.seatRequired).toBeUndefined();
        expect(ticketTypes?.CONCESSION?.seatRequired).toBeUndefined();
        expect(ticketTypes?.BABY?.seatRequired).toBeUndefined();
    });
});
