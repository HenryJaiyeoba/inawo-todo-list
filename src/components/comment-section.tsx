"use client";

import type React from "react";

import { useState } from "react";
import type { Comment, Vendor } from "@/types/todo";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CommentSectionProps {
  taskId: string;
  comments: Comment[];
  onAddComment: (taskId: string, comment: string, isVendor?: boolean) => void;
  vendors?: Vendor[];
  assignedVendorId?: string;
}

export default function CommentSection({
  taskId,
  comments,
  onAddComment,
  vendors = [],
  assignedVendorId,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [commentAs, setCommentAs] = useState<"user" | "vendor">("user");

  const assignedVendor = vendors.find((v) => v.id === assignedVendorId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    onAddComment(taskId, newComment, commentAs === "vendor");
    setNewComment("");
  };

  return (
    <div className="space-y-4">
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                {comment.isVendor ? (
                  <AvatarFallback className="bg-amber-100 text-amber-800">
                    {vendors
                      .find((v) => v.id === comment.authorId)
                      ?.name.charAt(0) || "V"}
                  </AvatarFallback>
                ) : (
                  <AvatarFallback>U</AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {comment.isVendor
                      ? vendors.find((v) => v.id === comment.authorId)?.name ||
                        "Vendor"
                      : "You"}
                  </span>
                  {comment.isVendor && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      Vendor
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(
                    new Date(comment.timestamp),
                    "MMM d, yyyy 'at' h:mm a"
                  )}
                </div>
                <p className="text-sm">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No comments yet.</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full"
          rows={2}
        />

        {assignedVendorId && (
          <div className="flex items-center gap-2">
            <Select
              value={commentAs}
              onValueChange={(value: "user" | "vendor") => setCommentAs(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Comment as..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Comment as yourself</SelectItem>
                <SelectItem value="vendor">
                  Comment as {assignedVendor?.name || "Vendor"}
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="text-xs text-muted-foreground">
              For demonstration purposes, you can comment as either the user or
              the vendor
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" size="sm">
            Add Comment
          </Button>
        </div>
      </form>
    </div>
  );
}
