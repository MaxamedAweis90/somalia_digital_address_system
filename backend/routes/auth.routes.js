import { Router } from 'express'
import { GetmeController } from '../controllers/auth.controller.js'

const AuthRouter = Router()

AuthRouter.get('/me', GetmeController)


export default AuthRouter
