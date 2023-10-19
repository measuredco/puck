# next-puck

> **⚠️ This package is experimental and not yet suitable for most use-cases.**

`next-puck` provides a CLI and utils for Puck-powered websites running on Next.js 13.

It provides:

- a CLI for generating Puck routes inside your Next.js App Router
- helper utils for Next.js, including the Puck middleware

Next.js apps using `next-puck` feature:

- **A static catch-all route**: render all Puck pages using incremental static regeneration
- **A magic /edit route**: put `/edit` on the end of any URL to launch the Puck editor
- **Route upgrades**: a mechanism to upgrade your routes to the latest best practices

To use next-puck, you'll probably want to use the `next-zero` recipe.

## CLI

### How the CLI works

`next-puck` leverages file-based routing copying additional routes into your `/app` directory each time you run the application. These files are added to `.gitignore`.

### Ejecting from next-puck

You can eject at any time by removing `next-puck` routes from your `.gitignore`, but you will stop receiving route upgrades.

### Creating a new project

The best way to use `next-puck` in a new project is via the [`next-zero` recipe](https://github.com/measuredco/puck/tree/main/recipes/next-zero).

### Adding to an existing project

If you're adding to an existing project, install it:

```sh
npm i next-puck -D
```

Generate initial files and update your `.gitignore`:

```sh
next-puck setup
```

Call `next-puck generate` before you call your `next` commands in package.json :

```sh
next-puck generate && next dev
```

## Configuration

`next-puck` exposes a config file and adds a middleware:

- `next-puck.config.tsx` - describes how to read / write your data
- `puck.config.tsx` - describes your Puck configuration
- `middleware.ts` - the Next.js middleware, which handles the magic `/edit` route.

#### next-puck Config Reference

By default, your generated `next-puck.config.tsx` will read and write to a `database.json`.

- **readPageServer** (`(path: string) => Data | null`): Read your page data from your database. Only called on the server.
- **writePageServer** (`(request: Request) => void`, optional): Write your page data to your database. Only called on the server.

### Adding authentication

You're responsible for implementing an authentication flow that makes sense for your stack.

Once you've added authentication, you can restrict access to the `/edit` URL by modifying `middleware.ts` and checking for any necessary headers or cookies.

## Utilities

In addition to the CLI, `next-puck` exposes some utility functions.

### puckMiddleware()

Rewrite the trailing `/edit` segment to the leading `/puck` segment, and prevents the `/puck` route from being accessed directly.

#### Options

- **req** (`Request`): Request object
- **options** (`object`, optional)
  - **segment** (`string`, optional): the name of the magic segment. Defaults to `edit`.

#### Usage

```ts
import { puckMiddleware } from "@measured/next-puck";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  return puckMiddleware(req);
}
```

## License

MIT © [Measured Co.](https://github.com/measuredco)
