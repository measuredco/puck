export const mapping = {
  Hero: ({ children }) => (
    <div style={{ background: "black", color: "white", padding: 128 }}>
      <h1>{children}</h1>
    </div>
  ),
  FeatureList: ({ children, items }) => (
    <div style={{ background: "white", color: "black", padding: 128 }}>
      <h2>{children}</h2>
      <ul>
        {items.map((item, id) => (
          <li key={id}>{item.text}</li>
        ))}
      </ul>
    </div>
  ),
};

export const initialData = [
  {
    type: "Hero",
    props: {
      id: "hero1",
      children: "Hero Content",
    },
  },
  {
    type: "FeatureList",
    props: {
      id: "featureList",
      children: "Great features",
      items: [
        {
          text: "Feature 1",
        },
        {
          text: "Feature 2",
        },
        {
          text: "Feature 3",
        },
      ],
    },
  },
];
