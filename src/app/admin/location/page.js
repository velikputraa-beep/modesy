import Link from "next/link";
import { getCountriesAdmin, getStatesAdmin, getCitiesAdmin } from "@/lib/queries/admin-cms";

import { Globe, MapPin, Building, ChevronRight } from "lucide-react";

export default async function AdminLocationOverviewPage() {
  const [countries, states, cities] = await Promise.all([
    getCountriesAdmin(),
    getStatesAdmin(),
    getCitiesAdmin(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-gray-800">Location Settings</h1>
        <p className="text-xs text-gray-500 mt-1">
          Konfigurasi basis data wilayah geografis (negara, provinsi/negara bagian, dan kota)
        </p>
      </div>

      {/* 3 Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Globe className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Countries</h3>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{countries.length} Aktif</p>
            </div>
          </div>
          <Link
            href="/admin/location/countries"
            className="mt-4 pt-3 border-t border-gray-100 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-between"
          >
            Kelola Negara <ChevronRight className="size-4" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <MapPin className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">States / Provinces</h3>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{states.length} Terdaftar</p>
            </div>
          </div>
          <Link
            href="/admin/location/states"
            className="mt-4 pt-3 border-t border-gray-100 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-between"
          >
            Kelola Provinsi <ChevronRight className="size-4" />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <Building className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm">Cities</h3>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{cities.length} Terdaftar</p>
            </div>
          </div>
          <Link
            href="/admin/location/cities"
            className="mt-4 pt-3 border-t border-gray-100 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-between"
          >
            Kelola Kota <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
