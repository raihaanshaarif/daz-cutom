"use client";

import { Courier } from "@/types";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Truck, MapPin, Phone, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ViewCourierPageProps {
  params: {
    id: string;
  };
}

export default function ViewCourierPage({ params }: ViewCourierPageProps) {
  const courierId = parseInt(params.id);
  const [courier, setCourier] = useState<Courier | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const userId = session?.user?.id ?? "";
  const userRole = session?.user?.role ?? "";
  const router = useRouter();

  useEffect(() => {
    if (!userId || !userRole) return;

    const fetchCourier = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API}/parcel/courier-companies/${courierId}`,
          {
            cache: "no-store",
            headers: {
              "user-id": userId,
              "user-role": userRole,
            },
          },
        );
        const data = await res.json();
        setCourier(data);
      } catch (error) {
        console.error("Failed to fetch courier:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourier();
  }, [userId, userRole, courierId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-2 px-4">
        <div className="w-full mx-auto">
          <div className="mb-4">
            <Skeleton className="h-10 w-32" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!courier) {
    return (
      <div className="min-h-screen bg-background py-2 px-4">
        <div className="w-full mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Courier not found</p>
            <Button
              onClick={() => router.push("/dashboard/courier")}
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Couriers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-2 px-4">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-4 flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/courier")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Couriers
          </Button>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-semibold">Courier Details</h1>
          </div>
        </div>

        {/* Courier Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              {courier.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Address</p>
                  <p className="text-sm text-gray-600">{courier.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Contact Number
                  </p>
                  <p className="text-sm text-gray-600">
                    {courier.contactNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Created At
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(courier.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Updated At
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(courier.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
