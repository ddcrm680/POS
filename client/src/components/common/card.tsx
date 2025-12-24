export const  SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white  rounded-xl p-5 pb-0">
    <h3 className="text-sm font-semibold mb-4 text-gray-700">{title}</h3>
    {children}
  </div>
);