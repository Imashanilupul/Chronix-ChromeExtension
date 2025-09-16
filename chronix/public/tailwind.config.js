module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    // Core layout classes
    'w-80', 'w-96', 'w-full', 'w-4', 'h-auto', 'h-4', 'max-h-96', 'max-h-20',
    // Padding and margin
    'p-1', 'p-2', 'p-3', 'p-4', 'px-2', 'px-3', 'px-4', 'py-1', 'py-2',
    'mb-0', 'mb-1', 'mb-2', 'mb-3', 'mb-4', 'mb-6', 'mt-2', 'ml-4',
    // Typography
    'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl',
    'font-medium', 'font-semibold', 'font-bold', 'text-center',
    // Colors
    'text-gray-500', 'text-gray-600', 'text-gray-700', 'text-gray-800', 'text-gray-900',
    'text-blue-400', 'text-blue-600', 'text-blue-800', 'text-green-600', 'text-red-600', 'text-white',
    'bg-white', 'bg-gray-50', 'bg-gray-100', 'bg-gray-600', 'bg-blue-50', 'bg-blue-100', 'bg-blue-600', 'bg-blue-700',
    // Borders
    'border', 'border-gray-200', 'border-gray-300', 'border-blue-400',
    'rounded', 'rounded-lg', 'rounded-xl',
    // Flexbox
    'flex', 'inline-flex', 'flex-1', 'items-center', 'justify-between', 'justify-center',
    'gap-2', 'space-x-2', 'space-y-2', 'space-y-4',
    // Position and overflow
    'sticky', 'top-0', 'overflow-hidden', 'overflow-y-auto',
    // Effects
    'shadow', 'transition',
    // Hover states
    'hover:underline', 'hover:bg-blue-50', 'hover:bg-blue-700', 'hover:bg-gray-100',
    // Font family
    'font-sans'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};