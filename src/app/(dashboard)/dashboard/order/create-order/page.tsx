import CreateOrderForm from "@/components/modules/Order/CreateOrderForm";

export default function CreateOrderPage() {
  return (
    <div className="min-h-screen bg-background py-2 px-4">
      <div className="w-full mx-auto">
        <div className="w-full bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div className="p-3 lg:p-4">
            <CreateOrderForm />
          </div>
        </div>
      </div>
    </div>
  );
}
