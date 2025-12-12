// src/components/profile/profile.tsx
"use client";
import dummyProfile from '@/lib/images/dummy-Profile.webp'
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient"; // or adapt if using axios
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Box } from "@chakra-ui/react";
import { api, EditProfile } from "@/lib/api";
import { ProfileForm, profileSchema } from "@/schema";
import { Constant } from '@/lib/constant';

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
      return;
    }
    // Size validation
    if (f.size > maxSizeBytes) {
     setError(`File size must be at most ${Math.round(maxSizeBytes / 1024 / 1024)} MB`);
  e.currentTarget.value = "";
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
    console.log(`${process.env.REACT_APP_BASE_URL ?? Constant.REACT_APP_BASE_URL}/${previewUrl}`, 'user in profile component');
  }, [previewUrl])
  useEffect(() => {
    // update defaults if user changes after refresh
    form.reset({
      fullName: (user as any)?.name || "",
      email:(user as any)?.email || "",
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
        if(avatarFile){
          fd.append("avatar", avatarFile);
        }
        await EditProfile(fd)
        
    },
    onSuccess: async (data: any) => {
      console.log(data,'datadata');
      
      toast({ title: "Profile updated", description: "Your profile was saved.",variant:"success" });
    
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
      console.log(err,'erraewrtewq');
      
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

  return (
    <Card className="w-full">
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
            <Box className="flex justify-between">
              <Box w={'20%'}>
                <div className="flex items-center gap-3 flex-col">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Change avatar"
                    onClick={openFilePicker}
                    onKeyDown={handleKeyDown}
                    className={ `w-28 h-28 rounded-full overflow-hidden bg-muted flex items-center justify-center ${mode==='view'?'cursor-not-allowed':'cursor-pointer'} border-2 border-transparent hover:border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                    style={{ userSelect: "none" }}
                    title={mode==='view'?"View Avatar":"Change Avatar"}
                  >
                    { previewUrl ? (
                    
                <img
   src={
      previewUrl.startsWith("blob:")
        ? previewUrl
        : `${process.env.REACT_APP_BASE_URL ?? Constant.REACT_APP_BASE_URL}/${previewUrl}`
    }  className={`w-full h-full object-cover ${previewUrl===dummyProfile?'scale-125':''}`}
 
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
                        disabled={mode==='view'}
                      type="file"
                      accept="image/*"
                      onChange={onFileChange}
                      className="hidden"
                    />

                    <div className="flex flex-col">
                    {!error &&<p className="text-sm text-muted-foreground mt-2 text-center">
                        Allowed: JPG, JPEG, PNG, WEBP. Max {Math.round(maxSizeBytes / 1024 / 1024)} MB.
                      </p> }  
                      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                    </div>
                  </div>
                </div>
              </Box>
              <Box w={'70%'} className="gap-3 flex flex-col">
                <Box w={'100%'} className="gap-3 flex">
                  <Box w={'50%'}>
                     <FormField
        control={form.control}
        name="fullName"
        disabled={mode==='view'}
        render={({ field }) => (
          <FormItem>
            <FormLabel style={{ color: "#000" }}> Full Name</FormLabel>
            <FormControl>
           <Input
    {...field}
    onChange={(e) => field.onChange(e.target.value)}
    placeholder="Enter full name"
  />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
                  </Box>
                  <Box w={'50%'}>
                            <FormField
        control={form.control}
        name="email"
        disabled
        render={({ field }) => (
          <FormItem>
            <FormLabel style={{ color: "#000" }}>Email</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
                   
                  </Box>
                </Box>

                <Box w={'50%'}>
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                      disabled={mode==='view'}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ color: "#000" }}>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} inputMode="numeric"
          maxLength={10}  onChange={(e) => {
            let value = e.target.value;

            // 1️⃣ allow only digits
            value = value.replace(/\D/g, "");

            // 2️⃣ prevent starting with 0
            if (value.startsWith("0")) {
              value = value.replace(/^0+/, ""); // remove leading zeros
            }

            // 3️⃣ prevent leading space (not needed now but safe)
            value = value.trimStart();

            field.onChange(value);
          }} placeholder="Enter phone number" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </Box>
              </Box>
            </Box>
            <div className="flex justify-end gap-3">
           {mode==='view'&&   <Button
                type="button"
                variant="outline"
                   disabled={isLoading}
                className='hover:bg-[#E3EDF6] hover:text-[#000]'
                onClick={() => window.history.back()}
                data-testid="button-back"
              >
                ← Back
              </Button>}
              {mode==='view'? 
              <Button  type="button"  onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Edit click (prevent default)'); // debug
      setMode('edit');
    }}>
                {"Update "}
              </Button>:  
             <>   <Button type="button"
              className='hover:bg-[#E3EDF6] hover:text-[#000]'
               variant="outline"
             onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Edit click (prevent default)'); // debug
      setMode('view');
    }}
             disabled={isLoading}
              >
                
                {"Cancel "}
              </Button>  <Button type="submit"
                disabled={isLoading}
              >
               {isLoading &&  <svg
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
                {isLoading ?"Saving...":"Save "}
              </Button></>
}
            
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
