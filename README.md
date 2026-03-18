# Deposit System

CLI app for accepting empty bottles and cans and issuing refunds.

## Stack

- TypeScript + Node.js
- SQLite (`better-sqlite3`)
- Inquirer.js

## Run

```bash
npm install
npm run dev
```

## Item values

| Item           | Value | Processing rate |
|----------------|-------|-----------------|
| Plastic Bottle | 3 kr  | 1/s             |
| Aluminium Can  | 2 kr  | 0.5/s           |

## Scripts

| Command         | Description         |
|-----------------|---------------------|
| `npm run dev`   | Run in development  |
| `npm run build` | Compile to `dist/`  |
| `npm start`     | Run compiled output |
| `npm test`      | Run tests           |