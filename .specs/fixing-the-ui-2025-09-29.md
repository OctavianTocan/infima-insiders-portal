We're going to be making some changes to this project as it is right now. Specifically, we're going to be modifying some of the UI such that the components are more aligned and also generally look better. To do this correctly, we are first going to be making a task file of some sort so we can actually keep track of all the tasks we are going to be tracking. But you're actually going to be making a plan anyways. This task file is mostly so you can reference it before making the plan. And I'll link it here. You SHOULD use the Playwright MCP to Check all the components that I referenced. I am mostly going to be referencing Storybook stories. The development build is already run for that, so all you really need to do is head to this link: http://localhost:6006/

And use Playwright to understand what's going on in there.

- The Discord icon is currently not centered with the text next to it. You can see this in the DiscordOAuthButton story.
- I don't think we're even using the Discord Verification Form (the one that has the input field for the Discord ID). We can probably just remove it. You can see this inside of the DiscordVerificationForm story.
- You can see in the DiscordVerificationFlow story that there is a small button for "Manual Verification". This isn't necessary. There's no manual verification in the project. Just remove that button.
- Inside of the SignupFlow story, you can see that we have a DiscordOAuthWithMessage component. This component is actually great, it uses a text on top of the DiscordButton which looks good. We could just use this for the error messages (the ones that we display to the user), instead of displaying our horrid monstrosity of an error message (which you can see in SupportRequestStep in that same story). I'm referring to the completely not-in-style, and off-center, evidently not good error message with buttons that aren't even styled. (\*It's using ConsolidatedErrorDisplay story components, which all look awful).

# Make SURE you READ these guidelines BEFORE planning, so you can plan CLEAN, MAINTAINABLE, and GOOD code:

React Principles: "C:\Users\tocanoctavian\AppData\Roaming\Code - Insiders\User\prompts\react-guidelines.instructions.md"
Typescript Principles: "C:\Users\tocanoctavian\AppData\Roaming\Code - Insiders\User\prompts\typescript-guidelines.instructions.md"
