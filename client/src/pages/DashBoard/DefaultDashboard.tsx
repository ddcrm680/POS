export default function DefaultDashboard() {
  return (
    <div className="flex-1 flex h-full items-center justify-center bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="flex flex-col items-center text-center gap-3">
        {/* Title */}
        <div className="py-10 text-center text-gray-500">
          No data found
        </div>
      </div>
    </div>
  );
}