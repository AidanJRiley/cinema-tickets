# Ticketing System

A Node.js service for purchasing cinema tickets, including business rule validation and third-party service integration.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Testing](#testing)
- [Logging](#logging)

---

## Installation

```bash
git clone https://github.com/yourname/ticketing-service.git
cd ticketing-service
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
import TicketService from './src/pairtest/TicketService.js';
import TicketTypeRequest from './src/pairtest/lib/TicketTypeRequest.js';

const service = new TicketService();
service.purchaseTickets(1, new TicketTypeRequest('ADULT', 2));
```

---

## Configuration

Create a `.env` file in the root directory:

```env
LOG_LEVEL=debug
```

You can adjust the log level as needed.

Supported values:
- `error`
- `warn`
- `info`
- `debug`

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
