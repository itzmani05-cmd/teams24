import { useRef, useState } from "react";
import { ImagePlus, Star, Trash2, Upload } from "lucide-react";
import { api } from "../api/client";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const MAX_BYTES = 5 * 1024 * 1024;

const useUploader = (folder, onUploaded) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = async (e) => {
    const files = [...e.target.files];
    e.target.value = "";
    if (!files.length) return;
    setError("");
    setUploading(true);
    try {
      for (const file of files) {
        if (file.size > MAX_BYTES) throw new Error(`${file.name} is larger than 5 MB`);
        const { url } = await api.upload("/admin/uploads", file, { folder });
        await onUploaded(url);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const input = (multiple) => (
    <input ref={inputRef} type="file" accept={ACCEPT} multiple={multiple} hidden onChange={handleFiles} />
  );

  return { open: () => inputRef.current?.click(), input, uploading, error };
};

export const ImageField = ({ label, name, value, onChange, folder = "products" }) => {
  const set = (url) => onChange({ target: { name, value: url } });
  const uploader = useUploader(folder, set);

  return (
    <div className="field">
      <label>{label}</label>
      <div className="flex items-center gap-3">
        {value ? (
          <img className="size-16 shrink-0 rounded-md bg-canvas object-cover" src={value} alt="" />
        ) : (
          <div className="grid size-16 shrink-0 place-items-center rounded-md bg-canvas text-muted">
            <ImagePlus size={20} />
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            className="input"
            name={name}
            type="url"
            placeholder="Upload a file or paste an image URL"
            value={value}
            onChange={onChange}
          />
          <div className="flex gap-2">
            <button type="button" className="btn btn-outline btn-sm" onClick={uploader.open} disabled={uploader.uploading}>
              <Upload size={14} /> {uploader.uploading ? "Uploading..." : "Upload"}
            </button>
            {value && (
              <button type="button" className="btn btn-outline btn-sm" onClick={() => set("")}>
                Remove
              </button>
            )}
          </div>
        </div>
        {uploader.input(false)}
      </div>
      {uploader.error && <div className="mt-1 text-sm text-danger">{uploader.error}</div>}
    </div>
  );
};

export const GalleryEditor = ({ images, onAdd, onRemove, onSetThumbnail, thumbnailUrl, folder = "products" }) => {
  const uploader = useUploader(folder, onAdd);

  return (
    <div className="field">
      <label>Gallery images</label>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {images.map((img) => (
          <div key={img.id ?? img.imageUrl} className="group relative aspect-square overflow-hidden rounded-md bg-canvas">
            <img className="size-full object-cover" src={img.imageUrl} alt="" />
            {thumbnailUrl === img.imageUrl && (
              <span className="absolute top-1 left-1 rounded bg-black/60 px-1 text-[10px] text-white">Thumbnail</span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-black/40 p-1 sm:opacity-0 sm:group-hover:opacity-100">
              {onSetThumbnail && thumbnailUrl !== img.imageUrl && (
                <button
                  type="button"
                  className="cursor-pointer rounded bg-white/90 p-1"
                  title="Use as thumbnail"
                  onClick={() => onSetThumbnail(img.imageUrl)}
                >
                  <Star size={12} />
                </button>
              )}
              <button
                type="button"
                className="cursor-pointer rounded bg-white/90 p-1 text-danger"
                title="Remove image"
                onClick={() => onRemove(img)}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="grid aspect-square cursor-pointer place-items-center rounded-md border border-dashed border-line text-xs text-muted hover:text-primary"
          onClick={uploader.open}
          disabled={uploader.uploading}
        >
          <span className="flex flex-col items-center gap-1">
            <ImagePlus size={18} />
            {uploader.uploading ? "Uploading..." : "Add"}
          </span>
        </button>
        {uploader.input(true)}
      </div>
      {uploader.error && <div className="mt-1 text-sm text-danger">{uploader.error}</div>}
    </div>
  );
};
