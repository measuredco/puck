import React from "react";

import "./Heading.css";

const Heading = ({ children, level, size }) => {
  let Element = "span";

  if (level) {
    Element = `h${level}`;
  }

  return (
    <Element className={`msrd-Heading ${size ? `msrd-Heading--${size}` : ""}`}>
      {children}
    </Element>
  );
};

export default Heading;
