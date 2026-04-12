"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Loader2, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImageUploadProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  maxFileSizeMb?: number;
  folder?: string;
};

type ImageKitAuth = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
};

function isImageKitAuth(payload: unknown): payload is ImageKitAuth {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Record<string, unknown>;

  return (
    typeof candidate.token === "string" &&
    typeof candidate.expire === "number" &&
    typeof candidate.signature === "string" &&
    typeof candidate.publicKey === "string"
  );
}

type UploadingFile = {
  id: string;
  name: string;
};

type SortableImageProps = {
  index: number;
  isBusy: boolean;
  onRemove: (url: string) => void;
  url: string;
};

function SortableImage({ index, isBusy, onRemove, url }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/40",
        isDragging && "opacity-60 shadow-lg",
      )}
    >
      <button
        type="button"
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        aria-label={`Reorder image ${index + 1}`}
        {...attributes}
        {...listeners}
      />
      <Image
        src={url}
        alt={`Uploaded image ${index + 1}`}
        fill
        className="object-cover"
        sizes="96px"
      />
      {index === 0 ? (
        <span className="absolute left-2 top-2 rounded-full bg-background/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground">
          Cover
        </span>
      ) : null}
      <Button
        type="button"
        variant="secondary"
        size="icon-xs"
        className="absolute right-2 top-2 z-10"
        onClick={() => onRemove(url)}
        disabled={isBusy}
        aria-label={`Remove image ${index + 1}`}
      >
        <X />
      </Button>
    </div>
  );
}

async function fetchImageKitAuth(): Promise<ImageKitAuth> {
  const response = await fetch("/api/admin/imagekit-auth", {
    method: "GET",
    cache: "no-store",
  });

  const payload = (await response.json()) as ImageKitAuth | { error?: string };

  if (!response.ok || ("error" in payload && payload.error)) {
    throw new Error(
      ("error" in payload ? payload.error : undefined) ??
        "Failed to authenticate image upload.",
    );
  }

  if (!isImageKitAuth(payload)) {
    throw new Error("Invalid upload authentication response.");
  }

  return payload;
}

async function uploadFile({
  auth,
  file,
  fileName,
  folder,
}: {
  auth: ImageKitAuth;
  file: File;
  fileName: string;
  folder: string;
}) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("fileName", fileName);
  formData.append("publicKey", auth.publicKey);
  formData.append("token", auth.token);
  formData.append("expire", String(auth.expire));
  formData.append("signature", auth.signature);
  formData.append("folder", folder);

  const response = await fetch(
    "https://upload.imagekit.io/api/v1/files/upload",
    {
      method: "POST",
      body: formData,
    },
  );

  const payload = (await response.json()) as { url?: string; message?: string };

  if (!response.ok || !payload.url) {
    throw new Error(payload.message ?? "Image upload failed.");
  }

  return payload.url;
}

export function ImageUpload({
  value,
  onChange,
  maxImages = 8,
  maxFileSizeMb = 5,
  folder = "/oasisxvii/products",
}: ImageUploadProps) {
  const fileInputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  const isBusy = uploadingFiles.length > 0;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = value.findIndex((url) => url === active.id);
    const newIndex = value.findIndex((url) => url === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    onChange(arrayMove(value, oldIndex, newIndex));
  };

  const handleRemove = (url: string) => {
    onChange(value.filter((imageUrl) => imageUrl !== url));
  };

  const handleSelectFiles = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    const remainingSlots = maxImages - value.length;

    if (remainingSlots <= 0) {
      toast.error(`You can upload up to ${maxImages} images.`);
      event.target.value = "";
      return;
    }

    const oversized = selectedFiles.find(
      (file) => file.size > maxFileSizeMb * 1024 * 1024,
    );

    if (oversized) {
      toast.error(
        `${oversized.name} exceeds the ${maxFileSizeMb} MB file size limit.`,
      );
      event.target.value = "";
      return;
    }

    const filesToUpload = selectedFiles.slice(0, remainingSlots);

    if (selectedFiles.length > filesToUpload.length) {
      toast.error(`Only ${remainingSlots} upload slots remaining.`);
    }

    const pending = filesToUpload.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${index}`,
      name: file.name,
    }));

    setUploadingFiles((current) => [...current, ...pending]);

    try {
      const auth = await fetchImageKitAuth();
      const uploadedUrls: string[] = [];

      for (const file of filesToUpload) {
        const sanitizedName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
        const url = await uploadFile({
          auth,
          file,
          fileName: sanitizedName,
          folder,
        });
        uploadedUrls.push(url);
      }

      if (uploadedUrls.length > 0) {
        onChange([...value, ...uploadedUrls]);
        toast.success(
          uploadedUrls.length === 1
            ? "Image uploaded."
            : `${uploadedUrls.length} images uploaded.`,
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Image upload failed.",
      );
    } finally {
      setUploadingFiles((current) =>
        current.filter(
          (item) => !pending.some((pendingItem) => pendingItem.id === item.id),
        ),
      );
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        id={fileInputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleSelectFiles}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={isBusy || value.length >= maxImages}
        >
          {isBusy ? <Loader2 className="animate-spin" /> : <UploadCloud />}
          Upload images
        </Button>
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, or WebP up to {maxFileSizeMb} MB each.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card/60 p-4">
        {value.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={value}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex flex-wrap gap-3">
                {value.map((url, index) => (
                  <SortableImage
                    key={url}
                    url={url}
                    index={index}
                    onRemove={handleRemove}
                    isBusy={isBusy}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <label
            htmlFor={fileInputId}
            className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background/40 px-4 py-6 text-center"
          >
            <UploadCloud className="mb-3 h-5 w-5 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              Upload hero images
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Drag ordering becomes available after the first upload.
            </p>
          </label>
        )}

        {uploadingFiles.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {uploadingFiles.map((file) => (
              <div
                key={file.id}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="max-w-40 truncate">Uploading {file.name}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
