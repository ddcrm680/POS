
export const RequiredMark = ({ show }: { show: boolean }) =>
  show ? <span className="text-red-500 ml-1">*</span> : null;
