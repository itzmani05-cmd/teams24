const { uploadImage } = require("../lib/storage");

const uploadOne = async (req, res) => {
  const data = await uploadImage(req.file, req.query.folder);
  res.status(201).json({ success: true, data });
};

module.exports = { uploadOne };
