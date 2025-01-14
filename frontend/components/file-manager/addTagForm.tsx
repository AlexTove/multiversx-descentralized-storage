import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddTagFormProps {
  onAddTag: (tag: string) => void;
}

export function AddTagForm({ onAddTag }: AddTagFormProps) {
  const [tag, setTag] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tag.trim()) {
      onAddTag(tag.trim());
      setTag("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        placeholder="Enter tag"
        required
      />
      <div className="flex justify-end gap-2">
        <Button type="button">Cancel</Button>
        <Button type="submit">Add Tag</Button>
      </div>
    </form>
  );
}