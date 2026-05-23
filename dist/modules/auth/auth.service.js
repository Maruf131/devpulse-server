import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../../db";
import config from "../../config";
const loginUserIntoDB = async (payload) => {
    const { email, password } = payload;
    // check user exists
    const userResult = await pool.query(`
    SELECT *
    FROM users
    WHERE email = $1
    `, [email]);
    const user = userResult.rows[0];
    // user not found
    if (!user) {
        throw new Error("User not found");
    }
    // compare password
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    // invalid password
    if (!isPasswordMatched) {
        throw new Error("Password does not match");
    }
    // create token
    const jwtPayload = {
        id: user.id,
        name: user.name,
        role: user.role,
    };
    const accessToken = jwt.sign(jwtPayload, config.secret_key, {
        expiresIn: "7d",
    });
    // remove password
    const { password: pass, ...userWithoutPassword } = user;
    return {
        accessToken,
        user: userWithoutPassword,
    };
};
export const authService = {
    loginUserIntoDB,
};
//# sourceMappingURL=auth.service.js.map