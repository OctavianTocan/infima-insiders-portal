import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/redirect.tsx"),
  route("/signup", "routes/signup.tsx"),
  route("/api/discord/auth", "routes/api.discord.auth.tsx"),
  route("/api/discord/callback", "routes/api.discord.callback.tsx"),
  route("/api/discord/debug-roles", "routes/api.discord.debug-roles.tsx"),
  route("/api/github/callback", "routes/api.github.callback.tsx"),
] satisfies RouteConfig;
