import { Router } from "express";
import { userController } from "./users.controller";

const router = Router();

router.post("/signup", userController.createUser);

export const userRoute = router;
