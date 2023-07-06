# plugin-heading-analyzer

Visualise your heading outline structure and identify missing heading levels. Respects WCAG 2.

<img src="https://i.imgur.com/POqtgHu.jpg" alt="example" width="156px" />

## Quick start

```sh
npm i @measured/puck-plugin-heading-analyzer
```

```jsx
import { Puck } from "@measured/puck";
import headingAnalyzer from "@measured/puck-plugin-heading-analyzer";

...

// Render Puck
export function Page() {
  return <Puck
    config={config}
    data={data}
    plugins={[
        headingAnalyzer
    ]}
  />;
}
```

## License

MIT © [Measured Co.](https://github.com/measuredco)
