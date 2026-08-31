export const sethAuthCookie = (res, token) => {

    res.cookie("token", token,
        {

            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Localhost ku waa false
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Localhost ku waa 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        }
    )
}

export const clearAuthCookie = (res) => {

    res.clearCookie("token")
}