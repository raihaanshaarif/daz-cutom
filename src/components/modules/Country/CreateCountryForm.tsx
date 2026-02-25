"use client";
import { createCountry } from "@/actions/create";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, MapPin, UserRoundPlus } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateCountryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      // Log form data values for debugging
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      const result = await createCountry(formData);
      console.log("createCountry result:", result);

      if (result?.id) {
        toast.success("Country created successfully!", {
          description: "The new country has been added to your list.",
          duration: 4000,
        });
        setTimeout(() => {
          router.push("/dashboard/country-list");
        }, 1500);
      } else {
        toast.error("Failed to create country", {
          description: "Please check your information and try again.",
        });
      }
    } catch (e) {
      toast.error("An error occurred", {
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-2 px-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg mb-2 shadow-md">
            <UserRoundPlus className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-1">
            Add New Country
          </h1>
          <p className="text-gray-500 text-xs">
            Add a new country to your database.
          </p>
        </div>

        <form
          action={handleSubmit}
          className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden"
        >
          <div className="p-4 lg:p-6">
            {/* Country Name */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-md flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-sm font-medium text-gray-900">
                  Country Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Country Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-xs font-medium text-gray-700 flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Country Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="Enter country name"
                    className="h-8 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                  />
                </div>

                {/* Country Code */}
                <div className="space-y-2">
                  <Label
                    htmlFor="code"
                    className="text-xs font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    ISO Country Code
                  </Label>
                  <Input
                    id="code"
                    name="code"
                    placeholder="e.g. US, CA, NG"
                    className="h-8 border-gray-200 focus:border-green-500 focus:ring-green-500/20 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-3 border-t border-gray-100">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-9 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Country...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserRoundPlus className="w-5 h-5" />
                    Create Country
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
