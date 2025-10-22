# Changelog

## [Unreleased] - 2025-10-11

### Fixed
- Display friendly error messages for GitHub OAuth failures instead of raw API errors
- Handle the case where a user who is already a collaborator attempts to sign up again
- Added support link on GitHub OAuth step when errors occur

### Changed
- Enhanced `addCollaborator` function to check collaborator status before attempting to add
- Improved error handling in GitHub OAuth callback to parse and transform error messages
- Updated GitHubOAuthStep component to display support link when errors occur
- Added user-friendly error messages with error codes (GITHUB_USER_NOT_FOUND, GITHUB_API_ERROR)

### Technical Details
The issue occurred when users who were already GitHub collaborators attempted to sign up again. The GitHub API would return a 404 error in some edge cases, which was displayed as a raw error message to the user:

```
Error: OAuth process failed - GitHub API error: 404 - {"message":"Not Found","documentation_url":"https://docs.github.com/rest/collaborators/add-a-repository-collaborator","status":"404"}
```

**Solution:**
1. Added pre-check in `addCollaborator` to verify collaborator status before attempting to add
2. Added fallback verification when 404 errors occur to detect if user is already a collaborator
3. Transformed all error messages to user-friendly format with helpful context
4. Added support link when errors occur to guide users to assistance
5. Maintained detailed error logging for debugging while hiding technical details from users

**Files Changed:**
- `app/utils/github.server.ts` - Enhanced collaborator checking and error handling
- `app/routes/api.github.callback.tsx` - User-friendly error message transformation
- `app/routes/signup.tsx` - Added showSupport flag and support request handler
- `app/components/GitHubOAuthStep.tsx` - Display support link on errors
- `app/components/SignupFlow.tsx` - Pass support props to GitHub step
- `app/hooks/useSignupFlow.ts` - Added goToSupportRequest action
- `app/styles/notion-components.css` - Styling for support link
