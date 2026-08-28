import { AuthService } from "../service/auth.service.js"

export const GetmeController = async (req, res) => {

    try{

        const data = await AuthService.getSessionProfile(req);

        return res.status(200).json(data);

    }
    
    catch(err){
     
    return res.status(401).json({
        success: false,
        message: err.message,
    })

    }
}