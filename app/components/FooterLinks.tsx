import React from 'react';

/**
 * Footer section with links for users who don't have a GitHub account.
 * Provides navigation to GitHub signup page.
 */
export function FooterLinks() {
  return (
    <div className="footer-links">
      <p className="no-account">
        No account?{' '}
        <a href="https://github.com/signup">Sign up on GitHub</a>
      </p>
    </div>
  );
}