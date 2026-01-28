"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Package } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ItemCardProps {
  item: {
    _id: string;
    title: string;
    description: string;
    category: string;
    type: "lost" | "found";
    status: "open" | "claimed" | "resolved";
    location: string;
    date: string;
    imageUrl?: string;
    imageData?: {
      data: string;
      contentType: string;
      size: number;
    };
    createdAt: string;
  };
}

export function ItemCard({ item }: ItemCardProps) {
  const statusColors = {
    open: "bg-success/10 text-success border-success/20",
    claimed: "bg-warning/10 text-warning border-warning/20",
    resolved: "bg-muted text-muted-foreground border-border",
  };

  const typeColors = {
    lost: "bg-destructive/10 text-destructive border-destructive/20",
    found: "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <Link href={`/items/${item._id}`}>
      <Card className="group h-full overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {(item.imageUrl || item.imageData) ? (
            <img
              src={
                item.imageUrl || 
                (item.imageData ? `data:${item.imageData.contentType};base64,${item.imageData.data}` : "/placeholder.svg")
              }
              alt={item.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          <div className="absolute left-3 top-3 flex gap-2">
            <Badge variant="outline" className={typeColors[item.type]}>
              {item.type === "lost" ? "Lost" : "Found"}
            </Badge>
          </div>
          <div className="absolute right-3 top-3">
            <Badge variant="outline" className={statusColors[item.status]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-1 font-semibold text-foreground group-hover:text-primary">
            {item.title}
          </h3>
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {item.description}
          </p>
          <Badge variant="secondary" className="text-xs">
            {item.category}
          </Badge>
        </CardContent>

        <CardFooter className="flex flex-col items-start gap-2 border-t border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{item.location}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
