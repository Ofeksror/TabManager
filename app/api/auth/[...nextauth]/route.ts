import NextAuth, { DefaultSession } from "next-auth";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"; // https://stackoverflow.com/questions/76503606/next-auth-error-adapter-is-not-assignable-to-type-adapter-undefined
import clientPromise from "@/lib/mongodb";

import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/models/User";
import md5 from "md5";
import dbConnect from "@/lib/dbConnect";
import { ObjectId } from "mongoose";

/* Resource for adding properties to the Session object
// https://reacthustle.com/blog/extend-user-session-nextauth-typescript */

declare module "next-auth" {
    interface User {
        email: string;
        firstName: string;
        lastName: string;
        _id: ObjectId;
        workspaces: ObjectId[];
    }

    interface Session extends DefaultSession {
        user?: User;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        email: string;
        firstName: string;
        lastName: string;
        _id: ObjectId;
        workspaces: ObjectId[];
    }
}

const handler = NextAuth({
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // https://www.youtube.com/watch?v=gDsCueKkFEk
            if (trigger === "update") {
                token = session.user;
                return token;
            }

            if (user) {
                token.email = user.email;
                token.firstName = user.firstName;
                token.lastName = user.lastName;
                token._id = user._id;
                token.workspaces = user.workspaces;
            }

            return token;
        },
        async session({ session, token, user }) {
            if (token && session.user) {
                session.user.email = token.email;
                session.user.firstName = token.firstName;
                session.user.lastName = token.lastName;
                session.user._id = token._id;
                session.user.workspaces = token.workspaces;
            }

            return session;
        },
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "email", type: "email" },
                password: { label: "password", type: "password" },
            },
            async authorize(credentials, req) {
                if (!credentials) return null;

                await dbConnect();

                const userFound = await User.findOne({
                    email: credentials.email,
                });

                // Validate credentials
                if (!userFound) {
                    throw new Error("Email address not registered");
                }

                const hashedPassword = md5(credentials.password as string);
                if (userFound.hashedPassword !== hashedPassword) {
                    throw new Error("Invalid password");
                }

                // Authorize user
                return userFound;
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    debug: process.env.NODE_ENV === "development",
    adapter: MongoDBAdapter(clientPromise),
});

export { handler as GET, handler as POST };
