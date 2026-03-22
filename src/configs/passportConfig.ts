import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel";
import { UserStatus, AuthProvider } from "../utils/enums/userEnum";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.SERVER_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email from Google"), false);

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
          // User exists — update provider info and login
          user.provider = AuthProvider.GOOGLE;
          user.isEmailVerified = true;
          if (user.status === UserStatus.PENDING_VERIFICATION) {
            user.status = UserStatus.ACTIVE;
          }
          await user.save({ validateBeforeSave: false });
          return done(null, user);
        }

        // New user — create account
        user = await User.create({
          firstName: profile.name?.givenName || "User",
          lastName: profile.name?.familyName || "",
          email,
          provider: AuthProvider.GOOGLE,
          isEmailVerified: true,
          status: UserStatus.ACTIVE,
          password: undefined, // no password for Google users
        });

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);

export default passport;
