import { Controller } from "react-hook-form";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const toolbarOptions = [
  [{ font: [] }],
  ["bold", "italic", "underline"],
  [{ color: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link", "image"],
  ["clean"],
];

export function RichTextEditor({
  name,
  control,
  label,
  isRequired,
  isView,
}: {
  name: string;
  control: any;
  label: string;
  isRequired?: boolean;
  isView?: boolean;
}) {
  return (
    <div className="w-full">
      <p className="text-sm font-medium mb-1">
        {label}
        {isRequired && <span className="text-red-500"> *</span>}
      </p>

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <ReactQuill
            theme="snow"
            value={field.value || ""}
            onChange={field.onChange}
            readOnly={isView}
            modules={{ toolbar: toolbarOptions }}
            className="bg-white"
          />
        )}
      />
    </div>
  );
}