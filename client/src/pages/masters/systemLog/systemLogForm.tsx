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
      <div className="p-6 text-sm "><Loader /></div>
    </div>;
  }

  if (!log) return null;

  return (
    <Card>
      <CardContent className="p-6 space-y-8 overflow-auto max-h-[500px]">

        {/* ================= META ================= */}
        <div className="grid  grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <Info label="Operation" value={log.action.split('_').map((item: string) => item.substring(0, 1).toUpperCase() + item.substring(1)).join(' ')} />
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
        <div className="space-y-2 grid grid-cols-1 md:grid-cols-3 gap-6  text-sm">
          <Info
            label="Description"
            value={`${log.description}`}
          />
          <Info label="API URL" value={log.url} />
          <Info label="Client URL" value={log.client_url} />

        </div>

        {/* ================= DIFF ================= */}
        <div>
          <h4 className="text-sm font-semibold mb-3">
            Changes
          </h4>
          {log.meta && (log.meta.before || log.meta.after) ? (
            <BeforeAfterDiff
              before={log.meta.before}
              after={log.meta.after}
            />
          ) : (
            <MetaJsonViewer meta={log.meta} />
          )}
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
function renderValue(value: any) {
  if (value === null || value === undefined) {
    return <span className="italic text-gray-400">—</span>;
  }

  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((v, i) => (
          <div
            key={i}
            className="max-w-full px-2 py-0.5 bg-gray-100 rounded text-xs break-all"
          >
            {String(v)}
          </div>
        ))}
      </div>
    );
  }

  if (isObject(value)) {
    return (
      <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return <span>{String(value)}</span>;
}

function isObject(val: any) {
  return val !== null && typeof val === "object" && !Array.isArray(val);
}

function isEqualDeep(a: any, b: any): boolean {
  // same reference or same primitive
  if (a === b) return true;

  // array comparison
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, i) => isEqualDeep(item, b[i]));
  }

  // object comparison
  if (isObject(a) && isObject(b)) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every(
      key => isEqualDeep(a[key], b[key])
    );
  }

  return false;
}

function getDiff(before: any = {}, after: any = {}) {
  const keys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ]);

  return Array.from(keys).map((key) => {
    const beforeVal = before?.[key];
    const afterVal = after?.[key];

    const changed = !isEqualDeep(beforeVal, afterVal);

    return {
      key,
      before: beforeVal,
      after: afterVal,
      changed,
    };
  });
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
              {renderValue(before)}
            </div>

            {/* AFTER */}
            <div
              className={`break-all ${changed ? "font-semibold text-green-700" : "text-gray-600"
                }`}
            >
              {renderValue(after)}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

function MetaJsonViewer({ meta }: { meta?: any }) {
  if (!meta || Object.keys(meta).length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No changes recorded
      </p>
    );
  }

  return (
    <pre className="bg-gray-50 p-3 rounded text-xs max-h-60 overflow-auto">
      {JSON.stringify(meta, null, 2)}
    </pre>
  );
}