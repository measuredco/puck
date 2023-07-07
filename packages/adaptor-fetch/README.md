# adaptor-fetch

A generic fetch adaptor for Puck that can be used for most content repositories.

## Quick start

Install the package:

```sh
npm i @measured/puck-adaptor-fetch
```

Create an adaptor using the [fetch() API](https://developer.mozilla.org/en-US/docs/Web/API/fetch):

```jsx
import createAdaptor from "@measured/puck-adaptor-fetch";

const movieAdaptor = createAdaptor(
  "Movies API",
  "http://localhost:1337/api/movies",
  // Optional request data
  {
    headers: {
      Authorization: "Bearer abc123",
    },
  },
  // Optional mapping function
  (body) => body.data
);
```

Configure your Puck instance. In this case, we add our `movieAdaptor` to the `movie` field on our "MovieBlock" component:

```jsx
import { Puck } from "@measured/puck";

const config = {
  components: {
    MovieBlock: {
      fields: {
        movie: {
          type: "external",
          adaptor: movieAdaptor,
        },
      },
      render: ({ movie }) => <h1>{movie.title}</h1>,
    },
  },
};

export function Page() {
  return <Puck config={config} data={data} />;
}
```

## License

MIT © [Measured Co.](https://github.com/measuredco)
