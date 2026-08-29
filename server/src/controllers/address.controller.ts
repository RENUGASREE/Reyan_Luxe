import { Request, Response, NextFunction } from "express";
import { addressService } from "../services/address.service.js";

export async function getAddresses(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("User not authenticated");
    
    const addresses = await addressService.getUserAddresses(userId);
    res.json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
}

export async function createAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("User not authenticated");
    
    const address = await addressService.createAddress(userId, req.body);
    res.json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
}

export async function updateAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("User not authenticated");
    
    const { addressId } = req.params;
    const address = await addressService.updateAddress(userId, addressId, req.body);
    res.json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
}

export async function deleteAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("User not authenticated");
    
    const { addressId } = req.params;
    await addressService.deleteAddress(userId, addressId);
    res.json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export async function setDefaultAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new Error("User not authenticated");
    
    const { addressId } = req.params;
    await addressService.setDefaultAddress(userId, addressId);
    res.json({ success: true, message: "Default address updated" });
  } catch (error) {
    next(error);
  }
}
