import {createClient} from "better-auth/react"

export const authClient = createClient({

    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',

})

export const {useSession, useSignIn, useSignOut, useSignUp, useUpdatePassword, useUpdateEmail, useDeleteAccount} = authClient;