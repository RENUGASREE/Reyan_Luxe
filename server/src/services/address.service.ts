import { User, IAddress } from "../models/User.js";
import { AppError } from "../middleware/errorHandler.js";

export const addressService = {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};

export async function getUserAddresses(userId: string) {
  const user = await User.findById(userId).select("addresses").lean();
  if (!user) throw new AppError("User not found", 404);
  return user.addresses || [];
}

export async function createAddress(userId: string, addressData: Partial<IAddress>) {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  // Validate required fields
  if (!addressData.fullName || !addressData.line1 || !addressData.city || 
      !addressData.state || !addressData.postalCode || !addressData.phone) {
    throw new AppError("Missing required address fields", 400);
  }

  // Validate Indian PIN code (6 digits)
  if (addressData.postalCode && !/^\d{6}$/.test(addressData.postalCode)) {
    throw new AppError("Invalid Indian PIN code (must be 6 digits)", 400);
  }

  // Validate Indian phone number (10 digits, optionally with +91 prefix)
  const phoneDigits = addressData.phone.replace(/\D/g, "");
  if (phoneDigits.length !== 10 && phoneDigits.length !== 12) {
    throw new AppError("Invalid phone number", 400);
  }

  const newAddress: IAddress = {
    fullName: addressData.fullName,
    line1: addressData.line1,
    line2: addressData.line2,
    city: addressData.city,
    state: addressData.state,
    postalCode: addressData.postalCode,
    country: addressData.country || "India",
    phone: addressData.phone,
    label: addressData.label,
    isDefault: addressData.isDefault || false,
  };

  // If this is the first address or marked as default, set it as default
  if (!user.addresses || user.addresses.length === 0 || newAddress.isDefault) {
    newAddress.isDefault = true;
    // Unset other defaults
    user.addresses = user.addresses.map(a => ({ ...a, isDefault: false }));
  }

  user.addresses.push(newAddress);
  await user.save();

  return newAddress;
}

export async function updateAddress(userId: string, addressId: string, addressData: Partial<IAddress>) {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  const addressIndex = user.addresses.findIndex(a => (a as any)._id.toString() === addressId);
  if (addressIndex === -1) throw new AppError("Address not found", 404);

  // Validate PIN code if provided
  if (addressData.postalCode && !/^\d{6}$/.test(addressData.postalCode)) {
    throw new AppError("Invalid Indian PIN code (must be 6 digits)", 400);
  }

  // Validate phone if provided
  if (addressData.phone) {
    const phoneDigits = addressData.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10 && phoneDigits.length !== 12) {
      throw new AppError("Invalid phone number", 400);
    }
  }

  // Update address fields
  Object.assign(user.addresses[addressIndex], addressData);

  // If setting as default, unset others
  if (addressData.isDefault) {
    user.addresses = user.addresses.map((a, idx) => ({
      ...a,
      isDefault: idx === addressIndex,
    }));
  }

  await user.save();
  return user.addresses[addressIndex];
}

export async function deleteAddress(userId: string, addressId: string) {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  const addressIndex = user.addresses.findIndex(a => (a as any)._id.toString() === addressId);
  if (addressIndex === -1) throw new AppError("Address not found", 404);

  const wasDefault = user.addresses[addressIndex].isDefault;
  user.addresses.splice(addressIndex, 1);

  // If we deleted the default and there are other addresses, set the first one as default
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
}

export async function setDefaultAddress(userId: string, addressId: string) {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  const addressIndex = user.addresses.findIndex(a => (a as any)._id.toString() === addressId);
  if (addressIndex === -1) throw new AppError("Address not found", 404);

  user.addresses = user.addresses.map((a, idx) => ({
    ...a,
    isDefault: idx === addressIndex,
  }));

  await user.save();
}
