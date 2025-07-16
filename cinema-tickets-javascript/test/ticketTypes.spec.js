import { it, describe, expect, test } from "vitest";
import {
  getValidTicketTypes,
  ticketTypes,
} from "../src/constants/ticketTypes.js";

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
    expect(ticketTypes?.YOUNGPERSON?.price).toBeUndefined();
    expect(ticketTypes?.BABY?.price).toBeUndefined();
  });

  it("includes exactly only the valid ticket types", () => {
    const validTicketTypes = getValidTicketTypes();

    // Set explicitly to ensure the validTicketTypes is not updated in error
    expect(validTicketTypes).toHaveLength(3);
  });

  it("only allows integer prices", () => {
    const validTicketTypes = getValidTicketTypes();

    validTicketTypes.filter((ticketType) => {
      const price = ticketTypes[ticketType].price;
      expect(Number.isInteger(price)).toBe(true);
    });
  });
});

describe("ticketTypes seat requirement flags", () => {
  it("correctly specifies whether each ticket type requires a seat", () => {
    const expectedSeatRequirements = {
      ADULT: true,
      CHILD: true,
      INFANT: false,
    };

    expect(ticketTypes.ADULT.seatRequired).toEqual(
      expectedSeatRequirements.ADULT,
    );
    expect(ticketTypes.CHILD.seatRequired).toEqual(
      expectedSeatRequirements.CHILD,
    );
    expect(ticketTypes.INFANT.seatRequired).toEqual(
      expectedSeatRequirements.INFANT,
    );
  });

  it("does not define seat requirements for unsupported ticket types", () => {
    expect(ticketTypes?.ELDERLY?.seatRequired).toBeUndefined();
    expect(ticketTypes?.BABY?.seatRequired).toBeUndefined();
  });
});
