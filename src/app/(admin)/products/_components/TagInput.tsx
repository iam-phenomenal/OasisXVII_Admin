"use client";

import { KeyboardEvent, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TagInputProps = {
  label: string;
  placeholder: string;
  value: string[];
  onChange: (value: string[]) => void;
};

export function TagInput({
  label,
  placeholder,
  value,
  onChange,
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const nextValue = draft.trim();

    if (!nextValue || value.includes(nextValue)) {
      return;
    }

    onChange([...value, nextValue]);
    setDraft("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    addTag();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={label}
        />
        <Button type="button" variant="outline" onClick={addTag}>
          Add
        </Button>
      </div>

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="gap-1 rounded-full px-3 py-1"
            >
              <span>{tag}</span>
              <button
                type="button"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label={`Remove ${tag}`}
                onClick={() => onChange(value.filter((item) => item !== tag))}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No {label.toLowerCase()} added yet.
        </p>
      )}
    </div>
  );
}
