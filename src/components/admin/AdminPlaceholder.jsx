import { Construction } from "lucide-react";

export function AdminPlaceholder({ title }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-12 text-center">
        <Construction className="size-16 text-gray-300 mx-auto" />
        <p className="text-gray-500 mt-4 font-medium text-sm">
          Halaman {title} akan tersedia segera
        </p>
      </div>
    </div>
  );
}
