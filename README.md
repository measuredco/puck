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

## Installation

Install the package

```
npm i puck --save
```

Or generate a puck application using a recipe

```sh
npx create-puck-app my-app
```

## Recipes

Puck is a React component that can be easily integrated into your existing application. We also provide helpful recipes for common use cases:

- [**next**](https://github.com/measuredco/puck/tree/main/recipes/next): Next.js app example

## Plugins

Puck can be configured to work with plugins. Plugins can extend the functionality to support novel functionality.

### Official plugins

- [`heading-analyzer`](https://github.com/measuredco/puck/tree/main/packages/plugin-heading-analyzer): Analyze the heading outline of your page and be warned when you're not respecting WCAG 2 accessiblity standards.

### Developing a plugin

The plugin API follows a React paradigm. Each plugin passed to the Puck editor can provide three functions:

#### `Plugin`

- `renderPage` (`Component`): Render the root node of the preview content
- `renderPageFields` (`Component`): Render the page fields
- `renderFields` (`Component`): Render the fields for the currently selected component

Each render function receives the `children` prop, which you should render to show the page or fields, and the `data` prop, which can be used to read the data model for the page.

#### Example

Here's a basic plugin that renders a "My plugin" heading in the page field area:

```jsx
const myPlugin = {
  renderPageFields: (props) => <div>
    {props.children}

    <h2>My plugin</h2>
  </div>
};
```

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
- **groupFields** (`object`): Object describing sub-fields for items in a group input
  - **[fieldName]** (`Field`): The Field objects describing the input data for each item
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
