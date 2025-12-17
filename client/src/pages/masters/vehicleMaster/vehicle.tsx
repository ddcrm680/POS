// src/components/profile/profile.tsx
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { DeleteUser, EditProfile, EditUser, fetchUserList, fetchVehicleList, SaveUser, UpdateUserStatus } from "@/lib/api";
import { ProfileForm, profileSchema, UserApiType, UserForm, UserFormType, vehicleType, } from "@/schema";
import { Constant } from '@/lib/constant';
import CommonTable from "@/components/common/CommonTable";
import { Box, IconButton, Input, Switch, Textarea } from "@chakra-ui/react";
import { DeleteIcon, EditIcon, Eye, EyeIcon, EyeOff, Trash2 } from "lucide-react";
import CommonModal from "@/components/common/CommonModal";
import { Form } from "@/components/ui/form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/utils";
import CommonDeleteModal from "@/components/common/CommonDeleteModal";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import { vehicleListInfo } from "@/lib/mockData";

export default function VehicleMaster() {
  const { toast } = useToast();
  const navigation = useLocation();
  const qc = useQueryClient();
  const { user, refreshUser, roles } = useAuth();
  const [vehicles, setVehicle] = useState<Array<any>>([]);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [has_next, setHasNext] = useState(false)

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
                className="
        px-3 py-1
        text-xs font-semibold
        rounded-full
        bg-yellow-400
        text-black
        uppercase
        tracking-wide
      "
              >
                {r.name}
              </Box>
            ))}
          </Box>
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
          setPerPage={setPerPage}
          onSearch={(value: string) => {
            // if (value) {
            setSearch(value);
            setPage(1); // reset page on new search
            // }
          }}

        />


      </CardContent>
    </Card>
  );
}
