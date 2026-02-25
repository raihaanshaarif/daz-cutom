import Link from "next/link";

export default async function Hero() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        {/* Company Logo/Brand */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
            <span className="text-2xl font-bold text-white">DAZ</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6 leading-tight">
          DAZ International
          <br />
          <span className="text-3xl md:text-4xl font-normal text-gray-600">
            Employee Dashboard
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
          Streamline workforce management with intelligent contact tracking,
          performance monitoring, and organizational insights—all in one
          professional platform.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors duration-200"
          >
            Access Dashboard
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg shadow-sm transition-colors duration-200"
          >
            Sign In
          </Link>
        </div>

        {/* Optional: Trust indicators or features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Secure & Compliant
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Real-time Analytics
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Team Collaboration
          </div>
        </div>
      </div>
    </div>
  );
}
