const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");
const { storage } = require("../config/env");
const AppError = require("../utils/AppError");

const client =
  storage.url && storage.key
    ? createClient(storage.url, storage.key, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;

const EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const publicPrefix = storage.url ? `${storage.url}/storage/v1/object/public/${storage.bucket}/` : null;

const getBucket = () => {
  if (!client) throw new AppError(503, "Image storage is not configured");
  return client.storage.from(storage.bucket);
};

const uploadImage = async ({ buffer, mimetype }, folder) => {
  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${EXTENSIONS[mimetype]}`;
  const { error } = await getBucket().upload(path, buffer, {
    contentType: mimetype,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new AppError(502, `Image upload failed: ${error.message}`);
  return { path, url: `${publicPrefix}${path}` };
};

// Removes a file only if the URL points into our bucket; external URLs are left alone.
const removeImageByUrl = async (url) => {
  if (!client || !url?.startsWith(publicPrefix)) return;
  const { error } = await getBucket().remove([url.slice(publicPrefix.length)]);
  if (error) console.error("Failed to delete stored image:", error.message);
};

module.exports = { ALLOWED_IMAGE_TYPES: Object.keys(EXTENSIONS), uploadImage, removeImageByUrl };
