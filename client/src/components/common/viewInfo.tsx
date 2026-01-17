export function Info({
  label,
  value,
  mono = false,
  link = false,
  justify,
  colon = true,
  gap='gap-2'
}: {
  label: string;
  value?: string;
  mono?: boolean;
  link?: boolean;
  justify?: string
  colon?: boolean
  gap?:string
}) {
  return (
    <div className={`flex text-[12px] ${gap}  ${justify ? justify : ""}`}>
      
      <p className="text-slate-500">{`${label} ${colon ? ":" : ""}`} </p>
      {link ? (
        <a
          href={value}
          target="_blank"
          className="text-blue-600 break-all hover:underline font-medium text-slate-800 font-[600]"
        >
          {value}
        </a>
      ) : (
        // "font-medium text-slate-800"
        <p className={`break-all font-[600] text-slate-800 font-[600] `}>
          {value || "-"}
        </p>
      )}
    </div>
  );
}