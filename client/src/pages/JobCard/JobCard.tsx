// src/components/profile/profile.tsx
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UseFormSetError } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { DeleteTerritory, DeleteUser, EditUser, fetchUserList, getCommon, getCustomerView, getJobCard, getJobCardItem, jobCardCancel, jobCardSend, SaveUser, UpdateTerritoryStatus } from "@/lib/api";
import { reusableComponentType, TerritoryMasterApiType, UserApiType, UserFormType, } from "@/lib/types";
import CommonTable from "@/components/common/CommonTable";
import { Badge, Box, IconButton, Image, Switch } from "@chakra-ui/react";
import { DownloadIcon, EditIcon, EyeIcon, Mail, PrinterIcon, Send, Trash2, XCircle } from "lucide-react";
import CommonModal from "@/components/common/CommonModal";
import { canShowAction, formatAndTruncate, formatDate, formatTime } from "@/lib/utils";
import CommonDeleteModal from "@/components/common/CommonDeleteModal";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import { customerMockData, jobCardMockData, territoryMasterMockData } from "@/lib/mockData";
import { jobCardStatusList, mailMessageTemplate } from "@/lib/constant";
import {  buildJobCardMailMessage, downloadHtmlAsPdf, mapColumnsForCustomerView, openHtmlInNewTabAndPrint } from "@/lib/helper";
import { Checkbox } from "@radix-ui/react-checkbox";

