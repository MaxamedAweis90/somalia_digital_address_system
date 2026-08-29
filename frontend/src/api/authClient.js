import {createClient} from "better-auth/react"

export const authClient = createClient({

    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',

})

export const {useSession, useSignIn, useSignOut, useSignUp, useUpdatePassword, useUpdateEmail, useDeleteAccount} = authClient;