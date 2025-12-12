import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  session: {
    cookie: {
      name: "obdtrak_session",
    },
  },
  authorizationParameters: {
    audience: process.env.AUTH0_AUDIENCE,
  },
});

export const loginUrl = "/auth/login";
export const logoutUrl = "/auth/logout";
