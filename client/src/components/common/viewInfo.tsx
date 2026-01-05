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
    <div className={`flex ${gap}  ${justify ? justify : ""}`}>
      <p className="text-gray-500 whitespace-nowrap">{`${label} ${colon ? ":" : ""}`} </p>
      {link ? (
        <a
          href={value}
          target="_blank"
          className="text-blue-600 break-all hover:underline"
        >
          {value}
        </a>
      ) : (
        <p className={`break-all ${mono ? "font-mono" : ""}`}>
          {value || "-"}
        </p>
      )}
    </div>
  );
}