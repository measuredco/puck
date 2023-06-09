# puck

The self-hosted, drag and drop editor for React.

- 🖱️ **Drag and drop**: Visual editing for your existing React component library
- 🌐 **Integrations**: Load your content from a 3rd party headless CMS
- ✍️ **Inline editing**: Author content directly via puck for convenience
- ⭐️ **No vendor lock-in**: Self-host or integrate with your existing application

## Example

```jsx
import { Puck } from "puck";

// Create puck component config
const config = {
  HeadingBlock: {
    fields: {
      children: {
        type: "text",
      },
    },
    render: ({ children }) => {
      return <h1>{children}</h1>;
    },
  },
};

// Describe the initial data
const data = {
  content: [
    {
      type: "HeadingBlock",
      props: {
        title: "Home Page",
      },
    },
  ],
};

// Render Puck
export function Page() {
  return <Puck config={config} data={data} />;
}
```

## Recipes

> Building a new application? We recommend following using our [`next-multi`](https://github.com/measuredco/puck/tree/main/recipes/next-multi) recipe.

Puck is a powerful visual editor that's the perfect companion for your existing application. Because everyone's stack is different, Puck can't handle authentication or provide a database.

Instead, we provide recipes for how you might integrate Puck into your stack of choice:

- [**next**](#): a single page Next.js example
- [**next-multi**](https://github.com/measuredco/puck/tree/main/recipes/next-multi): a multi-page Next.js example

## Reference

### `Config`

The `Config` object describes which components Puck should render, how they should render and which inputs are available to them.

- **page** (`object`)
  - **fields** (`object`):
    - **title** (`Field`): A mandatory field for the page title.
    - **[fieldName]** (`Field`): User defined fields, used to describe the input data stored in the `page` key.
  - **render** (`Component`): Render a React component at the root of your component tree. Useful for defining context providers.
- **components** (`object`): Definitions for each of the components you want to show in the visual editor
  - **[componentName]** (`object`)
    - **fields** (`Field`): The Field objects describing the input data stored against this component.
    - **render** (`Component`): Render function for your React component. Receives props as defined in fields.

### `Field`

A `Field` represents a user input field shown in the Puck interface.

- **type** (`text` | `number` | `select` | `external` | `group`): The input type to render
- **label** (`text` [optional]): A label for the input. Will use the key if not provided.
- **options** (`object[]`): array of items to render for select-type inputs
  - **label** (`string`)
  - **value** (`string`)

### `Data`

The `Data` object stores the state of a page.

- **page** (`object`):
  - **title** (string): Page title
  - **[prop]** (string): User defined data from page fields
- **content** (`object[]`):
  - **type** (string): Component name
  - **props** (object):
    - **[prop]** (string): User defined data from component fields

## License

MIT © [Measured Co.](https://github.com/measuredco)
