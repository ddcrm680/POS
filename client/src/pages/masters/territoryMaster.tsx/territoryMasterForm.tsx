"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
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
import { fetchCitiesByStates, fetchCityList, fetchStateList } from "@/lib/api";
import { FloatingTextarea } from "@/components/common/FloatingTextarea";
import { storeFormProp, TerritoryFormValues } from "@/lib/types";
import { FRANCHISES } from "@/lib/mockData";
import { zodResolver } from "@hookform/resolvers/zod";
import { TerritoryMasterSchema } from "@/lib/schema";
import { findIdByName, findIdsByNames } from "@/lib/utils";

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
      territory_name: "",
      franchise: "",
      notes: "",
      country: "India",
      states: [],
      city: [],
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
          form.setValue("country", String(countryId));

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
          initialValues?.country || "India"
        );
        if (!countryId) return;

        form.setValue("country", String(countryId));

        /* 2️⃣ STATES (already IDs from backend) */
        if (initialValues?.states?.length) {
          const stateIds = initialValues.states.map((id: any) => String(id));
          form.setValue("states", stateIds);

          /* 3️⃣ FETCH CITIES (SINGLE API CALL ✅) */
          setLoadingCity(true);
          const cityList = await fetchCitiesByStates(
            stateIds.map(Number)
          );
          setCities(cityList);
          setLoadingCity(false);

          /* 4️⃣ SET CITIES */
          if (initialValues?.city?.length) {
            form.setValue(
              "city",
              initialValues.city.map((id: any) => String(id))
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
    console.log("Territory payload →", values);
  };
  useEffect(() => {
    if (mode === "edit" || mode === "view") {
      console.log(initialValues, 'initialValues');


      form.reset({
        territory_name: initialValues?.territory_name ?? "",
        franchise: initialValues?.franchise ?? "",
        notes: initialValues?.notes ?? "",
        country: initialValues?.country ?? "India",
        states: initialValues?.states ?? [],
        city: initialValues?.city ?? "",
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
                  name={'territory_name'}
                  label={'Territory Name'}
                  control={form.control}
                />

                <FloatingRHFSelect
                  name="franchise"
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
                  name="country"
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
                    form.setValue("states", []);
                    form.setValue("city", []);

                    setLoadingState(true);
                    const stateList = await fetchStateList(Number(value));
                    setStates(stateList);
                    setLoadingState(false);
                  }}
                />

              </div>
              <div className="grid pt-5 gap-4  grid-cols-1 md:grid-cols-2 ">
                <FloatingRHFSelect
                  name="states"
                  label="State"
                  isMulti
                  control={form.control}
                  isRequired
                  isDisabled={isView || !form.getValues("country")}
                  options={states.map(s => ({
                    value: String(s.id),
                    label: s.name,
                  }))}
                  onValueChange={async (values) => {
                    if (isHydratingRef.current) return;

                    form.setValue("city", []);
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
                  name="city"
                  label="City"
                  isMulti
                  control={form.control}
                  isRequired
                  isDisabled={isView || !form.getValues("states")}
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
                  {isLoading && <Loader />}
                  {isLoading
                    ? mode === "create" ? "Adding..." : "Updating..."
                    : id ? "Update " : "Create "}
                </Button>
              </div></div>}
          </div>
        </div>
      </form>
    </Form>
  );
}
