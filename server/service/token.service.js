import jwt from 'jsonwebtoken'
import 'dotenv/config'
import dbp from '../db.js'

class TokenService {
   generateToken(payload){
      const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_KEY, {expiresIn: "30m"})
      const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_KEY, {expiresIn: "30d"})
      return {
         accessToken, refreshToken
      }
   }

   validateAccessToken(token){
      try {
         const userData = jwt.verify(token, process.env.JWT_ACCESS_KEY)
         return userData
      } catch (err) {
         return null
      }
   }
   validateRefreshToken(token){
      try {
         const userData = jwt.verify(token, process.env.JWT_REFRESH_KEY)
         return userData
      } catch (err) {
         return null
      }
   }

   async saveToken(user_id, refreshToken){
      const tokenData = await dbp.query('select token from tokens where user_id = $1', [user_id])
      if(tokenData.rows[0]?.token){
         const response = await dbp.query('update tokens set token = $1 where user_id = $2', [refreshToken, user_id])
         return response    
      }
      const token = await dbp.query('insert into tokens (user_id, token) values ($1, $2)', [user_id, refreshToken])
      return token      
   }

   async findToken(refreshToken){
      const token = await dbp.query('select * from tokens where token = $1', [refreshToken])
      return token.rows[0]
   }
   async removeToken(refreshToken){
      const token = await dbp.query('delete from tokens where token = $1', [refreshToken])
      return token
   }
}

export default new TokenService()