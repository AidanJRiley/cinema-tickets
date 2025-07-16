# Ticketing System

A Node.js service for purchasing cinema tickets, including business rule validation and third-party service integration.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Constants](#constants)
- [Testing](#testing)
- [Logging](#logging)
- [Linting](#linting)

---
## Requirements

- Node.js >= 20.9.0
---

## Installation

```bash
git clone https://github.com/yourname/ticketing-service.git
cd cinema-tickets/cinema-tickets-javascript
npm install
```

---

## Usage

Run the app:

```bash
node app.js
```

Example usage in code:

```js
import TicketService from './TicketService.js';
import TicketTypeRequest from './TicketTypeRequest.js';

const service = new TicketService();
const accountId = 1
service.purchaseTickets(
    accountId, 
    new TicketTypeRequest('ADULT', 3),
    new TicketTypeRequest('CHILD', 2),
    new TicketTypeRequest('INFANT', 1)
);
```

---

## Configuration

Create a `.env` file in the root directory:

```env
LOG_LEVEL=debug
```

You can adjust the log level as needed, using the following values:
- `error`
- `warn`
- `info`
- `debug`

It defaults to 'info' if no LOG_LEVEL is set.

---
## Constants

Business rules and ticket configurations are defined in `src/constants/`:

- `ticketTypes.js`: Defines ticket types, their prices,  whether a seat is required, and if the ticket type is valid.
- `rules.js`: Defines constraints like the maximum number of tickets per purchase.
- `errorMessages.js`:  Error messages used throughout validation logic.

These constants can be modified to update pricing, add new ticket types, or adjust validation error messages.

---

## Testing

Run tests using Vitest:

```bash
npm run test
```

Check test coverage:
```bash
npm run test:coverage
```

Vitest setup and config files
- config: `vitest.config.js`
- setup: `vitest.setup.js`

The following methods are mocked in the test setup to prevent too many logs being produced.
- console.log
- console.warn
- console.error

---

## Logging

Logs are handled using Pino, with coloured output via pino-pretty.

Configure the log level through `.env` as shown above.

Example output:
```
[12:01:24.634] INFO: purchaseTickets: attempting to purchase tickets for account 1
[12:01:24.635] DEBUG: getTotalPrice: calculating the total price
```

---
## Linting

This project uses ESLint with recommended JavaScript rules.

Config file can be found here: `eslint.config.js`

linting can be run with: `npm run lint`
