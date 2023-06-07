import React from "react";

import "./Hero.css";

const Hero = ({ description, strapline }) => (
  <div className="msrd-Hero">
    <p className="msrd-Hero-strapline">{strapline}</p>
    <p className="msrd-Hero-description">{description}</p>
    <p className="msrd-Hero-callToAction">
      <a className="msrd-Hero-callToActionLink" href="#contact">
        Get in touch
      </a>
    </p>
  </div>
);

export default Hero;
