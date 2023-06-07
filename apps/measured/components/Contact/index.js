import React from "react";

import "./Contact.css";

const Contact = () => (
  <div className="msrd-Contact" id="contact">
    <h2 className="msrd-Contact-heading">Get in touch</h2>
    <p className="msrd-Contact-strapline">Ready to discuss a project?</p>
    <ul className="msrd-Contact-methods">
      <li>
        <a
          href="https://calendly.com/measuredco/work-with-measured"
          target="_blank"
        >
          🗓️ Schedule a meeting
        </a>
      </li>
      <li>
        <a href="mailto:hello@measured.co">✉️ hello@measured.co</a>
      </li>
    </ul>
  </div>
);

export default Contact;
