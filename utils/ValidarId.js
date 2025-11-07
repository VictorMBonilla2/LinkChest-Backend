import mongoose from "mongoose";

export const validarIDEntrante = (id) => {

  if (typeof id !== "string") return false;

  const hex24 = /^[a-fA-F0-9]{24}$/;
  if (!hex24.test(id)) return false;

  // Evitar el caso "000000000000000000000000"
  if (id === "000000000000000000000000") return false;

  return mongoose.Types.ObjectId.isValid(id);
};
