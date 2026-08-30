export const sethAuthCookie = (res, token) => {

    res.cookie("token", token, 
        {

            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
            maxAge: 7*24*60*60*1000,
        }
    )
}

export const clearAuthCookie = (res) => {

    res.clearCookie("token")
}