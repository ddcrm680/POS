import { FileLightbox } from "@/components/common/FileLightbox";
import { getFileNameFromLabel, isPdfUrl } from "@/lib/utils";
import { EyeIcon } from "lucide-react";
import { useState } from "react";

export 
function Row({
    label,
    value,
    mono = false,
    filePath,
}: {
    label: string;
    value?: React.ReactNode;
    mono?: boolean;
    filePath?: string | null;
}) {
    const [open, setOpen] = useState(false);

    const isFile = Boolean(filePath);
    const fileName = filePath ? getFileNameFromLabel(label, filePath) : "-";
    const isPdf = filePath ? isPdfUrl(filePath) : false;

    return (
        <>
            <div className="grid grid-cols-12 gap-2 items-center">
                {/* LABEL */}
                <span className="col-span-4 text-[11px] text-muted-foreground">
                    {label}
                </span>

                {/* VALUE */}
                <div
                    className={`col-span-8 flex items-center gap-2 text-[13px] font-medium break-words ${mono ? "font-mono text-[12px]" : ""
                        }`}
                >
                    <span className="truncate max-w-[220px]">
                        {isFile ? fileName : value ?? "-"}
                    </span>

                    {isFile && (
                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            className="text-[#0000ff] hover:text-[#0000ff]/80"
                            title="View document"
                        >
                            <EyeIcon size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* LIGHTBOX */}
            {isFile && filePath && (
                <FileLightbox
                    open={open}
                    src={filePath}
                    isPdf={isPdf}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}