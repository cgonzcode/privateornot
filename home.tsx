import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFavoriteSchema } from "@shared/schema";
import { ArrowRight, Check, X, Star, StarOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Home() {
  const [checkUsername, setCheckUsername] = useState("");
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(insertFavoriteSchema),
    defaultValues: {
      username: "",
    },
  });

  // Query favorites
  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites"],
  });

  // Check privacy status
  const checkMutation = useMutation({
    mutationFn: async (username: string) => {
      const res = await apiRequest("POST", "/api/check", { username });
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Status Check Complete",
        description: `Account is ${data.isPrivate ? "private" : "public"}`,
      });
    },
  });

  // Add to favorites
  const addFavoriteMutation = useMutation({
    mutationFn: async (username: string) => {
      await apiRequest("POST", "/api/favorites", { username });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Success",
        description: "Added to favorites",
      });
    },
  });

  // Remove from favorites
  const removeFavoriteMutation = useMutation({
    mutationFn: async (username: string) => {
      await apiRequest("DELETE", `/api/favorites/${username}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Success",
        description: "Removed from favorites",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Private or Not
          </h1>
          <p className="text-muted-foreground">
            Check if an Instagram account is private or public
          </p>
        </div>

        {/* Search Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Enter Instagram username"
                value={checkUsername}
                onChange={(e) => setCheckUsername(e.target.value)}
              />
              <Button
                onClick={() => checkMutation.mutate(checkUsername)}
                disabled={checkMutation.isPending || !checkUsername}
              >
                {checkMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Button>
            </div>

            {checkMutation.data && (
              <div className="mt-4 flex items-center gap-2">
                {checkMutation.data.isPrivate ? (
                  <X className="h-5 w-5 text-red-500" />
                ) : (
                  <Check className="h-5 w-5 text-green-500" />
                )}
                <span>
                  This account is{" "}
                  <strong>
                    {checkMutation.data.isPrivate ? "private" : "public"}
                  </strong>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addFavoriteMutation.mutate(checkUsername)}
                  disabled={addFavoriteMutation.isPending}
                >
                  <Star className="h-4 w-4 mr-1" />
                  Add to Favorites
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Favorites Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Favorites</h2>
          <div className="grid gap-4">
            {favorites.map((favorite) => (
              <Card key={favorite.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{favorite.username}</span>
                    {favorite.isPrivate !== null && (
                      <>
                        {favorite.isPrivate ? (
                          <X className="h-4 w-4 text-red-500" />
                        ) : (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => checkMutation.mutate(favorite.username)}
                      disabled={checkMutation.isPending}
                    >
                      Refresh
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFavoriteMutation.mutate(favorite.username)}
                      disabled={removeFavoriteMutation.isPending}
                    >
                      <StarOff className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {favorites.length === 0 && (
              <p className="text-center text-muted-foreground">
                No favorites added yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
  
