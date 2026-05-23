import { pool } from "../../db";
import { userService } from "./users.service";
const createUser = async (req, res) => {
    //   const { name, email, password, role } = req.body;
    try {
        const result = await userService.createUserIntoDB(req.body);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result.rows[0],
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error,
        });
    }
};
export const userController = {
    createUser,
};
//# sourceMappingURL=users.controller.js.map