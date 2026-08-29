import { prisma } from "../config/prisma.js"
import { comparePassword, hashPassword } from "../utils/hash.utils.js";
import { generateToken } from "../utils/jwt.utils.js";

export const AuthService =  {

    registerUser : async (email, password) => {

        const existingUser = await prisma.user.findUnique({
            where: {email}
        });

        if(existingUser) {
            throw new Error("User already exists")
        }

        const hashPassword = await hashPassword(password)

        const newUser = await prisma.user.create({

            data: {
                email,
                password: hashPassword
            }

        })

        const token = generateToken({id: newUser.id, email: newUser.email})

        return {user: newUser, token}
    },

    loginUser : async (email, password) => {

        const user = await prisma.user.findUnique({
            where: {email}
        });

        if(!user){
            throw new Error("User not found")
        }

        const isMatch = await comparePassword(password, user.password)

        if(!isMatch) {

            throw new Error("Invalid Password and Email")
        }

        const token = generateToken({id: user.id, email: user.email});

        return { user: {id: user.id, email: user.email}, token}
    },

    getUserProfile: async (userId) => {

        const user = await prisma.user.findUnique({

            where: {id: userId},
            select: {
                id: true,
                email: true
            }
        })

        if(!user) {
            throw new Error("User not found")
        }

        return user

    }
}

