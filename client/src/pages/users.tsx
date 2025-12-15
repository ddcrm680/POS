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
import { DeleteUser, EditProfile, EditUser, fetchUserList, SaveUser, UpdateUserStatus } from "@/lib/api";
import { ProfileForm, profileSchema, UserApiType, UserForm, UserFormType, } from "@/schema";
import { Constant } from '@/lib/constant';
import CommonTable from "@/components/common/CommonTable";
import { Box, IconButton, Input, Switch, Textarea } from "@chakra-ui/react";
import { DeleteIcon, EditIcon, Eye, EyeIcon, EyeOff, Trash2 } from "lucide-react";
import CommonModal from "@/components/common/CommonModal";
import { Form } from "@/components/ui/form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import UserFormInfo from "./user/userForm";
import { formatDate } from "@/lib/utils";
import CommonDeleteModal from "@/components/common/CommonDeleteModal";
import { ColumnFilter } from "@/components/common/ColumnFilter";

export default function Users() {
  const { toast } = useToast();
  const navigation = useLocation();
  const qc = useQueryClient();
  const { user, refreshUser, roles } = useAuth();
  const [users, setUsers] = useState<Array<any>>([]);

  const [isUserModalOpenInfo, setIsUserModalOpenInfo] = useState<{ open: boolean, type: string, info: any }>({
    open: false,
    type: 'create',
    info: {}
  });
  const [isUserDeleteModalInfo, setIsUserDeleteModalOpenInfo] = useState<{ open: boolean, info: any }>({
    open: false,
    info: {}
  });

  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isListLoading, setIsListLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const PER_PAGE = 10;
  const [filters, setFilters] = useState({
  role_id: "",
  status: "",
});

  const columns = useMemo(() => [
    // {
    //   key: "id",
    //   label: "Id",
    //   width: "80px",
    //   render: (_value: any, _row: any, index: number) => {

    //     return (
    //       <span className="text-sm font-medium text-gray-700">
    //         {((PER_PAGE * (page - 1)) + index) + 1}
    //       </span>
    //     );
    //   },
    // },

    { key: "name", label: "Full Name", width: "150px" },
    { key: "email", label: "Email", width: "150px" },
    {
      key: "role_id", label: (
      <ColumnFilter
        label="Role"
        value={filters.role_id}
        onChange={(val) => {
          setFilters(f => ({ ...f, role_id: val }));
          setPage(1);
        }}
        options={roles.map(r => ({
          label: r.name,
          value: r.id,
        }))}
      />
    ),width: "150px",
      render: (_value: any,) => {

        return (
          <span className="text-sm font-medium text-gray-700">
            {(roles && roles?.find((r) => (r.id === _value))?.name) ?? "-"}
          </span>
        );
      }
    },

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
      options={[
        { label: "Active", value: 1 },
        { label: "Inactive", value: 0 },
      ]}
    />
  ),
      width: "120px",
      render: (value: string) => {
        const isActive = Number(value) === 1;

        return (
          <span
            className={`
            inline-flex items-center
            px-2.5 py-1 rounded-full text-xs font-medium
            ${isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"}
          `}
          >
            {Number(value) === 1 ? "Active" : 'InActive'}
          </span>
        );
      },
    },
    {
      key: "change_Status",
      label: "Change Status",
      width: "120px",
      render: (value: string, _row: any,) => {
        const isActive = Number(value) === 1;

        return (
          <Switch.Root checked={isActive}
            onCheckedChange={(e: any) => UserStatusUpdateHandler(_row)}
            size="sm">
            <Switch.HiddenInput />
            <Switch.Control
              bg="#ffa9a9"          // unchecked color
              _checked={{
                bg: "#FE0000",     // checked color
              }}
            />
          </Switch.Root>

        );
      },
    },
    {
      key: "createdAt", label: "Created At", width: "150px", render: (_value: any,) => {

        return (
          <span className="text-sm font-medium text-gray-700">
            {formatDate(_value)}
          </span>
        );
      },
    },
  ], [roles, page, PER_PAGE]);

