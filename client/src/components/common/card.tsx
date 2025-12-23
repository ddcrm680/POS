export const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white  rounded-xl p-5 pb-2 space-y-4">
    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
      {title}
    </h3>
    {children}
  </div>
);