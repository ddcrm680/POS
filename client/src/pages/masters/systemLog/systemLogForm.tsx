import { Loader } from "@/components/common/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchServiceLogItem } from "@/lib/api";
import { formatDate, formatTime } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function SystemLogForm({
  initialValues,
  onClose,
}: any) {
  const [isLoading, setIsLoading] = useState(true);
  const [log, setLog] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res: any = await fetchServiceLogItem(initialValues.id);
        setLog(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    if (initialValues?.id) load();
  }, [initialValues?.id]);

  if (isLoading) {
    return <div className="min-h-[150px] flex justify-center items-center">
      <div className="p-6 text-sm "><Loader/></div>
    </div>;
  }

  if (!log) return null;

  return (
    <Card>
      <CardContent className="p-6 space-y-8 overflow-auto max-h-[500px]">

        {/* ================= META ================= */}
        <div className="grid  grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <Info label="Action" value={log.action.replaceAll("_", " ")} />
          <Info label="Date" value={`${formatDate(log.created_at)} ${formatTime(log.created_at)}`} />
          <Info
            label="Done By"
            value={`${log.actor.name} (${log.actor.email})`}
          />
          <Info
            label="Affected Entity"
            value={`${log.subject.type} #${log.subject.id}`}
          />
          <Info label="IP Address" value={log.ip_address} mono />
          <Info
            label="Browser / Platform"
            value={`${log.browser} · ${log.platform} · ${log.device_type}`}
          />
        </div>

        {/* ================= URLS ================= */}
        <div className="space-y-2 grid grid-cols-1 md:grid-cols-3 gap-6  text-xs">
          <Info label="API URL" value={log.url} link />
          <Info label="Client URL" value={log.client_url} link />
        </div>

        {/* ================= DIFF ================= */}
        <div>
          <h4 className="text-sm font-semibold mb-3">
            Changes
          </h4>
          <BeforeAfterDiff
            before={log.meta?.before}
            after={log.meta?.after}
          />
        </div>

      </CardContent>
    </Card>
  );
}
function Info({
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
    <div>
      <p className="text-gray-500">{label}</p>
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
function getDiff(before: any = {}, after: any = {}) {
  const keys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ]);

  return Array.from(keys).map((key) => ({
    key,
    before: before?.[key],
    after: after?.[key],
    changed: before?.[key] !== after?.[key],
  }));
}

function BeforeAfterDiff({
  before,
  after,
}: {
  before: any;
  after: any;
}) {
  const diffs = getDiff(before, after);

  if (!diffs.length) {
    return (
      <p className="text-sm text-gray-500">
        No changes recorded
      </p>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      
      {/* HEADER */}
      <div className="grid grid-cols-3 bg-gray-100 text-xs font-semibold text-gray-600 px-3 py-2 sticky top-0 z-10">
        <div>Field</div>
        <div>Before</div>
        <div>After</div>
      </div>

      {/* BODY */}
      <div className="max-h-[180px] overflow-y-auto divide-y">
        {diffs.map(({ key, before, after, changed }: any) => (
          <div
            key={key}
            className={`grid grid-cols-3 gap-3 px-3 py-2 text-sm
              ${changed ? "bg-yellow-50" : "bg-white"}
            `}
          >
            {/* FIELD NAME */}
            <div className="font-medium text-gray-700 capitalize">
              {key.replaceAll("_", " ")}
            </div>

            {/* BEFORE */}
            <div className="text-gray-600 break-all">
              {before ?? (
                <span className="italic text-gray-400">—</span>
              )}
            </div>

            {/* AFTER */}
            <div
              className={`break-all ${
                changed
                  ? "font-semibold text-green-700"
                  : "text-gray-600"
              }`}
            >
              {after ?? (
                <span className="italic text-gray-400">—</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

