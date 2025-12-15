// src/components/profile/profile.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { DeleteUser, EditProfile, EditUser, fetchUserList, SaveUser } from "@/lib/api";
import { ProfileForm, profileSchema, UserForm, UserFormType, } from "@/schema";
import { Constant } from '@/lib/constant';
import CommonTable from "@/components/common/CommonTable";
import { Box, IconButton, Input, Textarea } from "@chakra-ui/react";
import { DeleteIcon, EditIcon, Eye, EyeOff } from "lucide-react";
import CommonModal from "@/components/common/CommonModal";
import { Form } from "@/components/ui/form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import UserFormInfo from "./user/userForm";
import { formatDate } from "@/lib/utils";
import CommonDeleteModal from "@/components/common/CommonDeleteModal";

export default function Users() {
  const { toast } = useToast();
  const navigation = useLocation();
  const qc = useQueryClient();
  const { user, refreshUser, roles } = useAuth();
  const [users, setUsers] = useState<Array<any>>([]);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      // if user exists and has avatar url (your API returns avatar path)
      return (user as any)?.avatar || null;
    } catch { return null; }
  });
  const [isUserModalOpenInfo, setIsUserModalOpenInfo] = useState<{ open: boolean, type: string, info: any }>({
    open: false,
    type: 'create',
    info: {}
  });
  const [isUserDeleteModalInfo, setIsUserDeleteModalOpenInfo] = useState<{ open: boolean, info: any }>({
    open: false,
    info: {}
  });
  const [file, setFile] = useState<File | null>(null);


  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isListLoading, setIsListLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    // release previous blob url if it was a blob
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(objectUrl);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);
  const PER_PAGE = 10;
  const columns = useMemo(() => [
    {
      key: "id",
      label: "Id",
      width: "80px",
      render: (_value: any, _row: any, index: number) => {
console.log(page,PER_PAGE,'pagepage');

        return (
          <span className="text-sm font-medium text-gray-700">
            {((PER_PAGE * (page-1)) + index) + 1}
          </span>
        );
      },
    },

    { key: "name", label: "Full Name", width: "150px" },
    { key: "email", label: "Email", width: "150px" },
    {
      key: "role_id", label: "Role", width: "150px",
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
      label: "Status",
      width: "120px",
      render: (value: string) => {
        const isActive = value === "Active";

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
            {value}
          </span>
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
  ], [roles,page,PER_PAGE]);


  useEffect(() => {
    console.log("Is User Modal Open:", roles);
  }, [roles]);

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
      fetchUsers();
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
      fetchUsers()

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
  const fetchUsers = async () => {
    try {
      setIsListLoading(true);
      const res = await fetchUserList({
        page,
        search,
      });
      console.log(res, 'resbytrewert');

      const mappedUsers = res.data.map((u: any) => ({
        id: u.id,
        name: u.full_name || u.name,
        email: u.email,
        phone: u.phone,
        role_id: u.role_id,
        status: Number(u.is_active) === 1 ? "Active" : "InActive",
        createdAt: u.created_at,
      }));

      setUsers(mappedUsers);
      setLastPage(res.last_page);
    } finally {
      setIsListLoading(false);
    }
  };


  useEffect(() => {
    console.log(search, page, 'search, page');

    fetchUsers();
  }, [search, page]);
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
            if (value) {
              setSearch(value);
              setPage(1); // reset page on new search
            }
          }}
          setIsModalOpen={(value: boolean) =>
            setIsUserModalOpenInfo({ open: value, type: "create", info: {} })
          }
          actions={(row: any) => {
            return (
              <>
                {Number(row.role_id) !== 1 ? (
                  <>
                    <IconButton
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
                    </IconButton>

                    <IconButton
                      size="xs"
                      mr={2}
                      colorScheme="red"
                      aria-label="Delete"
                      onClick={() => {
                        setIsUserDeleteModalOpenInfo({ open: true, info: row });
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                ) : (
                  "-"
                )}
              </>
            );
          }}

        />
        <CommonModal
          isOpen={isUserModalOpenInfo.open}
          onClose={() => setIsUserModalOpenInfo({ open: false, type: 'create', info: {} })}
          title={isUserModalOpenInfo.type === 'create' ? "Add User" : "Edit User"}
          isLoading={isLoading}
          primaryText={isUserModalOpenInfo.type === 'create' ? "Add" : "Edit"}
          cancelTextClass='hover:bg-[#E3EDF6] hover:text-[#000]'
          primaryColor="bg-[#FE0000] hover:bg-[rgb(238,6,6)]"
        >
          <UserFormInfo
            id="user-form"
            initialValues={
              isUserModalOpenInfo.type === "edit"
                ? isUserModalOpenInfo.info
                : {}
            }
            isLoading={isLoading}
            mode={isUserModalOpenInfo.type === "create" ? "create" : "edit"}
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
