// src/components/profile/profile.tsx
"use client";
import dummyProfile from '@/lib/images/dummy-Profile.webp'
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Box } from "@chakra-ui/react";
import { api, EditProfile } from "@/lib/api";
import { ProfileForm, } from "@/lib/types";
import { Constant } from '@/lib/constant';
import { profileSchema } from '@/lib/schema';
import { FloatingField } from '@/components/common/FloatingField';
import { SectionCard } from '@/components/common/card';

export default function Profile() {
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

  const isView = mode === "view";

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: (user as any)?.name || "",
      phone: (user as any)?.phone || "",
      email: (user as any)?.email || "",
    },
  });
  const { setError: setformError } = form
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

  function openFilePicker() {
    inputRef.current?.click();
  }
  const maxSizeBytes = 2 * 1024 * 1024
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const f = e.target.files?.[0];
    if (!f) return;
    // Type validation
    if (!f.type.startsWith("image/")) {
      setError("Please select an image file (jpg,jpeg, png and webp.)");
      e.currentTarget.value = "";
      setFile(f);
      return;
    }
    // Size validation
    if (f.size > maxSizeBytes) {
      setError(`File size must be at most ${Math.round(maxSizeBytes / 1024 / 1024)} MB`);
      e.currentTarget.value = "";
      setFile(f);
      return;
    }
    setFile(f);
  }

  // keyboard handler for accessibility
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openFilePicker();
    }
  }

  useEffect(() => {
    // update defaults if user changes after refresh
    form.reset({
      fullName: (user as any)?.name || "",
      email: (user as any)?.email || "",
      phone: (user as any)?.phone || "",
    });
    setPreviewUrl((user as any)?.avatar || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  const PROFILE_FIELD_MAP: Record<string, keyof ProfileForm> = {
    name: "fullName",
    phone: "phone",
    email: "email",
  };
  const resetToInitialProfile = () => {
    form.reset({
      fullName: (user as any)?.name || "",
      email: (user as any)?.email || "",
      phone: (user as any)?.phone || "",
    });

    // reset avatar preview
    setFile(null);
    setAvatarFile(null);
    setPreviewUrl((user as any)?.avatar || null);

    // clear local errors
    setError(null);
  };

  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);
  const updateProfileMutation = async (
    vals: ProfileForm,
  ) => {
    try {
      if(error) return 
      setIsLoading(true);

      const fd = new FormData();
      fd.append("name", vals.fullName);
      fd.append("phone", vals.phone);

      if (file) {
        fd.append("avatar", file);
      }

      await EditProfile(fd);
      toast({
        title: "Profile updated",
        description: "Your profile was saved.",
        variant: "success",
      });

      refreshUser();
      setIsLoading(false);
      setMode("view");
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;

      // ✅ FIELD LEVEL ERRORS (VISIBLE NOW)
      console.log(err?.response?.status, 'err?.response?.status');

      if (apiErrors && err?.response?.status === 422) {
        Object.entries(apiErrors).forEach(([apiField, messages]) => {
          const formField = PROFILE_FIELD_MAP[apiField];

          if (!formField) return;

          setformError(formField, {
            type: "server",
            message: (messages as string[])[0],
          });
        });

        setIsLoading(false);
        return; // ⛔ stop generic toast
      }

      // ❌ GENERIC ERROR
      toast({
        title: "Update failed",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to update profile",
        variant: "destructive",
      });

    } finally {
      setIsLoading(false);
    }
  };


  const onSubmit = (vals: ProfileForm) => {
    updateProfileMutation(vals);
  };

  return (
    <Card className="w-full">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">

              <div className="flex flex-col items-center md:items-start p-4 py-0">
                <div className="flex items-center gap-3 flex-col">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Change avatar"
                    onClick={openFilePicker}
                    onKeyDown={handleKeyDown}
                    className={`w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center ${mode === 'view' ? 'cursor-not-allowed' : 'cursor-pointer'} border-2 border-transparent hover:border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                    style={{ userSelect: "none" }}
                    title={mode === 'view' ? "View Avatar" : "Change Avatar"}
                  >
                    {previewUrl ? (

                      <img
                        src={
                          previewUrl.startsWith("blob:")
                            ? previewUrl
                            : `${process.env.REACT_APP_BASE_URL ?? Constant.REACT_APP_BASE_URL}/${previewUrl}`
                        } className={`w-full h-full object-cover ${previewUrl === dummyProfile ? 'scale-125' : ''}`}

                      />

                    ) : (
                      <img
                        src={dummyProfile}
                        alt="avatar preview"

                        className="w-full h-full object-cover scale-125 transition-transform duration-300"
                      />
                      // </div>
                      // <div className="text-muted-foreground text-sm">No Avatar</div>
                    )}


                  </div>

                  <div className="flex-1">
                    <input
                      ref={inputRef}
                      id="avatar"
                      disabled={mode === 'view'}
                      type="file"
                      accept="image/*"
                      onChange={onFileChange}
                      className="hidden"
                    />

                    <div className="flex flex-col">
                      {!error && <p className="text-sm !text-[12px] text-muted-foreground mt-2 text-center">
                        Allowed: JPG, JPEG, PNG, WEBP. Max {Math.round(maxSizeBytes / 1024 / 1024)} MB.
                      </p>}
                      {error && <p className="text-sm !text-[12px] text-center text-destructive mt-2">{error}</p>}
                    </div>
                  </div>
                </div>
              </div>
              <SectionCard className="pt-0 pr-0" title="">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* "name", "email", "phone" */}
                  {[{ label: "fullName", fieldName: "fullName", isRequired: true },
                  { label: "Email", fieldName: "email", isRequired: true },
                  { label: "Phone", fieldName: "phone", isRequired: true }
                  ].map((item) => (
                    <FloatingField
                      isView={isView}
                      isRequired={item.isRequired}
                      name={item.fieldName}
                      label={item.label}
                      control={form.control}
                    />
                  ))}
                </div>
              </SectionCard>
            </div>
            <div className="flex justify-end gap-3">
              {mode === 'view' && <Button
                type="button"
                variant="outline"

                disabled={isLoading}
                className='hover:bg-[#E3EDF6] hover:text-[#000]'
                onClick={() => window.history.back()}
                data-testid="button-back"
              >
                ← Back
              </Button>}
              {mode === 'view' ?
                <Button
                  className="
                          bg-[#FE0000] 
                          hover:bg-[rgb(238,6,6)]
                          hover:border-black
                          transition-all duration-200
                          flex items-center justify-center gap-2
                        "
                  type="button" onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMode('edit');
                  }}>
                  {"Update "}
                </Button> :
                <>   <Button type="button"
                  className='hover:bg-[#E3EDF6] hover:text-[#000]'

                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    resetToInitialProfile();
                    setMode("view");
                  }}
                  disabled={isLoading}
                >

                  {"Cancel "}
                </Button>
                  <Button type="submit"
                    className="
                          bg-[#FE0000] 
                          hover:bg-[rgb(238,6,6)]
                          hover:border-black
                          transition-all duration-200
                          flex items-center justify-center gap-2
                        "
                    disabled={isLoading}
                  >
                    {isLoading && <svg
                      className="h-6 w-6 animate-spin text-[#fff]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>}
                    {isLoading ? "Saving..." : "Save "}
                  </Button>
                </>
              }

            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
