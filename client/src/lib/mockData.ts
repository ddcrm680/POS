import { Value } from "@radix-ui/react-select";

export const vehicleListInfo = {
  data: [
    {
      id: 1,
      company: "HYUNDAI",
      model: ["Creta", "i20", "Verna"],
    },
    {
      id: 2,
      company: "TATA",
      model: ["Nexon", "Harrier", "Safari"],
    },
    {
      id: 3,
      company: "MARUTI",
      model: ["Swift", "Baleno", "Brezza"],
    },
    {
      id: 4,
      company: "HONDA",
      model: ["City", "Amaze"],
    },
  ],
  meta: {
    current_page: 1,
    per_page: 2,
    last_page: 2,
    total: 4,
    from: 1,
    to: 10,
    has_next: true,
  },
};
export const servicePlanMockResponse = {
  data: [
    {
      id: 1,
      date_created: "2024-04-10",
      vehicle_type: "Sedan",
        invoice_name:"invoice",

      plan_name: "Bonnet Coating",
      category_type: "Bonnet Protection",
      number_of_visits: 1,
      sac: "9997",
       warranty_period: "1",
  warranty_in: "months" ,

      price: 2000,
      gst: 18,
      duration: "6 Month",
      description: "Ceramic coating of bonnet of the car",
      raw_materials: ["PERFECTION FLUID"],
      status: "0",
    },
    {
      id: 2,
      date_created: "2024-04-10",
      vehicle_type: "Sedan",
        invoice_name:"invoice",

      plan_name: "Bonnet Coating",
      category_type: "Bonnet Protection",
      number_of_visits: 1,
      sac: "9997",
       warranty_period: "1",
  warranty_in: "months" ,

      price: 2000,
      gst: 18,
      duration: "12 Month",
      description: "Complete ceramic coating for full car body",
      raw_materials: ["PERFECTION FLUID", "NANO SHIELD"],
      status: "1",
    },
    {
      id: 3,
       date_created: "2024-04-10",
      vehicle_type: "Sedan",
        invoice_name:"invoice",

      plan_name: "Bonnet Coating",
      category_type: "Bonnet Protection",
      number_of_visits: 1,
      sac: "9997",
       warranty_period: "1",
  warranty_in: "months" ,

      price: 2000,
      gst: 18,
      duration: "3 Month",
      description: "Deep interior cleaning and protection",
      raw_materials: ["INTERIOR FOAM", "LEATHER CONDITIONER"],
      status: "1",
    },
  ],
  meta: {
    current_page: 1,
    per_page: 10,
    last_page: 1,
    total: 3,
    from: 1,
    to: 3,
    has_next: false,
  },
};
export const vehicleType = [
  {
    name: "Sedan",
    id: "Sedan"
  },
  {
    name: "Hatchback",
    id: "Hatchback"
  },
  {
    name: "SUV",
    id: "SUV"
  },
]
export const planName = [
  {
    name: "Full Body Coating",
    id: "Full Body Coating"
  },
  {
    name: "Interior Detailing",
    id: "Interior Detailing"
  },
  {
    name: "Bonnet Coating",
    id: "Bonnet Coating"
  },
]
export const categoryType = [
  {
    name: "Interior Care",
    id: "Interior Care"
  },
  {
    name: "Body Protection",
    id: "Body Protection"
  },
  {
    name: "Bonnet Protection",
    id: "Bonnet Protection"
  },
]
export const warrantyPeriod = [
  {
    name: "1",
    id: "1"
  },
  {
    name: "2",
    id: "2"
  },
  {
    name: "3",
    id: "3"
  },
  {
    name: "4",
    id: "4"
  },
]
export const warrantyType = [
  {
    name: "Month",
    id: "months"
  },
  {
    name: "Year",
    id: "years"
  },
]
export const numberOfVisit  = [
  {
    name: "1",
    id: "1"
  },
  {
    name: "2",
    id: "2"
  },
  {
    name: "3",
    id: "3"
  },
  {
    name: "4",
    id: "4"
  },
]