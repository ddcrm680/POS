
// src/components/profile/profile.tsx
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UseFormSetError } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { DeleteTerritory, DeleteUser, EditUser, fetchUserList,  getCustomerView, getJobCard, getJobCardItem, jobCardCancel, jobCardSend, SaveUser, UpdateTerritoryStatus } from "@/lib/api";
import { reusableComponentType, TerritoryMasterApiType, UserApiType, UserFormType, } from "@/lib/types";
import CommonTable from "@/components/common/CommonTable";
import { Badge, Box, IconButton, Image, Switch } from "@chakra-ui/react";
import { ArrowDown, ArrowUp, DownloadIcon, EditIcon, EyeIcon, Mail, PrinterIcon, Send, Trash2, XCircle } from "lucide-react";
import CommonModal from "@/components/common/CommonModal";
import { canShowAction, formatAndTruncate, formatDate, formatTime } from "@/lib/utils";
import CommonDeleteModal from "@/components/common/CommonDeleteModal";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import { customerMockData, jobCardMockData, productItemLogMock, territoryMasterMockData } from "@/lib/mockData";
import { jobCardStatusList } from "@/lib/constant";
import {  downloadHtmlAsPdf, mapColumnsForCustomerView, openHtmlInNewTabAndPrint } from "@/lib/helper";
import { Checkbox } from "@radix-ui/react-checkbox";

import whatsap from "@/lib/images/whatsap.webp"
import CommonRowMenu from "@/components/common/CommonRowMenu";
import { Loader } from "@/components/common/loader";
export default function FranchiseItemLog({ noTitle = false, noPadding = false, apiLink = "", hideColumnListInCustomer = { list: [], actionShowedList: [] } }: reusableComponentType) {
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
      key: "uom",
      label: "Uom",
      width: "110px",

    },

    /* ================= CUSTOMER ================= */
    {
      key: "last_qty",
      label: "Last Qty",
      width: "180px",

    }
    ,
    /* ================= SERVICE DATE ================= */
    {
      key: "updated_qty",
      label: "Updated Qty",
      width: "160px",
      render: (value: number) => {
        const qty = Number(value);
        const isDown = qty < 0;

        return (
          <div className="flex items-center gap-1 text-xs">
            {isDown ? (
              <ArrowDown className="w-3 h-3 text-red-500" />
            ) : (
              <ArrowUp className="w-3 h-3 text-green-600" />
            )}

            <span className={isDown ? "text-red-500" : "text-green-600"}>
              {Math.abs(qty).toLocaleString("en-IN")}
            </span>

          
          </div>
        );
      },
    }
    ,
    /* ================= VEHICLE TYPE ================= */
    {
      key: "total_qty",
      label: "Total Qty",
      width: "120px",
    },
    {
      key: "remark",
      label: "Remark",
      width: "140px",
      render: (value: string) =>{
        console.log(value,'valuevalue');
        
        return  (
          <span >{(value) ?value: "-"}</span>
          
      )},
    },
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
      // const res =
      //   await getJobCard({
      //     apiLink: apiLink,
      //     param: {
      //       per_page: perPage,
      //       page,
      //       search,
      //       status: filters.status,
      //       consumer: filters.consumer_id
      //     }

      //   });

      // const mappedJobCards = res.data.map((item: any) => ({
      //   ...item,
      //   invoice_id: item.invoice?.invoice_number ?? null, // 🔑 REQUIRED
      //   invoice: item.invoice ?? null
      // }));

      setJobCards(productItemLogMock.data);
      // setHasNext(res.meta.has_next)
      // setTotal(res.meta.total)
      // setLastPage(res.meta.last_page);

      // setFilterMetaInfo(res.meta.filters)
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
              if (sendModal) {
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
