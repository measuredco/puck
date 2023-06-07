import React from "react";

import "./Section.css";

const Section = ({ children }) => (
  <section className="msrd-Section">
    <div className="msrd-Section-inner">{children}</div>
  </section>
);

export default Section;
