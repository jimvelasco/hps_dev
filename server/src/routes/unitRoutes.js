import express from "express";
import { getUnits, createUnit, deleteUnit, updateUnit,getUnit,updateAllUnits} from "../controllers/unitController.js";
import authenticateToken from "../middleware/authenticateToken.js";
import validateRequest from "../middleware/validateRequest.js";
import { updateUnitDetailsSchema } from "../schemas/userSchemas.js";

const router = express.Router();

router.get("/", getUnits);
router.get("/:hoaid/:unitnumber", getUnit);

router.put("/batch/update-parking", authenticateToken, updateAllUnits);


router.post("/", createUnit);
//router.put("/updateunit", validateRequest(updateUnitDetailsSchema), updateUnit);
router.put("/updateunit", updateUnit);
router.delete("/:id", deleteUnit);



export default router;