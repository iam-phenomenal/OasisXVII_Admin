"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ImageUploadProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  maxFileSizeMb?: number;
  persistedUrls?: string[];
};

type UploadAuthResponse = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
};

type UploadState = Record<string, string>;

type SortableImageProps = {
  index: number;
  url: string;
  onRemove: (url: string) => void;
};

function SortableImage({ index, url, onRemove }: SortableImageProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: url,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted"
      {...attributes}
      {...listeners}
    >
      <Image
        src={url}
        alt="Product image"
        fill
        className="object-cover"
        sizes="80px"
      />
      {index === 0 ? (
        <Badge className="absolute left-2 top-2 bg-background/90 text-foreground">
          Cover
        </Badge>
      ) : null}
      <button
        type="button"
        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-sm text-foreground"
        aria-label="Remove image"
        onClick={() => onRemove(url)}
      >
        ×
      </button>
    </div>
  );
}

export function ImageUpload({
  value,
  onChange,
  maxImages = 8,
  maxFileSizeMb = 5,
  persistedUrls = [],
}: ImageUploadProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState<UploadState>({});
  const [confirmUrl, setConfirmUrl] = useState<string | null>(null);
  const persistedUrlSet = useMemo(
    () => new Set(persistedUrls),
    [persistedUrls],
  );

  const removeUrl = (url: string) => {
    onChange(value.filter((entry) => entry !== url));
    setConfirmUrl(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = value.indexOf(String(active.id));
    const newIndex = value.indexOf(String(over.id));

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    onChange(arrayMove(value, oldIndex, newIndex));
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) {
      return;
    }

    const files = Array.from(fileList);
    const errors: string[] = [];

    if (value.length + files.length > maxImages) {
      errors.push(`You can upload up to ${maxImages} images.`);
    }

    const validFiles = files.filter((file) => {
      const valid = file.size <= maxFileSizeMb * 1024 * 1024;

      if (!valid) {
        errors.push(`${file.name} exceeds ${maxFileSizeMb}MB.`);
      }

      return valid;
    });

    setUploadErrors(errors);

    if (
      errors.length > 0 ||
      validFiles.length === 0 ||
      value.length + validFiles.length > maxImages
    ) {
      if (inputRef.current) {
        inputRef.current.value = "";
      }

      return;
    }

    let nextUrls = [...value];

    for (const file of validFiles) {
      setUploading((current) => ({ ...current, [file.name]: "Uploading..." }));

      try {
        const authResponse = await fetch("/api/admin/imagekit-auth", {
          cache: "no-store",
        });

        if (!authResponse.ok) {
          throw new Error("Could not authorize image upload.");
        }

        const authData = (await authResponse.json()) as UploadAuthResponse;
        const body = new FormData();

        body.append("file", file);
        body.append("fileName", file.name);
        body.append("publicKey", authData.publicKey);
        body.append("token", authData.token);
        body.append("expire", String(authData.expire));
        body.append("signature", authData.signature);
        body.append("folder", "/oasisxvii/products");

        const uploadResponse = await fetch(
          "https://upload.imagekit.io/api/v1/files/upload",
          {
            method: "POST",
            body,
          },
        );

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed for ${file.name}.`);
        }

        const payload = (await uploadResponse.json()) as { url?: string };

        if (!payload.url) {
          throw new Error(`Upload failed for ${file.name}.`);
        }

        nextUrls = [...nextUrls, payload.url];
        onChange(nextUrls);
        setUploadErrors([]);
      } catch (error) {
        setUploadErrors((current) => [
          ...current,
          error instanceof Error
            ? error.message
            : `Upload failed for ${file.name}.`,
        ]);
      } finally {
        setUploading((current) => {
          const next = { ...current };
          delete next[file.name];
          return next;
        });
      }
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(event) => void handleFiles(event.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
        >
          Upload Images
        </Button>
        <p className="text-sm text-muted-foreground">
          Up to {maxImages} images. JPEG, PNG, or WebP. Max {maxFileSizeMb}MB
          each.
        </p>
      </div>

      {Object.keys(uploading).length > 0 ? (
        <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
          {Object.entries(uploading).map(([fileName, status]) => (
            <p key={fileName} className="text-sm text-muted-foreground">
              {fileName}: {status}
            </p>
          ))}
        </div>
      ) : null}

      {uploadErrors.length > 0 ? (
        <div className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {uploadErrors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : null}

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
                  onRemove={(nextUrl) => {
                    if (persistedUrlSet.has(nextUrl)) {
                      setConfirmUrl(nextUrl);
                      return;
                    }

                    removeUrl(nextUrl);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
          Upload images to build the product gallery.
        </div>
      )}

      <AlertDialog
        open={Boolean(confirmUrl)}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmUrl(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove saved image?</AlertDialogTitle>
            <AlertDialogDescription>
              This image is already part of the product. Remove it from the
              gallery?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => confirmUrl && removeUrl(confirmUrl)}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
