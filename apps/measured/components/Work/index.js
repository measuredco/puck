import Image from "next/image";
import React from "react";

import "./Work.css";

const Work = ({ client, image, project, url }) => (
  <div className="msrd-Work">
    <div className="msrd-Work-content">
      <h3 className="msrd-Work-client">{client}</h3>
      <p className="msrd-Work-project">{project}</p>
      <p className="msrd-Work-url">
        <a href={`https://${url}`} target="_blank">
          {url}
        </a>
      </p>
    </div>
    <div className="msrd-Work-image">
      <Image
        alt=""
        height="450"
        loading="lazy"
        src={`https://res.cloudinary.com/measuredco/dpr_auto,f_auto,q_auto,w_auto/site/${image}`}
        sizes="100vw"
        width="800"
      />
    </div>
  </div>
);

export default Work;