import whatsap from "@/lib/images/whatsap.webp"
import CommonRowMenu from "@/components/common/CommonRowMenu";
import { jobCardHtmlTemplate } from "./template";
import { Loader } from "@/components/common/loader";
import { GlobalLoader } from "@/components/common/GlobalLoader";
import SendOnWhatsappForm from "./SendOnWhatsappForm";
import SendMailtForm from "./SendMailtForm";
export default function JobCard({ noTitle = false, noPadding = false, apiLink = "", hideColumnListInCustomer = { list: [], actionShowedList: [] } }: reusableComponentType) {
  const { toast } = useToast();
  const { roles } = useAuth();
  const [jobCards, setJobCards] = useState<Array<any>>([]);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [has_next, setHasNext] = useState(false)
  const [, navigate] = useLocation();
  const [roleView, setRoleView] = useState<{
    store: boolean,
    admin: boolean,
    default: boolean
  }>({
    store: false,
    admin: false,
    default: false
  });
  const [sendJobCardModalOpenInfo, setSendJobCardModalOpenInfo] = useState<{ open: boolean, type: string, info: any }>({
    open: false,
    type: '',
    info: {}
  });
  const [filters, setFilters] = useState({
    status: "",
    consumer_id: ""
  });

  const { user, Logout, } = useAuth();
  useEffect(() => {
    const supremeUserRoleList = ['admin', "super-admin"]
    const managerList = ['store-manager']
    const roleList = {
      store: false,
      admin: false,
      default: false
    }

    managerList.find((manager) => manager === user?.role) ? roleList.store = true :
      supremeUserRoleList.find((supremeUser) => supremeUser === user?.role) ? roleList.admin = true : roleList.default = true
    setRoleView(roleList)
  }, [user, roles])
  const [isLoading, setIsLoading] = useState(false);

  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isListLoading, setIsListLoading] = useState(true);
  const [isJobCardDeleteModalInfo, setIsJobCardDeleteModalOpenInfo] = useState<{ open: boolean, info: any }>({
    open: false,
    info: {}
  });
  const PER_PAGE = 10;
  const JobCardDeleteHandler = async () => {
    try {
      setIsLoading(true);

      await jobCardCancel(isJobCardDeleteModalInfo?.info?.id);
      toast({ title: `Delete Job Card`, description: "Job Card deleted successfully", variant: "success", });

      fetchJobCard(false)

    } catch (err: any) {

      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message || `Failed to delete jobcard`,
        variant: "destructive",
      });
    } finally {
      setIsJobCardDeleteModalOpenInfo({ open: false, info: {} });
      setIsLoading(false);
    }
  };
 
  const [filterMetaInfo, setFilterMetaInfo] = useState<{ status: { value: string, label: string }[] }>({
    status: []
  });
  const columns = [
    /* ================= CREATED AT ================= */
    {
      key: "created_at",
      label: "Created On",
      align: "center",
      width: "170px",
      render: (value: string) => (
        <Box className="flex flex-col items-center">
          <span className="font-bold">{formatDate(value)}</span>
          <span className="text-sx text-gray-700">
            {formatTime(value)}
          </span>
        </Box>
      ),
    },

    /* ================= JOB CARD NO ================= */
    {
      key: "job_card_number",
      label: "JC No.",
      width: "110px",
      render: (value: string, row: any) => (
        <span
          className="text-[blue] font-medium cursor-pointer hover:underline text-sx "
          onClick={() => {

            sessionStorage.removeItem("sidebar_active_parent",);
            navigate(`/job-cards/view?id=${row.id}`)
          }}
        >
          {value}
        </span>
      ),
    },

    /* ================= CUSTOMER ================= */
    {
      key: "consumer",
      label: "Customer",
      width: "180px",
      render: (_: any, row: any) => (
        <div className="flex flex-col leading-tight">
          {/* Customer Name */}
          <span
            className="text-blue-600 font-medium cursor-pointer hover:underline"
            onClick={() => {
              sessionStorage.setItem("sidebar_active_parent", "customers");
              navigate(`/customers/view?id=${row.consumer_id}`)
            }}
          >
            {row.consumer?.name ?? "-"}
          </span>

          {/* Phone Number */}
          {row.consumer?.phone && (
            <span className="text-xs text-muted-foreground mt-0.5">
              {row.consumer.phone}
            </span>
          )}
        </div>
      ),
    }
    ,
    /* ================= SERVICE DATE ================= */
    {
      key: "jobcard_date",
      label: "Service Date",
      width: "140px",
      render: (value: string) => (
        <span className="text-xs">
          {formatDate(value)}
        </span>
      ),
    },

    /* ================= VEHICLE TYPE ================= */
    {
      key: "vehicle_type",
      label: " Type",
      width: "120px",
      render: (_: any, row: any) => (
        <span className="text-sx font-medium">
          {[
            row?.vehicle_type,
            row?.vmake?.name,
            row?.vmodel?.name,
          ]
            .filter(Boolean)
            .join(" • ")}
        </span>
      ),
    },

    /* ================= REG NO ================= */
    {
      key: "reg_no",
      label: "Reg No.",
      width: "140px",
    },

    /* ================= STORE ================= */
    {
      key: "store",
      label: "Store",
      width: "150px",
      render: (_: any, row: any) => (
        <span className="text-xs">
          {row.store?.name ?? "-"}
        </span>
      ),
    },

    /* ================= STATUS ================= */
    {
      key: "status",
      label: (
        <ColumnFilter
          label="Status"
          value={filters.status}
          onChange={(val) => {
            setFilters(f => ({ ...f, status: val }));
            setPage(1);
          }}
          options={[{ label: 'All', value: '' }, ...filterMetaInfo.status]}
        />
      ),
      width: "110px",
      render: (value: string) => (
        <Badge
          className={`px-3 py-1 text-xs font-medium rounded-full
    ${value === "created"
              ? "bg-blue-100 text-blue-700"
              : value === "completed"
                ? "bg-green-100 text-green-700"
                : value === "invoiced"
                  ? "bg-purple-100 text-purple-700"
                  : value === "cancelled"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
            }
  `}

        >
          {filterMetaInfo.status.find((item: any) => item.value === value)?.label}

        </Badge>
      ),
    },
    {
      key: "invoice_id",
      label: "Invoice No.",
      width: "180px",
      align: "center",
      render: (value: any, row: any) => {
        if (!value && row?.status === "cancelled")
          return <span>-</span>

        if (value) {
          return (
            <span
              className="text-[blue] font-medium cursor-pointer hover:underline"
              onClick={() => {
                sessionStorage.removeItem('sidebar_active_parent')
                navigate(`/invoices/view?id=${row.invoice.id}`)
              }}
            >
              {value}
            </span>
          );
        }

        // CASE 2: No invoice → show action
        return (
          <button
            onClick={() => {
              sessionStorage.removeItem('sidebar_active_parent')
              navigate(`/invoices/manage?jobCardId=${row.id}&jobCardNo=${row.job_card_number}&mode=create`)
            }}
            className="
            px-3 py-1 text-xs font-medium
            rounded-md border border-primary
            text-primary hover:bg-primary hover:text-white
            transition
          "
          >
            Create Invoice
          </button>
        );
      },
    }

  ];
  const resolvedColumns = useMemo(() => {
    const list = hideColumnListInCustomer?.list;

    // 🔓 No config → show all columns
    if (!Array.isArray(list) || list.length === 0) {
      return columns;
    }

    return mapColumnsForCustomerView(columns, list);
  }, [columns, hideColumnListInCustomer]);

  const fetchJobCard = async (isLoaderHide = false) => {
    try {
      if (!isLoaderHide)
        setIsListLoading(true);
      const res =
        await getJobCard({
          apiLink: apiLink,
          param: {
            per_page: perPage,
            page,
            search,
            status: filters.status,
            consumer: filters.consumer_id
          }

        });

      const mappedJobCards = res.data.map((item: any) => ({
        ...item,
        invoice_id: item.invoice?.invoice_number ?? null, // 🔑 REQUIRED
        invoice: item.invoice ?? null
      }));

      setJobCards(mappedJobCards);
      setHasNext(res.meta.has_next)
      setTotal(res.meta.total)
      setLastPage(res.meta.last_page);

      setFilterMetaInfo(res.meta.filters)
    } catch (e) {
      console.error(e);

    } finally {
      if (!isLoaderHide)
        setIsListLoading(false);
    }
  };

  useEffect(() => {
    fetchJobCard(false);
  }, [search, page, perPage, filters]);
  function resetFilter() {
    setSearch('')
    setPage(1)
    setFilters({
      status: "",
      consumer_id: ""
    })
  }
  const SendCommonHandler = async (
    value: any,
    setError: UseFormSetError<any>
  ) => {
    try {
      setIsLoading(true);
      const updatedPayload={...sendJobCardModalOpenInfo,info:{...sendJobCardModalOpenInfo.info,...value}}

      console.log(updatedPayload,'valuevaluevalue');
      await jobCardSend(updatedPayload);

      toast({
        title: "Send Job card",
        description: `Job card send successfully via ${sendJobCardModalOpenInfo.type === "email" ? "mail" : "whatsapp"}`,
        variant: "success",
      });
      setSendJobCardModalOpenInfo({ open: false, type: "", info: {} });

    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;


      // 👇 THIS IS THE KEY PART
      if (apiErrors && err?.response?.status === 422) {
        Object.entries(apiErrors).forEach(([field, messages]) => {
          setError(field as keyof UserFormType, {
            type: "server",
            message: (messages as string[])[0],
          });
        });
        return;
      }
      if (err?.response?.status === 403) {


        setSendJobCardModalOpenInfo({ open: false, type: "", info: {} });
      }
      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message ||
          `Failed to send
          } job card`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const allowedActions = hideColumnListInCustomer?.actionShowedList;

  const [rowLoading, setRowLoading] = useState<{
    [key: string]: boolean;
  }>({});

  async function commonPreviewHandler(type: "print" | "download", row: any) {
    const key = `${type}-${row.id}`;

    setRowLoading(prev => ({ ...prev, [key]: true }));

    try {
      await getCommon(row, type, 'job-cards');
    } catch (e) {
      console.error(e);
    } finally {
      console.log('comes here');

      setRowLoading(prev => ({ ...prev, [key]: false }));
    }
  }
useEffect(()=>{
  console.log(sendJobCardModalOpenInfo,'sendJobCardModalOpenInfo');
  
},[sendJobCardModalOpenInfo])
  return (
    <div className={`${noPadding ? "" : "p-3"}`}>
      {!noTitle && <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Job Card Management</h1>
            <p className="text-muted-foreground text-sm">Manage service workflow and track vehicles</p>
          </div>
        </div>
      </div>}

      <Card className="w-full">
        <CardContent>
          <CommonTable
            columns={resolvedColumns}
            isClear={true}
            data={jobCards}
            isAdd={noTitle ? false : true}
            perPage={perPage}
            setPerPage={setPerPage}
            resetFilter={resetFilter}
            isLoading={isListLoading}
            total={total}
            hasNext={has_next}
            tabType=""
            tabDisplayName="Job Card"
            page={page}
            setPage={setPage}
            lastPage={lastPage}
            searchValue={search}
            onSearch={(value: string) => {
              // if (value) {
              setSearch(value);
              setPage(1); // reset page on new search
              // }
            }}
            setIsModalOpen={(value: boolean) => {
              navigate(`/job-cards/manage`)
            }}
            actions={(row: any) => (
              <CommonRowMenu
                isAsyncLoading={
                  !!rowLoading[`print-${row.id}`] ||
                  !!rowLoading[`download-${row.id}`]
                }
                closeKey={`${row.id}-${!!rowLoading[`print-${row.id}`] || !!rowLoading[`download-${row.id}`]}`}
                items={[

                  /* VIEW */
                  {
                    key: "view",
                    label: "View ",
                    icon: <EyeIcon size={16} />,
                    onClick: () => navigate(`/job-cards/view?id=${row.id}`),
                    show: canShowAction("view", allowedActions),
                  },

                  /* EDIT */
                  {
                    key: "edit",
                    label: "Edit ",
                    icon: <EditIcon size={16} />,
                    onClick: () =>
                      navigate(`/job-cards/manage?id=${row.id}&mode=edit`),
                    show:
                      canShowAction("edit", allowedActions) &&
                      row.status === "created",
                  },
                  {
                    key: "print",
                    actionType: "print",
                    label: "Print",
                    icon: rowLoading[`print-${row.id}`] ? (
                      <Loader isShowLoadingText={false} loaderSize={3} />
                    ) : (
                      <PrinterIcon size={16} />
                    ),
                    onClick: () => commonPreviewHandler("print", row),
                    show: canShowAction("print", allowedActions),
                    disabled: rowLoading[`print-${row.id}`],
                  }
                  ,
                  {
                    key: "download",

                    actionType: "download",
                    label: "Download",
                    icon: rowLoading[`download-${row.id}`] ? (
                      <Loader isShowLoadingText={false} loaderSize={3} />
                    ) : (
                      <DownloadIcon size={16} />
                    ),
                    onClick: () => commonPreviewHandler("download", row),
                    show: canShowAction("download", allowedActions),
                    disabled: rowLoading[`download-${row.id}`],
                  }
                  ,
                  /* SEND VIA WHATSAPP */
                  {
                    key: "whatsapp",
                    label: "Send via WhatsApp",
                    icon: <Image src={whatsap} className="w-4 h-4" />,
                    onClick: () =>
                      setSendJobCardModalOpenInfo({
                        open: true,
                        type: "whatsapp",
                        info: {
                          id:row.id,
                          phone: row?.consumer?.phone
                        },
                      }),
                    show: roleView.admin || roleView.store,
                  },

                  /* SEND VIA MAIL */
                  {
                    key: "mail",
                    label: "Send via Mail",
                    icon: <Mail size={16} />,
                    onClick: () =>
                      setSendJobCardModalOpenInfo({
                        open: true,
                        type: "email",
                        info: {
                           id:row.id,
                          // 👇 TO field (consumer email)
                          to:row.consumer?.email ? [row.consumer?.email ]:[],

                          // 👇 Subject
                          subject: `Job Card #${row.job_card_number}`,

                          // 👇 Message body
                          message: buildJobCardMailMessage(mailMessageTemplate, row),
                        },
                      }),
                    show: roleView.admin || roleView.store,
                  }
,
                  /* CANCEL */
                  {
                    key: "cancel",
                    label: "Cancel Job Card",
                    icon: <XCircle size={16} />,
                    danger: true,
                    onClick: () =>
                      setIsJobCardDeleteModalOpenInfo({
                        open: true,
                        info: row,
                      }),
                    show:
                      canShowAction("delete", allowedActions) &&
                      row.status === "created",
                  },
                ]}
              />
            )}

          />
          <CommonModal
            width="40%"
            maxWidth="40%"
            isOpen={sendJobCardModalOpenInfo.open}
            onClose={() => setSendJobCardModalOpenInfo({ open: false, info: {}, type: "" })}
            title={sendJobCardModalOpenInfo.type === 'whatsapp' ? "Send via whatsapp" : "Send via mail"}
            isLoading={isLoading}
            primaryText={"Save"}
            cancelTextClass='hover:bg-[#E3EDF6] hover:text-[#000]'
            primaryColor="bg-[#FE0000] hover:bg-[rgb(238,6,6)]"
          >
            {
              sendJobCardModalOpenInfo.type === 'whatsapp' ?
                <SendOnWhatsappForm
                  id="whatsapp-form"
                   open={sendJobCardModalOpenInfo.open}
                 
                  initialValues={
                    sendJobCardModalOpenInfo.info
                  }
                  isLoading={isLoading}
                  onClose={() =>
                    setSendJobCardModalOpenInfo({ open: false, info: {}, type: "" })
                  }
                  onSubmit={(values, setError) => {
                    SendCommonHandler(values, setError);
                  }}
                />
                : <SendMailtForm
                  id="mail-form"
                  open={sendJobCardModalOpenInfo.open}
                  initialValues={
                    sendJobCardModalOpenInfo.info
                  }
                  isLoading={isLoading}
                  onClose={() =>
                    setSendJobCardModalOpenInfo({ open: false, info: {}, type: "" })
                  }
                  onSubmit={(values, setError) => {
                    SendCommonHandler(values, setError);
                  }}
                />

            }
          </CommonModal>
          <CommonDeleteModal
            width="330px"
            maxWidth="330px"
            isOpen={isJobCardDeleteModalInfo.open}
            title={`Cancel Job Card`}
            description={`Are you sure you want to cancel this job card ? 'This action cannot be undone.'}`}
            confirmText={`Cancel`}
            cancelText="No"
            loadingText={`Cancelling...`}
            isLoading={isLoading}
            onCancel={() => {
              setIsJobCardDeleteModalOpenInfo({ open: false, info: {} })
            }
            }
            onConfirm={() => {
              JobCardDeleteHandler()
            }}
          />

        </CardContent>
      </Card>
    </div>

  );
}
