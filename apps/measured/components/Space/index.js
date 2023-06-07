import React from "react";

import "./Space.css";

const Space = ({ size }) => (
  <div className={`msrd-Space ${size ? `msrd-Space--${size}` : ""}`}></div>
);

export default Space;
