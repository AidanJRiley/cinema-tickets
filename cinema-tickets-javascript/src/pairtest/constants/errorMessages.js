import { MAX_TICKETS_PER_PURCHASE } from "./rules.js";

export const ERROR_MESSAGES = {
  INVALID_ACCOUNT_ID: "Account id must be valid",
  INVALID_TICKET_TYPE: (type) => `${type} is not a recognized ticket type`,
  TICKET_TYPE_ALREADY_PROCESSED: "Ticket type already processed",
  TICKET_COUNT_MUST_BE_POSITIVE: "Number of tickets must be greater than zero",
  MUST_HAVE_AT_LEAST_ONE_ADULT: "At least one adult ticket must be purchased",
  INFANTS_MUST_HAVE_ADULTS: "Each infant must be accompanied by one adult",
  MAX_TICKETS_EXCEEDED: `A maximum of ${MAX_TICKETS_PER_PURCHASE} tickets can be purchased at once`,
};
