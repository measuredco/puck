# puck

<p align="left">
  <a aria-label="Measured logo" href="https://measured.co">
    <img src="https://img.shields.io/badge/MADE%20BY%20Measured-000000.svg?style=for-the-badge&labelColor=000">
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@measured/puck">
    <img alt="" src="https://img.shields.io/npm/v/@measured/puck.svg?style=for-the-badge&labelColor=000000">
  </a>
  <a aria-label="License" href="https://github.com/measuredco/puck/blob/main/LICENSE">
    <img alt="" src="https://img.shields.io/npm/l/@measured/puck.svg?style=for-the-badge&labelColor=000000">
  </a>
  <a aria-label="Join the community on Discord" href="https://discord.gg/D9e4E3MQVZ">
    <img alt="" src="https://img.shields.io/badge/Join%20the%20Discord-blueviolet.svg?style=for-the-badge&logo=Discord&labelColor=000000&logoWidth=20">
  </a>
</p>

The self-hosted, drag and drop editor for React.

- 🖱️ **Drag and drop**: Visual editing for your existing React component library
- 🌐 **Integrations**: Load your content from a 3rd party headless CMS
- ✍️ **Inline editing**: Author content directly via puck for convenience
- ⭐️ **No vendor lock-in**: Self-host or integrate with your existing application

