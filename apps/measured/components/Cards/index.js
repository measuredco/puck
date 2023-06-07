import React from "react";

import { Artifact, Heading, Space } from "../";

import "./Cards.css";

const Cards = () => (
  <ul className="msrd-Cards">
    <li>
      <Artifact>#</Artifact>
      <Heading level="3" size="05">
        Full-stack engineering
      </Heading>
      <Space size="03" />
      <p>
        Considered, precise engineering approaches across the full spread of web
        technologies.
      </p>
    </li>
    <li>
      <Artifact></Artifact>
      <Heading level="3" size="05">
        Technical architecture
      </Heading>
      <Space size="03" />
      <p>Pragmatic, goal-focussed technical architecture solutions.</p>
    </li>
    <li>
      <Artifact>☼</Artifact>
      <Heading level="3" size="05">
        Project rescue
      </Heading>
      <Space size="03" />
      <p>We can help restore velocity to stuck projects.</p>
    </li>
    <li>
      <Artifact>⬒</Artifact>
      <Heading level="3" size="05">
        Design-conscious UI development
      </Heading>
      <Space size="03" />
      <p>We can be the glue between brand, design and engineering teams.</p>
    </li>
  </ul>
);

export default Cards;
