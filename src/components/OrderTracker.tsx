import { OrderStatus, ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from "@/types";

interface OrderTrackerProps {
  status: OrderStatus;
}

export default function OrderTracker({ status }: OrderTrackerProps) {
  if (status === "cancelled") {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-center text-sm font-medium text-red-700">
        This order has been cancelled.
      </div>
    );
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);

  return (
    <div className="space-y-0">
      {ORDER_STATUS_FLOW.map((step, index) => {
        const isComplete = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  isComplete
                    ? "bg-orange-500 text-white"
                    : "bg-gray-200 text-gray-400"
                } ${isCurrent ? "ring-4 ring-orange-100" : ""}`}
              >
                {isComplete ? "✓" : index + 1}
              </div>
              {index < ORDER_STATUS_FLOW.length - 1 && (
                <div
                  className={`w-0.5 flex-1 min-h-[24px] ${
                    index < currentIndex ? "bg-orange-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
            <div className={`pb-6 ${isCurrent ? "" : "opacity-60"}`}>
              <p
                className={`text-sm font-semibold ${
                  isCurrent ? "text-orange-600" : "text-gray-700"
                }`}
              >
                {ORDER_STATUS_LABELS[step]}
              </p>
              {isCurrent && (
                <p className="text-xs text-gray-500">Current status</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
