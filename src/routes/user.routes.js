import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middlewware.js";

const router = Router();
//router.route("/register").post(registerUser); pehle just neeche wali line aisi dikhti thi, lekin humne ismein upload ki functionality or laga di hai ki, user ko register karne se pehle file upload karwado, i.e. upload ek multer ki functionality hai and isko humne middleware folder mein likha hua hai, i.e. ab upload ek middleware ki tarah kaam kar raha hai, i.e. registerUser run hone se pehle mera upload wala middleware chalega
router.route("/register").post(upload.fields([{name: "avatar", maxCount: 1}, {name: "coverImage", maxCount: 1}]), registerUser); // yahan par mujhe 2 files upload karwani hai(i.e. avatar and coverImage), isliye 'upload.fileds' kaa use kiya, agar single file upload karwani hoti hai toh fir 'upload.single' kaa use karte hain

export default router;