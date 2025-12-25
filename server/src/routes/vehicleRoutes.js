import express from "express";
import { getVehiclesByHoaId ,getVehiclesByHoaIdOwner,getVehiclesByHoaIdOwnerId, getVehiclesByHoaIdUserId,
    getVehicleById, createVehicle, updateVehicle, deleteVehicle, 
    deleteVehiclesByStatusFlag, batchUpdateDateFields, 
    updateVehiclePayment, jjvrunquery,getVehiclesForUnitNumber} from "../controllers/vehicleController.js";
import validateRequest from "../middleware/validateRequest.js";
import { createVehicleSchema, updateVehicleSchema } from "../schemas/vehicleSchemas.js";

const router = express.Router();

router.post("/", validateRequest(createVehicleSchema), createVehicle);
router.post("/jjvrunquery/:hoaId", jjvrunquery);
router.put("/batch/update-dates", batchUpdateDateFields);
router.put("/:vehicleId", validateRequest(updateVehicleSchema), updateVehicle);
router.put("/payment/:vehicleId", updateVehiclePayment);
router.delete("/status/:statusFlag", deleteVehiclesByStatusFlag);
router.delete("/:vehicleId", deleteVehicle);
router.get("/id/:vehicleId", getVehicleById);
router.get("/:hoaId/allvehicles/:ownerid", getVehiclesByHoaIdUserId);
router.get("/:hoaId/rentervehicles/:unitNumber", getVehiclesForUnitNumber);

router.get("/:hoaId/:role(owner|renter|admin)/:ownerid", getVehiclesByHoaIdOwnerId);

router.get("/:hoaId/:role",getVehiclesByHoaIdOwner);
router.get("/:hoaId", getVehiclesByHoaId);

export default router;
