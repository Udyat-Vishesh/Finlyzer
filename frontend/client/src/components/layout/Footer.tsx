import { ChartLine } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <a href="#" className="text-gray-500 hover:text-gray-700 flex items-center">
              <ChartLine className="text-primary text-xl mr-2 h-5 w-5" />
              <span className="font-medium">Finlyzer</span>
            </a>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Finlyzer. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
