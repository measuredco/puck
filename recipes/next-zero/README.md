# `next-zero` recipe

> **⚠️ This recipe is experimental and not yet suitable for most use-cases.**

`next-zero` is a zero-config recipe to create an out-of-the-box Puck configuration for Next.js 13 (App Router).

It's similar to the [`next` recipe](https://github.com/measuredco/puck/tree/main/recipes/next), but uses [`next-puck`](https://github.com/measuredco/puck/tree/main/packages/next-puck) to manage core routing, including:

- **A static catch-all route**: render all Puck pages using incremental static regeneration
- **A magic /edit route**: put `/edit` on the end of any URL to launch the Puck editor
- **Route upgrades**: a mechanism to upgrade your routes to the latest best practices

## Usage

Run the generator and enter `next-zero` when prompted

```
npx create-puck-app my-app
```

Start the server

```
yarn dev
```

Navigate to the homepage at https://localhost:3000. To edit the homepage, access the Puck editor at https://localhost:3000/edit.

You can do this for any route on the application, **even if the page doesn't exist**. For example, visit https://localhost:3000/hello/world and you'll receive a 404. You can author and publish a page by visiting https://localhost:3000/hello/world/edit. After publishing, go back to the original URL to see your page.

## Using this recipe

To adopt this recipe you will need to:

- Add authentication to `/edit` routes by modifying the `middleware.ts`. **If you don't do this, Puck will be completely public.**
- Integrate your database into the API calls in `next-puck.config.tsx`
- Implement a custom puck configuration in `next-puck.config.tsx`

### Using `next-puck`

`next-zero` uses the `next-puck` library to generates the routes and provide helper functions. See the [`next-puck` docs](https://github.com/measuredco/puck/tree/main/packages/next-puck) to learn more.

### Ejecting from next-puck

You can eject at any time by removing `next-puck` routes from your `.gitignore`, but you will stop receiving route upgrades.

## License

MIT © [Measured Co.](https://github.com/measuredco)