const UserStatusUpdateHandler = useCallback(async (u: any) => {
  try {
    const newStatus = u.change_Status ? 0 : 1;

    setUsers(prevUsers => {
      console.log("prevUsers (always correct):", prevUsers);

      return prevUsers.map(item =>
        item.id === u.id
          ? {
              ...item,
              change_Status: newStatus,
              status: newStatus,
            }
          : item
      );
    });

    await UpdateUserStatus({ id: u.id, status: newStatus });

    toast({
      title: "Status Update",
      description: "User status updated successfully",
      variant: "success",
    });
  } catch (err: any) {
    toast({
      title: "Error",
      description:
        err?.response?.data?.message ||
        err.message ||
        "Failed to update user status",
      variant: "destructive",
    });
  }
}, []);

 useEffect(()=>{
  console.log(users,'usersusderd');
  
 },[users])
  const UserCommonHandler = async (
    value: UserFormType,
    setError: UseFormSetError<UserFormType>
  ) => {
    try {
      setIsLoading(true);

      if (isUserModalOpenInfo.type === "edit") {
        await EditUser({
          id: isUserModalOpenInfo.info.id,
          info: {
            name: value.name,
            email: value.email,
            password:null,
            phone: value.phone,
            role_id: Number(value.role_id),
            address: value.address,
          },
        });

        toast({
          title: "Edit User",
          description: "User updated successfully",
          variant: "success",
        });
      } else {
        await SaveUser(value);

        toast({
          title: "Add User",
          description: "User added successfully",
          variant: "success",
        });
      }

      setIsUserModalOpenInfo({ open: false, type: "create", info: {} });
      fetchUsers(false);
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;
      console.log(apiErrors, 'apiErrors');

      // 👇 THIS IS THE KEY PART
      if (apiErrors) {
        Object.entries(apiErrors).forEach(([field, messages]) => {
          setError(field as keyof UserFormType, {
            type: "server",
            message: (messages as string[])[0],
          });
        });
        return;
      }

      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message ||
          `Failed to ${isUserModalOpenInfo.type === "create" ? "add" : "update"
          } user`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const UserDeleteHandler = async () => {
    try {
      setIsLoading(true);

      await DeleteUser(isUserDeleteModalInfo?.info?.id);
      toast({ title: `Delete User`, description: "User deleted successfully", variant: "success", });
      setIsUserDeleteModalOpenInfo({ open: false, info: {} });
      fetchUsers(false)

    } catch (err: any) {
      console.log(err, 'errorr message');

      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message || `Failed to delete user`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const fetchUsers = async (isLoaderHide = false) => {
    try {
      if (!isLoaderHide)
        setIsListLoading(true);
      const res = await fetchUserList({
        page,
        search,
          role_id: filters.role_id,
  status: filters.status,
      });

      const mappedUsers = res.data.map((u: UserApiType) => ({
        id: u.id,
        name: u.full_name || u.name,
        email: u.email,
        phone: u.phone,
        role_id: u.role_id,
        change_Status:u.is_active,
        status: u.is_active,
        createdAt: u.created_at,
      }));

      setUsers(mappedUsers);
      setLastPage(res.last_page);
    } finally {
      if (!isLoaderHide)
        setIsListLoading(false);
    }
  };

useEffect(() => {
  fetchUsers(false);
}, [search, page, filters]);

  return (
    <Card className="w-full">
      <CardContent>
        <CommonTable
          columns={columns}
          data={users}
          isLoading={isListLoading}
          tabType="name or phone"
          tabDisplayName="User"
          page={page}                 // ✅
          setPage={setPage}           // ✅
          lastPage={lastPage}
          searchValue={search}
          onSearch={(value: string) => {
            // if (value) {
            setSearch(value);
            setPage(1); // reset page on new search
            // }
          }}
          setIsModalOpen={(value: boolean) =>
            setIsUserModalOpenInfo({ open: value, type: "create", info: {} })
          }
          actions={(row: any) => {
            return (
              <>

                {(
                  <Box className="gap-3">
                    <IconButton
                      size="xs"
                      mr={2}
                      aria-label="View"
                      onClick={() =>
                        setIsUserModalOpenInfo({
                          open: true,
                          type: "view",
                          info: row,
                        })
                      }
                    >
                      <EyeIcon />
                    </IconButton>
                    {Number(row.role_id) !== 1 && <IconButton
                      size="xs"
                      mr={2}
                      aria-label="Edit"
                      onClick={() =>
                        setIsUserModalOpenInfo({
                          open: true,
                          type: "edit",
                          info: row,
                        })
                      }
                    >
                      <EditIcon />
                    </IconButton>}

                    {Number(row.role_id) !== 1 && <IconButton
                      size="xs"
                      mr={2}
                      colorScheme="red"
                      aria-label="Delete"
                      onClick={() => {
                        setIsUserDeleteModalOpenInfo({ open: true, info: row });
                      }}
                    >
                   <Trash2 size={16} />
                    </IconButton>}

                  </Box>
                )}
              </>
            );
          }}

        />
        <CommonModal
          isOpen={isUserModalOpenInfo.open}
          onClose={() => setIsUserModalOpenInfo({ open: false, type: 'create', info: {} })}
          title={isUserModalOpenInfo.type === 'view' ? "View User" : isUserModalOpenInfo.type === 'create' ? "Add User" : "Edit User"}
          isLoading={isLoading}
          primaryText={isUserModalOpenInfo.type === 'create' ? "Add" : "Edit"}
          cancelTextClass='hover:bg-[#E3EDF6] hover:text-[#000]'
          primaryColor="bg-[#FE0000] hover:bg-[rgb(238,6,6)]"
        >
          <UserFormInfo
            id="user-form"
            initialValues={
              isUserModalOpenInfo.type === "edit" || isUserModalOpenInfo.type === "view"
                ? isUserModalOpenInfo.info
                : {}
            }
            isLoading={isLoading}
            mode={isUserModalOpenInfo.type === 'view' ? "view" : isUserModalOpenInfo.type === "create" ? "create" : "edit"}
            onClose={() =>
              setIsUserModalOpenInfo({ open: false, type: "create", info: {} })
            }
            roles={roles}
            onSubmit={(values, setError) => {
              UserCommonHandler(values, setError);
            }}
          />

        </CommonModal>
        <CommonDeleteModal
          width="420px"
          maxWidth="420px"
          isOpen={isUserDeleteModalInfo.open}
          title="Delete User"
          description={`Are you sure you want to delete this user? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isLoading={isLoading}
          onCancel={() =>
            setIsUserDeleteModalOpenInfo({ open: false, info: {} })
          }
          onConfirm={UserDeleteHandler}
        />

      </CardContent>
    </Card>
  );
}
