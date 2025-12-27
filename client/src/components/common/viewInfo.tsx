export function Info({
  label,
  value,
  mono = false,
  link = false,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  link?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <p className="text-gray-500 whitespace-nowrap">{`${label} :`} </p>
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