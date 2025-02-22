"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface TodoFormProps {
  onSubmit: (title: string) => void;
  isLoading?: boolean;
}

export function TodoForm({ onSubmit, isLoading = false }: TodoFormProps) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && !isLoading) {
      onSubmit(title.trim());
      setTitle("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2 mb-4">
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter a new todo"
        className="flex-grow"
        required
        disabled={isLoading}
      />
      <Button type="submit" variant="outline" disabled={isLoading}>
        {isLoading ? (
          <div className="flex items-center">
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            <span className="opacity-75">Adding Todo...</span>
          </div>
        ) : (
          "Add Todo"
        )}
      </Button>
    </form>
  );
}
