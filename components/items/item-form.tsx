"use client";

import React from "react"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Upload, X } from "lucide-react";

const categories = [
  "Electronics",
  "Clothing",
  "Books",
  "Accessories",
  "Documents",
  "Keys",
  "Bags",
  "Sports Equipment",
  "Other",
];

interface ItemFormProps {
  mode?: "create" | "edit";
  initialData?: {
    _id?: string;
    title?: string;
    description?: string;
    category?: string;
    type?: "lost" | "found";
    location?: string;
    date?: string;
    imageUrl?: string;
    imageData?: {
      data: string;
      contentType: string;
      size: number;
    };
    contactInfo?: string;
  };
}

export function ItemForm({ mode = "create", initialData }: ItemFormProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    type: initialData?.type || "lost",
    location: initialData?.location || "",
    date: initialData?.date?.split("T")[0] || new Date().toISOString().split("T")[0],
    imageUrl: initialData?.imageUrl || "",
    imageData: initialData?.imageData || null,
    imagePreview: initialData?.imageData ? `data:${initialData.imageData.contentType};base64,${initialData.imageData.data}` : "",
    contactInfo: initialData?.contactInfo || session?.user?.email || "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Image size must be less than 5MB');
      return;
    }

    setImageError("");
    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData({ ...formData, imagePreview: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setFormData({ ...formData, imagePreview: "", imageData: null });
    setImageError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('contactInfo', formData.contactInfo);
      
      // Append image if exists
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      
      // For edit mode, handle image removal
      if (mode === "edit" && !imageFile && !formData.imagePreview && initialData?.imageData) {
        formDataToSend.append('removeImage', 'true');
      }

      const url = mode === "edit" ? `/api/items/${initialData?._id}` : "/api/items";
      const method = mode === "edit" ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save item");
      }

      router.push(`/items/${data.item._id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-foreground">
          {mode === "edit" ? "Edit Item" : "Report an Item"}
        </CardTitle>
        <CardDescription>
          {mode === "edit"
            ? "Update the details of your item"
            : "Fill in the details to report a lost or found item"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label>Item Type</Label>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value as "lost" | "found" })
              }
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lost" id="lost" />
                <Label htmlFor="lost" className="cursor-pointer font-normal">
                  I lost something
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="found" id="found" />
                <Label htmlFor="found" className="cursor-pointer font-normal">
                  I found something
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Black iPhone 15 Pro"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide a detailed description including any identifying features..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date Lost/Found</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Library, Building A Room 101"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            <div className="space-y-3">
              {formData.imagePreview ? (
                <div className="relative">
                  <img 
                    src={formData.imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <div className="mt-4">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-foreground">
                          Click to upload image
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          PNG, JPG, GIF up to 5MB
                        </span>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>
                </div>
              )}
              {imageError && (
                <div className="text-sm text-destructive">
                  {imageError}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactInfo">Contact Information</Label>
            <Input
              id="contactInfo"
              placeholder="Email or phone number"
              value={formData.contactInfo}
              onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "edit" ? "Update Item" : "Submit Report"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
