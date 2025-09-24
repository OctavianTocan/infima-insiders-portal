import React from 'react';

/**
 * Information section displaying the signup benefits and branding.
 * Contains the logo, title, description, and benefits list.
 */
export function InfoSection() {
  return (
    <div className="info-section">
      <div className="logo-container">
        <img
          src="/infima-games-logo.svg"
          alt="Infima Games Logo"
          className="logo"
        />
      </div>
      <h2 className="title">
        Join the Insiders Build: Get Updates Before the Marketplace
      </h2>
      {/* <p className="subtitle">
        The Realistic Assault Rifle Template has always been about more than
        some animations and a pretty 3D model. It's about giving you a solid,
        extensible foundation for shooter mechanics so you can build prototypes
        faster and focus on what matters: your game.
      </p> */}
      <ul className="benefits">
        <li>
          <span className="check-mark">✔</span>
          <p>
            <strong>Access to the Insider GitHub: </strong>
            Get the latest build of the template as it's being updated, before
            it hits the Marketplace.
          </p>
        </li>
        <li>
          <span className="check-mark">✔</span>
          <p>
            <strong>Transparent Development: </strong>
            Follow along as we improve the core systems, fix long-standing
            issues, and expand features.
          </p>
        </li>
        <li>
          <span className="check-mark">✔</span>
          <p>
            <strong>Direct Contribution to Stability: </strong>
            By using the Insider build, you help raise the quality bar for
            everyone.
          </p>
        </li>
      </ul>
    </div>
  );
}