"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, UseFormSetError } from "react-hook-form";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/common/card";
import { FloatingField } from "@/components/common/FloatingField";
import { FloatingRHFSelect } from "@/components/common/FloatingRHFSelect";
import { useAuth } from "@/lib/auth";
import { useLocation, useSearchParams } from "wouter";
import { Loader } from "@/components/common/loader";
import { EditTerritory, fetchCitiesByStates, fetchCityList, fetchStateList, SaveTerritory } from "@/lib/api";
import { FloatingTextarea } from "@/components/common/FloatingTextarea";
import { storeFormProp, TerritoryFormValues, TerritoryMasterApiType } from "@/lib/types";
import { FRANCHISES } from "@/lib/mockData";
import { zodResolver } from "@hookform/resolvers/zod";
import { TerritoryMasterSchema } from "@/lib/schema";
import { findIdByName, findIdsByNames } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function TerritoryMasterForm({
  initialValues,
  Loading = false,
}: { initialValues: TerritoryFormValues, Loading: boolean }) {
  const [, navigate] = useLocation();

  const [countryList, setCountryList] = useState<
    { id: number; name: string; slug?: string }[]
  >([]);
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const mode = searchParams.get("mode");
  const isView = mode === "view";

  const form = useForm<TerritoryFormValues>({
    resolver: zodResolver(TerritoryMasterSchema),
    defaultValues: {
      name: "",
      store_id: "",
      notes: "",
      country_id: "India",
      state_ids: [],
      city_ids: [],
    },
  });
  const { countries } = useAuth();
  useEffect(() => {

    if (!countryList.length) return;

    if ((mode == "create" || !mode) &&
      countryList.length) {
      const hydrateLocation = async () => {
        // 1️⃣ COUNTRY
        isHydratingRef.current = true;
        try {
          const countryId = findIdByName(countryList, '101');
          if (!countryId) return;
          form.setValue("country_id", String(countryId));

          // 2️⃣ STATES
          setLoadingState(true);
          const stateList = await fetchStateList(countryId);
          setStates(stateList);
          setLoadingState(false);

        } finally {
          // ✅ hydration completed
          isHydratingRef.current = false;
        }
      };
      hydrateLocation()
    }
    const hydrate = async () => {
      isHydratingRef.current = true;

      try {
        /* 1️⃣ COUNTRY */
        const countryId = findIdByName(
          countryList,
          initialValues?.country_id || "India"
        );
        if (!countryId) return;

        form.setValue("country_id", String(countryId));

        /* 2️⃣ STATES (already IDs from backend) */
        if (initialValues?.state_ids?.length) {
          const stateIds = initialValues.state_ids.map((id: any) => String(id));
          form.setValue("state_ids", stateIds);

          /* 3️⃣ FETCH CITIES (SINGLE API CALL ✅) */
          setLoadingCity(true);
          const cityList = await fetchCitiesByStates(
            stateIds.map(Number)
          );
          setCities(cityList);
          setLoadingCity(false);

          /* 4️⃣ SET CITIES */
          if (initialValues?.city_ids?.length) {
            form.setValue(
              "city_ids",
              initialValues.city_ids.map((id: any) => String(id))
            );
          }
        }
      } finally {
        isHydratingRef.current = false;
      }
    };

    if (mode === "edit" || mode === "view") {
      hydrate();
    }
  }, [mode, initialValues, countryList]);
  const { toast } = useToast();

  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingState, setLoadingState] = useState(false);
  const [loadingCity, setLoadingCity] = useState(false);

  const isHydratingRef = useRef(false);
  useEffect(() => {
    setCountryList(countries)
  }, [countries])
  const { control, handleSubmit, watch, setValue } = form;

  const onSubmit = (values: TerritoryFormValues) => {
    TerritoryCommonHandler(values, form.setError)
  };
  const TerritoryCommonHandler = async (
    value: TerritoryFormValues,
    setError: UseFormSetError<TerritoryFormValues>
  ) => {
    try {
      setIsLoading(true);

      if (mode === "edit") {
        await EditTerritory({
          id: id ?? '',
          info: value
        });

        toast({
          title: "Edit Territory",
          description: "Territory updated successfully",
          variant: "success",
        });
      } else {
        await SaveTerritory(value);

        toast({
          title: "Add Territory",
          description: "Territory added successfully",
          variant: "success",
        });
      }
      navigate("/master")
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;


      // 👇 THIS IS THE KEY PART
      if (apiErrors && err?.response?.status === 422) {
        Object.entries(apiErrors).forEach(([field, messages]) => {
          setError(field as keyof TerritoryFormValues, {
            type: "server",
            message: (messages as string[])[0],
          });
        });
        return;
      }
      if (err?.response?.status === 403) {
        navigate("/master")
      }
      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err.message ||
          `Failed to ${mode === "create" ? "add" : "update"
          } territory`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (mode === "edit" || mode === "view") {


      form.reset({
        name: initialValues?.name ?? "",
        store_id: initialValues?.store_id ?? "",
        notes: initialValues?.notes ?? "",
        country_id: initialValues?.country_id ?? "India",
        state_ids: initialValues?.state_ids ?? [],
        city_ids: initialValues?.city_ids ?? "",
      });
    }
  }, [mode, initialValues, form]);
  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="min-h-screen bg-gray-100 p-5"
      >
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow">

          {/* HEADER */}
          <div className="border-b px-5 py-4">

            <h1 className="text-xl font-semibold">
              {isView ? "View Territory" : id ? "Edit Territory" : "Create New Territory"}
            </h1>

          </div>

          <div>

            {/* -------- TOP FIELDS -------- */}
            <SectionCard title="Territory Information">
              <div className="grid  grid-cols-1 md:grid-cols-3 gap-4">
                <FloatingField
                  isView={false}
                  isRequired={true}
                  name={'name'}
                  label={'Territory Name'}
                  control={form.control}
                />

                <FloatingRHFSelect
                  name="store_id"
                  label="Franchise"
                  control={form.control}
                  isDisabled={false}
                  options={FRANCHISES.map(c => ({
                    value: String(c.value),
                    label: c.label,
                  }))}
                  onValueChange={async (value) => {

                  }}
                />

                <FloatingRHFSelect
                  name="country_id"
                  label="Country"
                  control={form.control}
                  isRequired
                  isDisabled={isView}
                  options={countryList.map(c => ({
                    value: String(c.id),
                    label: c.name,
                  }))}
                  onValueChange={async (value) => {
                    if (isHydratingRef.current) return;

                    setStates([]);
                    setCities([]);
                    form.setValue("state_ids", []);
                    form.setValue("city_ids", []);

                    setLoadingState(true);
                    const stateList = await fetchStateList(Number(value));
                    setStates(stateList);
                    setLoadingState(false);
                  }}
                />

              </div>
              <div className="grid pt-5 gap-4  grid-cols-1 md:grid-cols-2 ">
                <FloatingRHFSelect
                  name="state_ids"
                  label="State"
                  isMulti
                  control={form.control}
                  isRequired
                  isDisabled={isView || !form.getValues("country_id")}
                  options={states.map(s => ({
                    value: String(s.id),
                    label: s.name,
                  }))}
                  onValueChange={async (values) => {
                    if (isHydratingRef.current) return;

                    form.setValue("city_ids", []);
                    setCities([]);

                    // ✅ normalize to array
                    const stateIds = Array.isArray(values) ? values : [values];

                    if (!stateIds.length) return;

                    setLoadingCity(true);

                    try {
                      const cityList = await fetchCitiesByStates(
                        stateIds.map(id => Number(id))
                      );
                      setCities(cityList);
                    } finally {
                      setLoadingCity(false);
                    }
                  }}

                />

                <FloatingRHFSelect
                  name="city_ids"
                  label="City"
                  isMulti
                  control={form.control}
                  isRequired
                  isDisabled={isView || !form.getValues("state_ids")}
                  options={cities.map(c => ({
                    value: String(c.id),
                    label: c.name,
                  }))}
                />
              </div>
            </SectionCard>


            <SectionCard title="Additional Notes">
              <FloatingTextarea
                name="notes"
                label="Notes"
                isView={isView}
                control={form.control}
              />

            </SectionCard>

            {/* FOOTER */}
            {mode !== 'view' && <div className="mt-5">
              <div className="border-t px-5 py-4 flex justify-end gap-3">
                <Button
                  variant="outline"
                  disabled={isLoading}
                  className={'hover:bg-[#E3EDF6] hover:text-[#000]'}
                  onClick={() => navigate("/master")}
                >
                  {'Cancel'}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#FE0000] hover:bg-[rgb(238,6,6)]"
                >
                  {isLoading && <Loader isShowLoadingText={false} />}
                  {isLoading
                    ? id ?  "Updating...":"Adding..." 
                    : id ? "Update " : "Add "}
                </Button>
              </div></div>}
          </div>
        </div>
      </form>
    </Form>
  );
}
