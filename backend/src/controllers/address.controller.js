const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

const findOwned = async (id, userId) => {
  const address = await prisma.address.findFirst({ where: { id, userId } });
  if (!address) throw AppError.notFound("Address not found");
  return address;
};

const list = async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  res.json({ success: true, data: addresses });
};

const getOne = async (req, res) => {
  res.json({ success: true, data: await findOwned(req.params.id, req.user.id) });
};

const create = async (req, res) => {
  const userId = req.user.id;
  const count = await prisma.address.count({ where: { userId } });
  const isDefault = req.body.isDefault || count === 0;

  const address = await prisma.$transaction(async (tx) => {
    if (isDefault) await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    return tx.address.create({ data: { ...req.body, isDefault, userId } });
  });

  res.status(201).json({ success: true, data: address });
};

const update = async (req, res) => {
  const userId = req.user.id;
  await findOwned(req.params.id, userId);

  const address = await prisma.$transaction(async (tx) => {
    if (req.body.isDefault) {
      await tx.address.updateMany({ where: { userId }, data: { isDefault: false } });
    }
    return tx.address.update({ where: { id: req.params.id }, data: req.body });
  });

  res.json({ success: true, data: address });
};

const remove = async (req, res) => {
  const address = await findOwned(req.params.id, req.user.id);

  const usedByOrders = await prisma.order.count({ where: { addressId: address.id } });
  if (usedByOrders) throw AppError.conflict("Address is linked to existing orders and cannot be deleted");

  await prisma.address.delete({ where: { id: address.id } });
  res.json({ success: true, message: "Address deleted" });
};

module.exports = { list, getOne, create, update, remove };
