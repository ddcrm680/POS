// src/components/profile/profile.tsx
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UseFormSetError } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { DeleteTerritory, DeleteUser, EditUser, fetchUserList, getCustomerView, getJobCard, getJobCardItem, getPrint, jobCardCancel, jobCardSend, SaveUser, UpdateTerritoryStatus } from "@/lib/api";
import { reusableComponentType, TerritoryMasterApiType, UserApiType, UserFormType, } from "@/lib/types";
import CommonTable from "@/components/common/CommonTable";
import { Badge, Box, IconButton, Image, Switch } from "@chakra-ui/react";
import { DownloadIcon, EditIcon, EyeIcon, Mail, PrinterIcon, Send, Trash2, XCircle } from "lucide-react";
import CommonModal from "@/components/common/CommonModal";
import { canShowAction, formatAndTruncate, formatDate, formatTime } from "@/lib/utils";
import CommonDeleteModal from "@/components/common/CommonDeleteModal";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import { customerMockData, jobCardMockData, territoryMasterMockData } from "@/lib/mockData";
import { jobCardStatusList } from "@/lib/constant";
import { buildJobCardHtml, downloadHtmlAsPdf, mapColumnsForCustomerView, openHtmlInNewTabAndPrint } from "@/lib/helper";
import { Checkbox } from "@radix-ui/react-checkbox";

import whatsap from "@/lib/images/whatsap.webp"
import CommonRowMenu from "@/components/common/CommonRowMenu";
import { jobCardHtmlTemplate } from "./template";
import { Loader } from "@/components/common/loader";
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
  const JobCardSendHandler = async () => {
    try {
      setIsLoading(true);

      await jobCardSend(sendModal);
      toast({ title: `Send Job Card`, description: "Job Card send successfully", variant: "success", });

    } catch (err: any) {

      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message || `Failed to send jobcard`,
        variant: "destructive",
      });
    } finally {
      setSendModal({ open: false, jobCard: {} });
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
  const [sendModal, setSendModal] = useState<any>({ open: false, jobCard: {} })
  const allowedActions = hideColumnListInCustomer?.actionShowedList;

  const [printDownLoadLoading, setPrintDownLoadLoading] = useState<any>({
    type: '',
    isLoad: false
  })
  async function commonPreviewHandler(type: string, row: any) {
    setPrintDownLoadLoading({ type, isLoad: true })
    let customerRes

    let jobRes
    let info
    try {
      
      info= await getPrint(row,'jobcard')
      // customerRes = await getCustomerView(row.consumer_id ?? "");
      customerRes = info?.job_card?.consumer

      jobRes = info.job_card
    } catch (e) {
      console.log(e);

    } finally {

      setPrintDownLoadLoading({ type: "", isLoad: false })
    }


    const rowData = {
      
      serviceVehicleImg:info?.service_diagram,
      jobcardLogo:jobRes?.store?.organization?.org_image,
      jobcard_date: formatDate(jobRes.jobcard_date),
      job_card_number: jobRes.job_card_number,
      name: customerRes.name,
      phone: customerRes.phone,
      address: customerRes.address,
      serviceLocation:jobRes?.store?.name,
      // state: customerRes.state.name,
      email: customerRes.email,
      vehicle_type: jobRes.vehicle_type,
      make: jobRes.vmake.name,
      model: jobRes.vmodel.name,
      color: jobRes.color,
      year: jobRes.year,
      technician:jobRes?.technician?.name,
      reg_no: jobRes.reg_no,
      chasis_no: jobRes.chasis_no,
      vehicle_condition: jobRes.vehicle_condition,
      isRepainted: jobRes.isRepainted,
      isSingleStagePaint: jobRes.isSingleStagePaint,
      isPaintThickness: jobRes.isPaintThickness,
      isVehicleOlder: jobRes.isVehicleOlder,
      opted_services: info.opted_services,
      store_manager:info?.store_manager?.name,
      warranty_years:info?.warranty_years,
      srsConditionList:info?.srsCondition

    }
    const html = buildJobCardHtml(rowData, jobCardHtmlTemplate);

    if (type === "print") {
      openHtmlInNewTabAndPrint(
        html,
        "PRINT",
        "Job Card",
        row.job_card_number
      );
    }

    if (type === "download") {
      downloadHtmlAsPdf(
        html,
        "Job-Card",
        row.job_card_number
      );
    }
  }

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
                    label: "Print ",
                    icon: printDownLoadLoading.isLoad ? <Loader isShowLoadingText={false} loaderSize={3} /> : <PrinterIcon size={16} />,
                    onClick: () => {
                      commonPreviewHandler('print', row)
                    },

                    show: canShowAction("print", allowedActions),
                    disabled: printDownLoadLoading.isLoad && printDownLoadLoading.type == "print"
                  },
                  {
                    key: "download",
                    label: "Download ",
                    icon: printDownLoadLoading.isLoad ? <Loader isShowLoadingText={false} loaderSize={3} /> : <DownloadIcon size={16} />,
                    onClick: () => {
                      commonPreviewHandler('download', row)
                    },
                    show: canShowAction("download", allowedActions),

                    disabled: printDownLoadLoading.isLoad && printDownLoadLoading.type == "download"
                  },
                  /* SEND VIA WHATSAPP */
                  {
                    key: "whatsapp",
                    label: "Send via WhatsApp",
                    icon: <Image src={whatsap} className="w-4 h-4" />,
                    onClick: () =>
                      setSendModal({
                        open: true,
                        jobCard: { ...row, sendType: "whatsap" },
                      }),
                    show: roleView.admin || roleView.store,
                  },

                  /* SEND VIA MAIL */
                  {
                    key: "mail",
                    label: "Send via Mail",
                    icon: <Mail size={16} />,
                    onClick: () =>
                      setSendModal({
                        open: true,
                        jobCard: { ...row, sendType: "mail" },
                      }),
                    show: roleView.admin || roleView.store,
                  },

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

          <CommonDeleteModal
            width="330px"
            maxWidth="330px"
            isOpen={sendModal.open || isJobCardDeleteModalInfo.open}
            title={`${sendModal.open ? "Send Job Card " : "Cancel Job Card"}`}
            description={`Are you sure you want to ${sendModal.open ? 'send' : 'cancel'} this job card ${sendModal.open ? sendModal?.jobCard?.sendType === "whatsap" ? 'via Whatsapp' : "via Mail" : " "}? ${sendModal.open ? '' : 'This action cannot be undone.'}`}
            confirmText={`Yes, ${sendModal.open ? 'Send' : 'Cancel'}`}
            cancelText="No"
            loadingText={`${sendModal.open ? 'Sending' : 'Cancelling'}...`}
            isLoading={isLoading}
            onCancel={() => {
              if (sendModal.open) {
                setSendModal({ open: false, jobCard: {} })

              } else
                setIsJobCardDeleteModalOpenInfo({ open: false, info: {} })
            }
            }
            onConfirm={() => {
              if (sendModal.open) {
                JobCardSendHandler()
              } else {
                JobCardDeleteHandler()
              }
            }}
          />

        </CardContent>
      </Card>
    </div>

  );
}