[See demo](https://puck-editor-demo.vercel.app/edit)

## Example

Render the editor:

```jsx
// Editor.jsx
import { Puck } from "@measured/puck";
import "@measured/puck/dist/index.css";

// Create puck component config
const config = {
  components: {
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
  },
};

// Describe the initial data
const initialData = {
  content: [],
  root: {},
};

// Save the data to your database
const save = (data) => {};

// Render Puck editor
export function Editor() {
  return <Puck config={config} data={initialData} onPublish={save} />;
}
```

Render the page:

```jsx
// Page.jsx
import { Render } from "@measured/puck";
import "@measured/puck/dist/index.css";

export function Page() {
  return <Render config={config} data={data} />;
}
```

## Installation

Install the package

```
npm i @measured/puck --save
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

- [`heading-analyzer`](https://github.com/measuredco/puck/tree/main/packages/plugin-heading-analyzer): Analyze the heading outline of your page and be warned when you're not respecting WCAG 2 accessibility standards.

### Developing a plugin

The plugin API follows a React paradigm. Each plugin passed to the Puck editor can provide three functions:

- `renderRoot` (`Component`): Render the root node of the preview content
- `renderRootFields` (`Component`): Render the root fields
- `renderFields` (`Component`): Render the fields for the currently selected component

Each render function receives three props:

- **children** (`ReactNode`): The normal contents of the root or field. You must render this.
- **state** (`AppState`): The current application state, including data and UI state
- **dispatch** (`(action: PuckAction) => void`): The Puck dispatcher, used for making data changes or updating the UI. See the [action definitions](https://github.com/measuredco/puck/blob/main/packages/core/reducer/actions.tsx) for a full reference of available mutations.

#### Example

Here's a basic plugin that renders a "My plugin" heading in the root field area:

```jsx
const myPlugin = {
  renderRootFields: (props) => (
    <div>
      {props.children}

      <h2>My plugin</h2>
    </div>
  ),
};
```

## Custom fields

Puck supports custom fields using the `custom` field type and `render` method.

In this example, we optionally add the `<FieldLabel>` component to add a label:

```tsx
import { FieldLabel } from "@measured/puck";

export const MyComponent: ComponentConfig = {
  fields: {
    myField: {
      type: "custom",
      render: ({ field, name, onChange, value }) => {
        return (
          <FieldLabel label={field.label || name}>
            <input
              placeholder="Enter text..."
              type="text"
              name={name}
              defaultValue={value}
              onChange={(e) => onChange(e.currentTarget.value)}
            ></input>
          </FieldLabel>
        );
      },
    },
  },
};
```

## DropZones

Puck supports creating complex layouts (like multi-column layouts) using the `<DropZone>` component.

### Example

In this example, we use the `<DropZone>` component to render two nested DropZones within another component:

```tsx
import { DropZone } from "@measured/puck";

export const MyComponent: ComponentConfig = {
  render: () => {
    return (
      <div>
        <DropZone zone="first-drop-zone">
        <DropZone zone="second-drop-zone">
      </div>
    )
  }
};
```

### Custom root entry points

You can also do this at the root of your component. This is useful if you have a fixed layout and only want to make certain parts of your page customisable:

```tsx
import { DropZone, Config } from "@measured/puck";

export const config: Config = {
  root: {
    render: ({ children }) => {
      return (
        <div>
          {/* children renders the default zone. This can be omitted if necessary. */}
          {children}

          <div>
            <DropZone zone="other-drop-zone">
          </div>
        </div>
      )
    }
  }
};
```

### The Rules of DropZones

The current DropZone implementation has certain rules and limitations:

1. You can drag from the component list on the LHS into any DropZone
2. You can drag components between DropZones, so long as those DropZones share a parent (also known as _area_)
3. You can't drag between DropZones that don't share a parent (or _area_)
4. Your mouse must be directly over a DropZone for a collision to be detected

## Reference

### `<Puck>`

The `<Puck>` component renders the Puck editor.

- **config** (`Config`): Puck component configuration
- **data** (`Data`): Initial data to render
- **onChange** (`(Data) => void` [optional]): Callback that triggers when the user makes a change
- **onPublish** (`(Data) => void` [optional]): Callback that triggers when the user hits the "Publish" button
- **renderHeader** (`Component` [optional]): Render function for overriding the Puck header component
- **renderHeaderActions** (`Component` [optional]): Render function for overriding the Puck header actions. Use a fragment.
- **headerTitle** (`string` [optional]): Set the title shown in the header title
- **headerPath** (`string` [optional]): Set a path to show after the header title
- **plugins** (`Plugin[]` [optional]): Array of plugins that can be used to enhance Puck

### `<Render>`

The `<Render>` component renders user-facing UI using Puck data.

- **config** (`Config`): Puck component configuration
- **data** (`Data`): Data to render

### `<DropZone>`

The `<DropZone>` component allows you to create advanced layouts, like multi-columns.

- **zone** (`string`): Identifier for the zone of your component, unique to the parent component
- **style** (`CSSProperties`): Custom inline styles

### `Config`

The `Config` object describes which components Puck should render, how they should render and which inputs are available to them.

- **root** (`object`)
  - **fields** (`object`):
    - **title** (`Field`): Title of the content, typically used for the page title.
    - **[fieldName]** (`Field`): User defined fields, used to describe the input data stored in the `root` key.
  - **render** (`Component`): Render a React component at the root of your component tree. Useful for defining context providers.
- **components** (`object`): Definitions for each of the components you want to show in the visual editor
  - **[componentName]** (`object`)
    - **fields** (`Field`): The Field objects describing the input data stored against this component.
    - **render** (`Component`): Render function for your React component. Receives props as defined in fields.
    - **defaultProps** (`object` [optional]): Default props to pass to your component. Will show in fields.

### `Field`

A `Field` represents a user input field shown in the Puck interface.

- **type** (`text` | `textarea` | `number` | `select` | `radio` | `external` | `array` | `custom`): The input type to render
- **label** (`text` [optional]): A label for the input. Will use the key if not provided.
- **arrayFields** (`object`): Object describing sub-fields for items in an `array` input
  - **[fieldName]** (`Field`): The Field objects describing the input data for each item
- **getItemSummary** (`(object, number) => string` [optional]): Function to get the name of each item when using the `array` or `external` field types
- **defaultItemProps** (`object` [optional]): Default props to pass to each new item added, when using a `array` field type
- **options** (`object[]`): array of items to render for select or radio inputs
  - **label** (`string`)
  - **value** (`string` | `number` | `boolean`)
- **adaptor** (`Adaptor`): Content adaptor if using the `external` input type
- **adaptorParams** (`object`): Paramaters passed to the adaptor
- **render** (`Component`): Render a custom field. Receives the props:
  - **field** (`Field`): Field configuration
  - **name** (`string`): Name of the field
  - **value** (`any`): Value for the field
  - **onChange** (`(value: any) => void`): Callback to change the value
  - **readOnly** (`boolean` | `undefined`): Whether or not the field should be in readOnly mode

### `AppState`

The `AppState` object stores the puck application state.

- **data** (`Data`): The page data currently being rendered
- **ui** (`object`):
  - **leftSideBarVisible** (boolean): Whether or not the left side bar is visible
  - **itemSelector** (object): An object describing which item is selected
  - **arrayState** (object): An object describing the internal state of array items

### `Data`

The `Data` object stores the puck page data.

- **root** (`object`):
  - **title** (string): Title of the content, typically used for the page title
  - **[prop]** (string): User defined data from `root` fields
- **content** (`object[]`):
  - **type** (string): Component name
  - **props** (object):
    - **[prop]** (string): User defined data from component fields

### `Adaptor`

An `Adaptor` can be used to load content from an external content repository, like Strapi.js.

- **name** (`string`): The human-readable name of the adaptor
- **fetchList** (`(adaptorParams: object) => object`): Fetch a list of content and return an array

> NB Using an adaptor on the reserved field name `_data` will spread the resulting data over your object, and lock the overridden fields.

### `Plugin`

Plugins that can be used to enhance Puck.

- **renderRoot** (`Component`): Render the root node of the preview content
- **renderRootFields** (`Component`): Render the root fields
- **renderFields** (`Component`): Render the fields for the currently selected component

## Hire the Puck team

Puck is developed and maintained by **Measured**, a small group of industry veterans with decades of experience helping companies solve hard UI problems. We offer consultancy and development services for scale-ups, SMEs and enterprises.

If you need support integrating Puck or creating a beautiful component library, please reach out via [our website](https://measured.co).

## License

MIT © [Measured Co.](https://github.com/measuredco)
