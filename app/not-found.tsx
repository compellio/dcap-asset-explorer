import Link from 'next/link';
import Header from '@/components/Header';

export default function NotFound() {
  return (
    <main>
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-9xl font-extrabold text-indigo-600">404</h1>
        <h2 className="mt-2 text-3xl font-semibold text-gray-800">Page Not Found</h2>
        <p className="mt-4 text-lg text-gray-600">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
