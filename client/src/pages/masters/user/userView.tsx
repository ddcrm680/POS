import CommonTable from "@/components/common/CommonTable";
import { EmptyState } from "@/components/common/emptyState";
import { Loader } from "@/components/common/loader";
import { Info } from "@/components/common/viewInfo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchServiceLogItem, fetchUserList, fetchUserLogInfo } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { UserApiType } from "@/lib/types";
import { formatDate, formatTime, getDiff, isObject } from "@/lib/utils";
import { Box } from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";

export default function UserView({
  info
}: { info: any }) {
  const { user, roles } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [roleList, setRoleList] = useState<any>();
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<Array<any>>([]);
  const [has_next, setHasNext] = useState(false)

  const PER_PAGE = 10;

  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const columns = useMemo(() => [
    /* ================= DATE ================= */
    {
      key: "created_at",
      label: "Date",
      width: "130px",
      align: "center",
      render: (_: any, row: any) => (
        <Box className="flex flex-col items-center">
          <span className="font-semibold text-xs">
            {formatDate(row.created_at)}
          </span>
          <span className="text-xs text-gray-600 text-xs">
            {formatTime(row.created_at)}
          </span>
        </Box>
      ),
    },

    /* ================= OPERATION ================= */
    {
      key: "action",
      label: "Operation",
      width: "160px",
      render: (_: any, row: any) => (
        <span className="font-medium whitespace-nowrap text-xs">
          {row.action
            ?.split("_")
            .map((w: string) => w[0].toUpperCase() + w.slice(1))
            .join(" ")}
        </span>
      ),
    },

    /* ================= DONE BY ================= */
    {
      key: "actor",
      label: "Done By",
      width: "160px",
      render: (_: any, row: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-xs">
            {row.actor?.name ?? "-"}
          </span>
          <span className="text-xs text-gray-500 text-xs">
            {row.actor?.email ?? ""}
          </span>
        </div>
      ),
    },

    /* ================= AFFECTED ENTITY ================= */
    {
      key: "subject",
      label: "Affected Entity",
      width: "160px",
      render: (_: any, row: any) => (
        <span className="whitespace-nowrap text-xs">
          {row.subject?.type ?? "-"} #{row.subject?.id ?? "-"}
        </span>
      ),
    },

    /* ================= PLATFORM ================= */
    {
      key: "platform",
      label: "Browser / Platform",
      width: "200px",
      render: (_: any, row: any) => (
        <span className="text-xs">
          {row.browser} · {row.platform} · {row.device_type}
        </span>
      ),
    },

    /* ================= CHANGES ================= */
    {
      key: "changes",
      label: "Changes",
      width: "300px",
      render: (_: any, row: any) => {
        const before = row.meta?.before;
        const after = row.meta?.after;

        if (!before && !after) {
          return <span className="text-gray-400">—</span>;
        }

        return (
          <div
            className="
          max-h-[80px]
          overflow-y-auto
          pr-2
          scrollbar-thin
        "
          >
            <MiniBeforeAfterDiff before={before} after={after} />
          </div>
        );
      },
    }
  ], [page, PER_PAGE,]);
  useEffect(() => {
    setRoleList(roles || [])
  }, [roles])

  const fetchUserInfo = async (isLoaderHide = false) => {
    try {
      if (!isLoaderHide)
        setIsLoading(true);
      const res = await fetchUserLogInfo({
        id: info.id,
        per_page: perPage,
        page,
      });

      const mappedUsers = res?.data?.logs?.data
      setUserInfo(res?.data?.user)
      setTotal(res?.data?.logs?.meta?.total)
      setUsers(mappedUsers);
      setHasNext(res?.data?.logs?.meta?.has_next)
      setLastPage(res?.data?.logs?.meta?.last_page);
    } catch (e) {
      console.error(e);

    } finally {
      if (!isLoaderHide)
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [search, page, perPage]);
  if (isLoading) {
    return <div className="min-h-[150px] flex justify-center items-center">
      <div className="p-6 text-sm "><Loader /></div>
    </div>;
  }

  return (
    <Card>
      <CardContent className="mb-2 p-6 space-y-6 overflow-auto max-h-[500px]">
        {!userInfo ? (
          <EmptyState message="No info found" />

        ) : (
          <div className="space-y-4">

            {/* ================= META ================= */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <Info label="Name" value={userInfo.name} />
              <Info label="Email" value={userInfo.email} />
              <Info label="Phone" value={userInfo.phone} />
              <Info label="Role" value={roleList && roleList.length > 0 ? roleList.find((role: { name: string, id: number, slug: string }) => role.slug === userInfo?.role?.slug)?.name : "-"} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 text-sm ">
              <Info label="Address" value={userInfo.address} />

            </div>
            {/* ================= Logs ================= */}
            <div>
              <h4 className="text-sm font-semibold">
                Log History
              </h4>

              <CommonTable
                columns={columns}
                searchable={false}
                data={users}
                perPage={perPage}
                setPerPage={setPerPage}
                isLoading={isLoading}
                total={total}
                tabType=""
                hasNext={has_next}
                tabDisplayName="User"
                page={page}
                setPage={setPage}
                lastPage={lastPage}
                searchValue={search}
                onSearch={(value: string) => {
                  setSearch(value);
                  setPage(1);
                }}
              />
            </div>

          </div>
        )}

      </CardContent>
    </Card>
  );
}


function renderValueInline(value: any) {
  if (value === null || value === undefined) {
    return <span className="italic text-gray-400">—</span>;
  }

  if (Array.isArray(value)) {
    return (
      <span className="text-xs text-gray-700">
        [{value.join(", ")}]
      </span>
    );
  }

  if (isObject(value)) {
    return (
      <span className="text-xs text-gray-600">
        {JSON.stringify(value)}
      </span>
    );
  }

  return <span>{String(value)}</span>;
}

export function MiniBeforeAfterDiff({
  before,
  after,
}: {
  before: any;
  after: any;
}) {
  const diffs = getDiff(before, after).filter(d => d.changed);

  if (!diffs.length) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <div className="space-y-1">
      {diffs.map((d: any) => (
        <div
          key={d.key}
          className="
            rounded-md
            bg-yellow-50
            px-2
            py-1
            text-xs
          "
        >
          <div className="flex gap-1 items-center flex-wrap">
            <span className="font-medium capitalize text-gray-700">
              {d.key.replaceAll("_", " ")}:
            </span>

            <span className="line-through text-red-500">
              {renderValueInline(d.before)}
            </span>

            <span className="text-gray-400">→</span>

            <span className="font-semibold text-green-700">
              {renderValueInline(d.after)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}