// src/components/profile/profile.tsx
"use client";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { fetchVehicleList } from "@/lib/api";
import { vehicleType, } from "@/schema";
import CommonTable from "@/components/common/CommonTable";
import { Box, } from "@chakra-ui/react";
import CommonModal from "@/components/common/CommonModal";
import { VehicleCardInfo } from "./vehicleCardInfo";


export default function VehicleMaster() {
  const { toast } = useToast();
  const navigation = useLocation();
  const qc = useQueryClient();
  const { user, refreshUser, roles } = useAuth();
  const [vehicles, setVehicle] = useState<Array<any>>([]);
  const [perPage, setPerPage] = useState(9);
  const [total, setTotal] = useState(0);
  const [has_next, setHasNext] = useState(false)
  const [isUserModalOpenInfo, setIsUserModalOpenInfo] = useState<{ open: boolean, info: any }>({
    open: false,
    info: {}
  });
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isListLoading, setIsListLoading] = useState(true);

  const columns = useMemo(() => [
    {
      key: "company", label: "Company", align: "center", width: "150px",
    },
    {
      key: "model", label: (
        'Model'
      ),
      render: (_value: { name: string }[],) => {

        return (
          <Box className="flex flex-wrap gap-2">
            {_value?.map((r: { name: string }, idx: number) => (
              <Box
                key={idx}
                className={`px-3 py-1   rounded-full border-[#FE0000] border bg-[#ffa9a9]  uppercase tracking-wide`}
              >
                {r.name}
              </Box>
            ))
            }
          </Box >
        );
      }
    },

  ], [roles, page, perPage,]);


  const fetchVehicle = async (isLoaderHide = false) => {
    try {
      if (!isLoaderHide)
        setIsListLoading(true);
      const res =
        await fetchVehicleList({
          per_page: perPage,
          page,
          search,
        });

      const mappedVehicle = res?.data?.map((vehicle: vehicleType) => {
        return {
          company: vehicle.name,
          model: vehicle.vehicle_models
        }
      })
      setVehicle(mappedVehicle);

      setHasNext(res.meta.has_next)
      setTotal(res.meta.total)
      setLastPage(res.meta.last_page);
    } catch (e) {
      console.error(e);

    } finally {
      if (!isLoaderHide)
        setIsListLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicle(false);
  }, [search, page, perPage]);

  return (
    <Card className="w-full">
      <CardContent>
        <CommonTable
          columns={columns}
          data={vehicles}
          // resetFilter={resetFilter}
          isCard={true}
          isLoading={isListLoading}
          tabType=""
          tabDisplayName="User"
          page={page}
          total={total}
          hasNext={has_next}
          setPage={setPage}
          lastPage={lastPage}
          searchValue={search}
          perPage={perPage}
          setIsUserModalOpenInfo={setIsUserModalOpenInfo}
          setPerPage={setPerPage}
          onSearch={(value: string) => {
            // if (value) {
            setSearch(value);
            setPage(1); // reset page on new search
            // }
          }}

        />

    <CommonModal
            isOpen={isUserModalOpenInfo.open}
            onClose={() => setIsUserModalOpenInfo({ open: false, info: {} })}
            title={isUserModalOpenInfo.info.company}
            isLoading={isListLoading}
            primaryText={""}
            cancelTextClass='hover:bg-[#E3EDF6] hover:text-[#000]'
            primaryColor="bg-[#FE0000] hover:bg-[rgb(238,6,6)]"
          >

            <VehicleCardInfo item={isUserModalOpenInfo.info} isInModal={true} />
          </CommonModal>
      </CardContent>
    </Card>
  );
}
