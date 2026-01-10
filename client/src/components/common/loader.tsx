export function Loader({ isShowLoadingText = true, color = "",loaderSize=5 }: {loaderSize?:number, isShowLoadingText?: boolean, color?: string }) {
  return <div className="flex items-center justify-center gap-3 text-gray-500">

    <svg
      className={`h-${loaderSize} w-${loaderSize} animate-spin text-[${color ?? ""}]`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
    {isShowLoadingText && <span className="text-sm">Loading...</span>}
  </div>
}