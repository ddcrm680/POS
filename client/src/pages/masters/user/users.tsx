// src/components/profile/profile.tsx
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UseFormSetError } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { DeleteUser, EditUser, fetchUserList, SaveUser, UpdateUserStatus } from "@/lib/api";
import { UserApiType, UserFormType, } from "@/lib/types";
import CommonTable from "@/components/common/CommonTable";
import { Box, IconButton, Switch } from "@chakra-ui/react";
import { EditIcon, EyeIcon, Trash2 } from "lucide-react";
import CommonModal from "@/components/common/CommonModal";
import UserFormInfo from "./userForm";
import { formatDate, formatTime } from "@/lib/utils";
import CommonDeleteModal from "@/components/common/CommonDeleteModal";
import { ColumnFilter } from "@/components/common/ColumnFilter";
import UserView from "./userView";

export default function Users() {
  const { toast } = useToast();
  const navigation = useLocation();
  const qc = useQueryClient();
  const { user, refreshUser, roles } = useAuth();
  const [users, setUsers] = useState<Array<any>>([]);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [has_next, setHasNext] = useState(false)
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
    {
      key: "createdAt", label: "Created On", align: "center", width: "100px", render: (_value: any,) => {

        return (
          <Box className="flex flex-col justify-center items-center">
            <span className="font-bold  ">
              {formatDate(_value)}
            </span>
            <span className="text-sm font-medium  text-gray-700">
              {formatTime(_value)}
            </span></Box>
        );
      },
    },
    {
      key: "role_id", label: (
        <ColumnFilter
          label="Role"
          value={filters.role_id}
          onChange={(val) => {
            setFilters(f => ({ ...f, role_id: val }));
            setPage(1);
          }}
          options={[{ name: 'All', id: '' }, ...roles].map(r => ({
            label: r.name,
            value: r.id,
          }))}
        />
      ), width: "150px",
      render: (_value: any,) => {

        return (
          <span className="text-sm font-medium text-gray-700">
            {(roles && roles?.find((r) => (r.id === _value))?.name) ?? "-"}
          </span>
        );
      }
    },
    { key: "name", label: "Full Name", width: "150px" },
    { key: "email", label: "Email", width: "150px" },

    {
      key: "change_Status",
      label: (
        <ColumnFilter
          label="Status"
          value={filters.status}
          onChange={(val) => {
            setFilters(f => ({ ...f, status: val }));
            setPage(1);
          }}
          options={[
            { label: 'All', value: '' },
            { label: "Active", value: 1 },
            { label: "Inactive", value: 0 },
          ]}
        />
      ),
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
                bg: "#22c55e",     // checked color
              }}
            />
          </Switch.Root>

        );
      },
    },

  ], [roles, page, PER_PAGE, filters]);

  const UserStatusUpdateHandler = useCallback(async (u: any) => {
    try {
      const newStatus = u.change_Status ? 0 : 1;

      setUsers(prevUsers => {

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
            password: value.password ?? null,
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

        setIsUserModalOpenInfo({ open: false, type: "create", info: {} });
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

      fetchUsers(false)

    } catch (err: any) {

      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message || `Failed to delete user`,
        variant: "destructive",
      });
    } finally {
      setIsUserDeleteModalOpenInfo({ open: false, info: {} });
      setIsLoading(false);
    }
  };
  const fetchUsers = async (isLoaderHide = false) => {
    try {
      if (!isLoaderHide)
        setIsListLoading(true);
      const res = await fetchUserList({
        per_page: perPage,
        page,
        search,
        role_id: filters.role_id,
        status: filters.status,
      });

      const mappedUsers = res.data.map((u: UserApiType) => ({
        id: u.id,
        name: u.full_name || u.name,
        address: u.address,
        email: u.email,
        phone: u.phone,
        role_id: u.role_id,
        change_Status: u.is_active,
        status: u.is_active,
        createdAt: u.created_at,
      }));
      setHasNext(res.meta.has_next)
      setTotal(res.meta.total)
      setUsers(mappedUsers);
      setLastPage(res.meta.last_page);
    } catch (e) {
      console.error(e);

    } finally {
      if (!isLoaderHide)
        setIsListLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(false);
  }, [search, page, filters, perPage]);
  function resetFilter() {
    setSearch('')
    setPage(1)
    setFilters({
      role_id: "",
      status: "",
    })
  }
  return (
    <Card className="w-full">
      <CardContent>
        <CommonTable
          columns={columns}
          data={users}
          isAdd={true}
          isClear={true}
          perPage={perPage}
          setPerPage={setPerPage}
          resetFilter={resetFilter}
          isLoading={isListLoading}
          total={total}
          hasNext={has_next}
          tabType=""
          tabDisplayName="User"
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
                      // mr={2}
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
                    {Number(row.role_id) !== roles.find((role) => role.slug === "super-admin").id && <IconButton
                      size="xs"
                      // mr={2}
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

                    {
                      Number(row.role_id) !== roles.find((role) => role.slug === "super-admin").id &&
                      <IconButton
                        size="xs"
                        // mr={2}
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
          width={isUserModalOpenInfo.type === 'view' && isUserModalOpenInfo.open && '80%'}
          maxWidth={isUserModalOpenInfo.type === 'view' && isUserModalOpenInfo.open && '80%'}
          isOpen={isUserModalOpenInfo.open}
          onClose={() => setIsUserModalOpenInfo({ open: false, type: 'create', info: {} })}
          title={isUserModalOpenInfo.type === 'view' ? "View User" : isUserModalOpenInfo.type === 'create' ? "Add User" : "Edit User"}
          isLoading={isLoading}
          primaryText={isUserModalOpenInfo.type === 'create' ? "Add" : "Edit"}
          cancelTextClass='hover:bg-[#E3EDF6] hover:text-[#000]'
          primaryColor="bg-[#FE0000] hover:bg-[rgb(238,6,6)]"
        >
          {
            isUserModalOpenInfo.type === 'view' ?
              <UserView
                info={isUserModalOpenInfo.info}
              />
              : <UserFormInfo
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

          }
        </CommonModal>
        <CommonDeleteModal
          width="330px"
          maxWidth="330px"
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
