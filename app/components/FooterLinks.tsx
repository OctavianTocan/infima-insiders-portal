import React from "react";

/**
 * Footer section with links for users who don't have a GitHub account
 * and legal links for Privacy Policy and Terms of Service.
 */
export function FooterLinks({
  showGitHubSignup = true,
}: {
  showGitHubSignup?: boolean;
}) {
  return (
    <div className="footer-links">
      {showGitHubSignup && (
        <p className="no-account">
          No account? <a href="https://github.com/signup">Sign up on GitHub</a>
        </p>
      )}
      <p className="legal-links">
        <a href="https://infimagames.notion.site/Signup-Privacy-Policy-Insiders-Repository-ae8219ae834e4cb8b7970b6d17465b36">
          Privacy Policy
        </a>{" "}
        •{" "}
        <a href="https://infimagames.notion.site/Signup-Terms-Insiders-Repository-aca8ecc6a5f84abca890c6a239c23d6b">
          Terms of Service
        </a>
      </p>
    </div>
  );
}
