# puck

The self-hosted, drag and drop editor for React.

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

## Features

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
- `renderComponentList` (`Component`): Render the component list

Each render function receives three props:

- **children** (`ReactNode`): The normal contents of the root or field. You must render this if provided.
- **state** (`AppState`): The current application state, including data and UI state
- **dispatch** (`(action: PuckAction) => void`): The Puck dispatcher, used for making data changes or updating the UI. See the [action definitions](https://github.com/measuredco/puck/blob/main/packages/core/reducer/actions.tsx) for a full reference of available mutations.

#### Example

Here's an example plugin that creates a button to toggle the left side-bar:

```jsx
const myPlugin = {
  renderRootFields: ({ children, dispatch, state }) => (
    <div>
      {children}

      <button
        onClick={() => {
          dispatch({
            type: "setUi",
            ui: { leftSideBarVisible: !state.ui.leftSideBarVisible },
          });
        }}
      >
        Toggle side-bar
      </button>
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

## Adaptors

Adaptors can be used to import data from a third-party API, such as a headless CMS.

### Example

The `external` field type enables us to use an adaptor to query data from a third party API:

```tsx
const myAdaptor = {
  name: "My adaptor",
  fetchList: async () => {
    const response = await fetch("https://www.example.com/api");

    return {
      text: response.json().text,
    };
  },
};

const config = {
  components: {
    HeadingBlock: {
      fields: {
        myData: {
          type: "external",
          adaptor: myAdaptor,
        },
      },
      render: ({ myData }) => {
        return <h1>{myData.text}</h1>;
      },
    },
  },
};
```

When the user interacts with this adaptor, they'll be presented with a list of items to choose from. Once they select an item, the value will be mapped onto the prop. In this case, `myData`.

## Dynamic prop resolution

Dynamic prop resolution allows developers to resolve props for components without saving the data to the Puck data model.

### resolveData()

`resolveData` is defined in the component config, and allows the developer to make asynchronous calls to change the props after they've been set by Puck.

#### Args

- **props** (`object`): the current props for your component stored in the Puck data

#### Response

- **props** (`object`): the resolved props for your component. Will not be stored in the Puck data
- **readOnly** (`object`): an object describing which fields on the component are currently read-only. Can also make array fields read-only by using a dot-notation accessor, like `array[0].text`.
  - **[prop]** (`boolean`): boolean describing whether or not the prop field is read-only

#### Examples

##### Basic example

In this example, we remap the `text` prop to the `title` prop and mark the `title` field as read-only.

```tsx
const config = {
  components: {
    HeadingBlock: {
      fields: {
        text: {
          type: "text",
        },
        title: {
          type: "text",
        },
      },
      resolveData: async (props) => {
        return {
          props: {
            title: props.text,
          },
          readOnly: {
            title: true,
          },
        };
      },
      render: ({ title }) => {
        return <h1>{title}</h1>;
      },
    },
  },
};
```

##### Combining with adaptors

A more advanced pattern is to combine the `resolveData` method with the adaptors to dynamically fetch data when rendering the component.

```tsx
const myAdaptor = {
  name: "My adaptor",
  fetchList: async () => {
    const response = await fetch("https://www.example.com/api");

    return {
      id: response.json().id,
    };
  },
};

const config = {
  components: {
    HeadingBlock: {
      fields: {
        myData: {
          type: "external",
          adaptor: myAdaptor,
        },
        title: {
          type: "text",
        },
      },
      resolveData: async (props) => {
        if (!myData.id) {
          return { props, readOnly: { title: false } };
        }

        const latestData = await fetch(
          `https://www.example.com/api/${myData.id}`
        );

        return {
          props: {
            title: latestData.json().text,
          },
          readOnly: {
            title: true,
          },
        };
      },
      render: ({ title }) => {
        return <h1>{title}</h1>;
      },
    },
  },
};
```

### resolveAllData()

`resolveAllData` is a utility function exported by Puck to enable the developer to resolve their custom props before rendering their component with `<Render>`. This is ideally done on the server. If you're using `resolveData`, you _must_ use `resolveAllData` before rendering.

```tsx
import { resolveAllData } from "@measured/puck";

const resolvedData = resolveAllData(data, config);
```

## Reference

### `<Puck>`

The `<Puck>` component renders the Puck editor.

- **config** (`Config`): Puck component configuration
- **data** (`Data`): Initial data to render
- **onChange** (`(Data) => void` [optional]): Callback that triggers when the user makes a change
- **onPublish** (`(Data) => void` [optional]): Callback that triggers when the user hits the "Publish" button
- **renderComponentList** (`Component` [optional]): Render function for wrapping the component list
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
    - **resolveData** (`async (props: object) => object` [optional]): Function to dynamically change props before rendering the component.
      - Args
        - **props** (`object`): the current props for your component stored in the Puck data
      - Response
        - **props** (`object`): the resolved props for your component. Will not be stored in the Puck data
        - **readOnly** (`object`): an object describing which fields on the component are currently read-only
          - **[prop]** (`boolean`): boolean describing whether or not the prop field is read-only
- **categories** (`object`): Component categories for rendering in the side bar or restricting in DropZones
  - **[categoryName]** (`object`)
    - **components** (`sting[]`, [optional]): Array containing the names of components in this category
    - **title** (`sting`, [optional]): Title of the category
    - **visible** (`boolean`, [optional]): Whether or not the category should be visible in the side bar
    - **defaultExpanded** (`boolean`, [optional]): Whether or not the category should be expanded in the side bar by default

### `Field`

A `Field` represents a user input field shown in the Puck interface.

### All Fields

- **label** (`text` [optional]): A label for the input. Will use the key if not provided.

### Text Fields

- **type** (`"text"`)

### Textarea Fields

- **type** (`"textarea"`)

### Number Fields

- **type** (`"number"`)

### Select Fields

- **type** (`"select"`)
- **options** (`object[]`): array of items to render
  - **label** (`string`)
  - **value** (`string` | `number` | `boolean`)

### Radio Fields

- **type** (`"radio"`)
- **options** (`object[]`): array of items to render
  - **label** (`string`)
  - **value** (`string` | `number` | `boolean`)

### Array Fields

- **type** (`"array"`)
- **arrayFields** (`object`): Object describing sub-fields for each item
  - **[fieldName]** (`Field`): The Field objects describing the input data for each item
  - **getItemSummary** (`(object, number) => string` [optional]): Function to get the label of each item
- **defaultItemProps** (`object` [optional]): Default props to pass to each new item added, when using a `array` field type

### External Fields

External fields can be used to load content from an external content repository, like Strapi.js, using an `Adaptor`.

- **type** (`"external"`)
- **adaptor** (`Adaptor`): Content adaptor responsible for fetching data to show in the table
  - **name** (`string`): The human-readable name of the adaptor
  - **fetchList** (`(adaptorParams: object) => object`): Fetch content from a third-party API and return an array
  - **mapProp** (`(selectedItem: object) => object`): Map the selected item into another shape
- **adaptorParams** (`object`): Paramaters passed to the adaptor

### Custom Fields

- **type** (`"custom"`)
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
  - **componentList** (object): An object describing the component list. Similar shape to `Config.categories`.
    - **components** (`sting[]`, [optional]): Array containing the names of components in this category
    - **title** (`sting`, [optional]): Title of the category
    - **visible** (`boolean`, [optional]): Whether or not the category is visible in the side bar
    - **expanded** (`boolean`, [optional]): Whether or not the category is expanded in the side bar

### `Data`

The `Data` object stores the puck page data.

- **root** (`object`):
  - **title** (string): Title of the content, typically used for the page title
  - **[prop]** (string): User defined data from `root` fields
- **content** (`object[]`):
  - **type** (string): Component name
  - **props** (object):
    - **[prop]** (string): User defined data from component fields

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
