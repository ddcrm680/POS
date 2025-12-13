// src/components/profile/profile.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { EditProfile } from "@/lib/api";
import { ProfileForm, profileSchema } from "@/schema";
import { Constant } from '@/lib/constant';
import CommonTable from "@/components/CommonTable";
import { IconButton } from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "lucide-react";

export default function Users({tabType}: {tabType?: string}) {
  const { toast } = useToast();
  const navigation = useLocation();
  const qc = useQueryClient();
  const { user, refreshUser, } = useAuth();

  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      // if user exists and has avatar url (your API returns avatar path)
      return (user as any)?.avatar || null;
    } catch { return null; }
  });

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: (user as any)?.name || "",
      phoneNumber: (user as any)?.phone || "",
      email: (user as any)?.email || "",
    },
  });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  //  const { user, isLoading } = useAuth();
  // Cleanup created object URLs when file changes/unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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

  useEffect(() => {
    console.log(`${process.env.REACT_APP_BASE_URL ?? Constant.REACT_APP_BASE_URL}/${previewUrl}`, 'user in profile component');
  }, [previewUrl])
  useEffect(() => {
    // update defaults if user changes after refresh
    form.reset({
      fullName: (user as any)?.name || "",
      email: (user as any)?.email || "",
      phoneNumber: (user as any)?.phone || "",
    });
    setPreviewUrl((user as any)?.avatar || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (vals: ProfileForm) => {
      setIsLoading(true)
      // If avatarFile present, use FormData
      const fd = new FormData();
      fd.append("name", vals.fullName);
      fd.append("phone", vals.phoneNumber);
      if (avatarFile) {
        fd.append("avatar", avatarFile);
      }
      await EditProfile(fd)

    },
    onSuccess: async (data: any) => {
      console.log(data, 'datadata');

      toast({ title: "Profile updated", description: "Your profile was saved.", variant: "success" });

      // Refresh user in auth context (so UI reflects new name/avatar)
      try {
        refreshUser();
        setIsLoading(false)
        setMode('view')
      } catch (_) {
        // also invalidate queries if you store user elsewhere
        refreshUser();
      }
    },
    onError: (err: any) => {
      console.log(err, 'erraewrtewq');

      toast({
        title: "Update failed",
        description: err?.message || "Failed to update profile",
        variant: "destructive",
      });
      setIsLoading(false)
    },

  });

  const onSubmit = (vals: ProfileForm) => {
    updateProfileMutation.mutate(vals);
  };
 const columns = [
  { key: "name", label: "Full Name", width: "150px" },
  { key: "email", label: "Email", width: "150px" },
  { key: "role", label: "Role", width: "150px" },
  { key: "status", label: "Status", width: "150px" },
  { key: "createdAt", label: "Created At", width: "150px" },
];

  return (
    <Card className="w-full">
      <CardContent>
        <CommonTable
          columns={columns}
          data={[]}
          
          tabType={tabType}
          actions={(row: any) => (
            <>
              <IconButton
                size="xs"
                mr={2}
                aria-label="Edit"
                onClick={() => console.log("Edit")}
              >
                <EditIcon />
              </IconButton>
              <IconButton
                size="xs"
                mr={2}
                colorScheme="red"
                aria-label="Delete"
                onClick={() => console.log("Delete", row)}
              >
                <DeleteIcon />
              </IconButton>
            </>
          )}
        />
      </CardContent>
    </Card>
  );
}
