import { prisma } from "../config/prisma.js";

export const AuthService = {

    getSessionProfile : async (req) => {
        const session = await req.auth.getSession({
            headers: req.headers
        });

        if (!session) {
            throw new  Error("Unauthorized access, Please login to access this resource.")
        }

        const userProfile = await prisma.user.findUnique({

            where: {
                id: session.userId
            },

            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                createdAt: tru
            }
        });

        return {session, userProfile};
    }
}