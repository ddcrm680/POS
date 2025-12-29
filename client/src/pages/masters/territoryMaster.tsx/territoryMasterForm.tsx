"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, UseFormSetError } from "react-hook-form";
import { ChevronDown, ChevronLeft, ChevronUp, Search } from "lucide-react";

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
import { EditTerritory, fetchCitiesByStates, fetchCityList, fetchStateList, fetchStoreCrispList, fetchTerritoryById, fetchUnassignedStoreList, SaveTerritory } from "@/lib/api";
import { FloatingTextarea } from "@/components/common/FloatingTextarea";
import { storeFormProp, storeListType, TerritoryFormApiValues, TerritoryFormValues, TerritoryMasterApiType } from "@/lib/types";
import { FRANCHISES } from "@/lib/mockData";
import { zodResolver } from "@hookform/resolvers/zod";
import { TerritoryMasterSchema } from "@/lib/schema";
import { buildGroupedCityOptions, findIdByName, findIdsByNames } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function TerritoryMasterForm() {
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

  const prevStateIdsRef = useRef<string[]>([]);
  const [initialValues, setInitialValues] = useState<TerritoryFormApiValues | null>(null)
  const [storeList, setStoreList] = useState<storeListType[]>([])
  useEffect(() => {

    if (!countryList.length) return;

    if ((!mode) &&
      countryList.length) {
      const hydrateLocation = async () => {
        // 1️⃣ COUNTRY
        isHydratingRef.current = true;
        try {
          const countryId = findIdByName(countryList, "101");

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
        if (!initialValues?.country) return;

        /* 1️⃣ COUNTRY */
        const countryId = initialValues.country.id;
        form.setValue("country_id", String(countryId));

        /* 2️⃣ FETCH STATES (✅ REQUIRED) */
        setLoadingState(true);
        const stateList = await fetchStateList(countryId);
        setStates(stateList);
        setLoadingState(false);

        /* 3️⃣ SET STATES */
        if (initialValues.state_ids?.length) {
          const stateIds = initialValues.state_ids.map(String);
          form.setValue("state_ids", stateIds);

          /* 4️⃣ FETCH CITIES */
          setLoadingCity(true);
          const cityList = await fetchCitiesByStates(
            initialValues.state_ids.map(Number)
          );
          setCities(cityList);
          setLoadingCity(false);

          /* 5️⃣ SET CITIES */
          if (initialValues.city_ids?.length) {
            form.setValue(
              "city_ids",
              initialValues.city_ids.map(String)
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
  const [isInfoLoading, setIsInfoLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingState, setLoadingState] = useState(false);
  const [loadingCity, setLoadingCity] = useState(false);
  const fetchTerritoryMaster = async () => {
    try {
      setIsInfoLoading(true);
      const res =
        await fetchTerritoryById(id ?? "");

      setInitialValues(res.data)
    } catch (e) {
      console.error(e);

    } finally {
      setIsInfoLoading(false);
    }
  };
  const fetchStoreList = async () => {
    try {
      const res =
        !id ? await fetchUnassignedStoreList() : await fetchStoreCrispList();
      setStoreList(res?.data)
    } catch (e) {
      console.error(e);

    }
  };
  useEffect(() => {
    fetchStoreList()
    if (id) {
      fetchTerritoryMaster();

    }
  }, [id]);
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
      const updatedValues = {
        "name": value.name,
        "store_id": value.store_id ? Number(value.store_id) : null,
        "notes": value.notes,
        "country_id": Number(value.country_id),
        "state_ids": value.state_ids.map(item => Number(item)),
        "city_ids": value.city_ids.map(item => Number(item))
      }
      if (mode === "edit") {
        await EditTerritory({
          id: id ?? '',
          info: updatedValues
        });

        toast({
          title: "Edit Territory",
          description: "Territory updated successfully",
          variant: "success",
        });
      } else {
        await SaveTerritory(updatedValues);

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
    if (!initialValues ) return;
console.log(initialValues,'initialValues');

    if (mode === "edit" || mode === "view") {
      form.reset({
        name: initialValues.name ?? "",
        store_id: initialValues.store_id
          ? String(initialValues.store_id)
          : "",
        notes: initialValues.notes ?? "",
        country_id: initialValues.country?.id
          ? String(initialValues.country.id)
          : "",
        state_ids: initialValues.state_ids?.map(String) ?? [],
        city_ids: initialValues.city_ids?.map(String) ?? [],
      });
    }
  }, [mode, initialValues, storeList]);

  useEffect(() => {
    if (initialValues?.state_ids?.length) {
      prevStateIdsRef.current = initialValues.state_ids.map(String);
    }
  }, [initialValues]);

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="min-h-screen bg-gray-100 p-5"
      >
        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow">

          {/* HEADER */}
          <div className="border-b px-6 py-4 flex items-center gap-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => window.history.back()}
              className="
                flex items-center gap-1 justify-start -ml-2
                text-sm font-medium
                text-muted-black
                hover:text-foreground
                transition
              "
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-semibold">
              {isView ? "View Territory" : id ? "Edit Territory" : "Create New Territory"}
            </h1>

          </div>


          <div>
            {
              isInfoLoading ? <div className="min-h-[150px] flex justify-center items-center">
                <div className="p-6 text-sm "><Loader /></div>
              </div> : <div>     {/* -------- TOP FIELDS -------- */}
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
                      label="Store"
                      control={form.control}
                      isDisabled={false}
                      options={storeList.map(c => ({
                        value: String(c.id),
                        label: c.name,
                      }))}

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

                        const newStateIds = Array.isArray(values) ? values : [];
                        const prevStateIds = prevStateIdsRef.current;

                        // 🆕 added states
                        const added = newStateIds.filter(id => !prevStateIds.includes(id));

                        //  removed states
                        const removed = prevStateIds.filter(id => !newStateIds.includes(id));

                        // update ref
                        prevStateIdsRef.current = newStateIds;

                        /* ================= ADD STATES ================= */
                        if (added.length > 0) {
                          setLoadingCity(true);
                          try {
                            const newCities = await fetchCitiesByStates(
                              added.map(Number)
                            );

                            // merge (no duplicates)
                            setCities(prev => {
                              const map = new Map(prev.map(c => [String(c.id), c]));
                              newCities.forEach((c: any) => map.set(String(c.id), c));
                              return Array.from(map.values());
                            });
                          } finally {
                            setLoadingCity(false);
                          }
                        }

                        /* ================= REMOVE STATES ================= */
                        if (removed.length > 0) {
                          // remove city OPTIONS of removed states
                          setCities(prev =>
                            prev.filter(c => !removed.includes(String(c.state_id)))
                          );

                          // remove SELECTED city_ids of removed states
                          const selectedCityIds = form.getValues("city_ids");

                          const filteredCityIds = selectedCityIds.filter(cityId => {
                            const city = cities.find(c => String(c.id) === cityId);
                            return city && !removed.includes(String(city.state_id));
                          });

                          form.setValue("city_ids", filteredCityIds);
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
                      options={buildGroupedCityOptions(cities, states)}

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
              </div>
            }


            {/* FOOTER */}
            {mode !== 'view' && <div className="mt-5">
              <div className="border-t px-5 py-4 flex justify-end gap-3">
                <Button
                  variant="outline"
                  disabled={isLoading || isInfoLoading}
                  className={'hover:bg-[#E3EDF6] hover:text-[#000]'}
                  onClick={() => navigate("/master")}
                >
                  {'Cancel'}
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || isInfoLoading}
                  className="bg-[#FE0000] hover:bg-[rgb(238,6,6)]"
                >
                  {isLoading && <Loader color="#fff" isShowLoadingText={false} />}
                  {isLoading
                    ? id ? "Updating..." : "Adding..."
                    : id ? "Update " : "Add "}
                </Button>
              </div></div>}
          </div>
        </div>
      </form>
    </Form>
  );
}
