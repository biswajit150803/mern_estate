import { createListing, deleteListing, getLisitng, updateListing } from "../controllers/listing.controller.js";
import express from "express";
import { verifyToken } from "../utils/verifyUser.js";

const router=express.Router();

router.post('/create',verifyToken,createListing)
router.delete('/delete/:id',verifyToken,deleteListing)
router.post('/update/:id',verifyToken,updateListing)
router.get('/get/:id',getLisitng) //anyone can view listing details so no need to verify token
export default router;