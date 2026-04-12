"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, MapPin, Save, X } from "lucide-react";
import { Country } from "@/types";
import { toast } from "sonner";
import { useAuthFetch } from "@/hooks/use-auth-fetch";

interface EditCountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  country: Country | null;
  onSuccess: () => void;
}

export function EditCountryModal({
  isOpen,
  onClose,
  country,
  onSuccess,
}: EditCountryModalProps) {
  const { authFetch, isLoading: isAuthLoading } = useAuthFetch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });

  // Initialize form data when country changes
  useEffect(() => {
    if (country) {
      setFormData({
        name: country.name || "",
        code: country.code || "",
      });
    }
  }, [country, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!country) return;
    if (!formData.name.trim()) {
      toast.error("Validation Error", {
        description: "Country name is required",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_BASE_API}/country/${country.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            code: formData.code.trim(),
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || "Failed to update country");
      }

      toast.success("Country Updated", {
        description: "Country information has been updated successfully.",
        duration: 3000,
      });

      onClose();
      onSuccess();
    } catch (error) {
      toast.error("Update Failed", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Edit Country
              </DialogTitle>
              <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400">
                Update country information
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Country Name */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2"
            >
              Country name <span className="text-red-500">*</span>
            </Label>
            <div className="relative group">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g. United Kingdom"
                className="pl-10 h-11 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all rounded-xl"
              />
            </div>
          </div>

          {/* Country Code */}
          <div className="space-y-2">
            <Label
              htmlFor="code"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2"
            >
              ISO Alpha-2 Code
            </Label>
            <div className="relative group">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. UK, BD, US"
                className="pl-10 h-11 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all rounded-xl"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-xl border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 transition-all active:scale-95 rounded-xl font-semibold"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
