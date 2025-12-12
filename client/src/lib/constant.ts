import { ServiceItem } from "./types";

export const Constant={
     REACT_APP_BASE_URL: 'https://pos.detailingdevils.com',

    login:{
        logoUrl: "https://mycrm.detailingdevils.com/assets/images/logo.png",
       loginSuccessMessage: "Login successful! Welcome back.",
       loginFailureMessage: "Login failed. Unable to login.",
    }
}

export const RoleList={
    'super-admin': "Super Admin",
    STORE_MANAGER: 'Store Manager',
  
}

// Vehicle makes and models
export const vehicleMakes = ['Honda', 'Toyota', 'Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Ford', 'BMW', 'Mercedes-Benz', 'Audi'];
export const vehicleModels = {
  'Honda': ['City', 'Civic', 'Accord', 'CR-V', 'Amaze'],
  'Toyota': ['Innova', 'Fortuner', 'Camry', 'Corolla', 'Etios'],
  'Maruti Suzuki': ['Swift', 'Baleno', 'Dzire', 'Vitara Brezza', 'Alto'],
  'Hyundai': ['i20', 'Creta', 'Verna', 'Santro', 'Tucson'],
  'Tata': ['Nexon', 'Harrier', 'Safari', 'Altroz', 'Tiago'],
  'Mahindra': ['XUV500', 'Scorpio', 'Bolero', 'Thar', 'KUV100'],
  'Ford': ['EcoSport', 'Endeavour', 'Figo', 'Aspire', 'Mustang'],
  'BMW': ['3 Series', '5 Series', 'X3', 'X5', 'Z4'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'GLC', 'GLE', 'A-Class'],
  'Audi': ['A4', 'A6', 'Q3', 'Q5', 'Q7']
};
// Available services for POS
export const availableServices: ServiceItem[] = [
  { id: '1', name: 'Basic Exterior Wash', price: 500, description: 'Exterior wash and dry', category: 'Basic' },
  { id: '2', name: 'Premium Interior Detailing', price: 1200, description: 'Complete interior cleaning and protection', category: 'Premium' },
  { id: '3', name: 'Ceramic Coating Kit', price: 4500, description: '6-month ceramic protection', category: 'Protection' },
  { id: '4', name: 'Paint Correction Service', price: 3000, description: 'Remove scratches and swirl marks', category: 'Correction' },
  { id: '5', name: 'Full Car PPF Installation', price: 18000, description: 'Complete paint protection film', category: 'Protection' },
  { id: '6', name: 'Engine Bay Cleaning', price: 800, description: 'Professional engine compartment cleaning', category: 'Detailing' }
];