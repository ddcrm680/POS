// SOP Checklist Templates for Different Service Types

export interface SOPStep {
  stepId: string;
  name: string;
  description?: string;
  required: boolean;
  photoRequired: boolean;
  photoType?: 'before' | 'after' | 'process' | 'damage' | 'inspection';
  estimatedTimeMinutes?: number;
  category?: string;
  instructions?: string; // Detailed step-by-step instructions
  photoInstructions?: string; // Specific photo angles and requirements
  requiredPhotos?: number; // Number of photos required for this step
  checkpoints?: string[]; // Sub-checkpoints to verify
  area?: 'interior' | 'exterior' | 'engine' | 'trunk' | 'general'; // Vehicle area
}

export interface SOPTemplate {
  templateId: string;
  serviceName: string;
  serviceType: string;
  totalSteps: number;
  estimatedDurationMinutes: number;
  steps: SOPStep[];
}

// Predefined SOP Templates
export const SOP_TEMPLATES: Record<string, SOPTemplate> = {
  // Basic Car Wash
  'car-wash-basic': {
    templateId: 'car-wash-basic',
    serviceName: 'Basic Car Wash',
    serviceType: 'washing',
    totalSteps: 8,
    estimatedDurationMinutes: 45,
    steps: [
      {
        stepId: 'pre-rinse',
        name: 'Pre-Rinse Vehicle',
        description: 'Remove loose dirt and debris',
        required: true,
        photoRequired: true,
        photoType: 'before',
        estimatedTimeMinutes: 5,
        category: 'preparation',
        area: 'exterior',
        instructions: 'Rinse entire vehicle to remove loose dirt, debris, and surface contamination before washing',
        photoInstructions: 'Take photos showing vehicle before washing from all 4 sides',
        requiredPhotos: 4,
        checkpoints: ['Vehicle completely rinsed', 'No loose debris remaining', 'Wheels pre-rinsed']
      },
      {
        stepId: 'wheel-clean',
        name: 'Clean Wheels & Tires',
        description: 'Apply wheel cleaner and scrub',
        required: true,
        photoRequired: true,
        photoType: 'process',
        estimatedTimeMinutes: 10,
        category: 'cleaning',
        area: 'exterior',
        instructions: 'Apply appropriate wheel cleaner to all wheels and tires, scrub thoroughly with wheel brush',
        photoInstructions: 'Photo each wheel during cleaning process, showing before and after condition',
        requiredPhotos: 4,
        checkpoints: ['All wheels cleaned', 'Tire sidewalls scrubbed', 'Wheel wells cleaned', 'Brake dust removed']
      },
      {
        stepId: 'soap-application',
        name: 'Apply Soap Solution',
        description: 'Cover entire vehicle with soap foam',
        required: true,
        photoRequired: true,
        photoType: 'process',
        estimatedTimeMinutes: 5,
        category: 'cleaning',
        area: 'exterior',
        instructions: 'Apply car wash soap solution evenly across entire vehicle surface using proper technique',
        photoInstructions: 'Show vehicle fully covered in soap foam',
        requiredPhotos: 2,
        checkpoints: ['Vehicle fully foamed', 'Even soap distribution', 'Proper soap concentration']
      },
      {
        stepId: 'hand-wash',
        name: 'Hand Wash Body',
        description: 'Wash from top to bottom using mitt',
        required: true,
        photoRequired: true,
        photoType: 'process',
        estimatedTimeMinutes: 15,
        category: 'cleaning',
        area: 'exterior',
        instructions: 'Use two-bucket method, wash from top to bottom, rinse mitt frequently',
        photoInstructions: 'Document washing process and technique being used',
        requiredPhotos: 3,
        checkpoints: ['Top-to-bottom technique used', 'Mitt rinsed frequently', 'Two-bucket method followed', 'All surfaces washed']
      },
      {
        stepId: 'final-rinse',
        name: 'Final Rinse',
        description: 'Thoroughly rinse all soap',
        required: true,
        photoRequired: false,
        estimatedTimeMinutes: 5,
        category: 'cleaning'
      },
      {
        stepId: 'drying',
        name: 'Dry Vehicle',
        description: 'Use microfiber towels or air dry',
        required: true,
        photoRequired: true,
        photoType: 'after',
        estimatedTimeMinutes: 10,
        category: 'finishing'
      },
      {
        stepId: 'interior-vacuum',
        name: 'Vacuum Interior',
        description: 'Clean seats, mats, and surfaces',
        required: false,
        photoRequired: true,
        photoType: 'after',
        estimatedTimeMinutes: 8,
        category: 'interior',
        area: 'interior',
        instructions: 'Remove floor mats, vacuum seats, carpets, crevices, and all interior surfaces thoroughly',
        photoInstructions: 'Show vacuumed interior from multiple angles, including floor mats',
        requiredPhotos: 4,
        checkpoints: ['Floor mats removed and vacuumed', 'Seats thoroughly cleaned', 'Carpets vacuumed', 'Crevices cleaned']
      },
      {
        stepId: 'quality-check',
        name: 'Final Quality Check',
        description: 'Inspect all areas for completion',
        required: true,
        photoRequired: true,
        photoType: 'after',
        estimatedTimeMinutes: 3,
        category: 'quality',
        area: 'general',
        instructions: 'Perform comprehensive quality inspection of entire vehicle, checking all completed work',
        photoInstructions: 'Document final result from all angles, highlighting quality of work completed',
        requiredPhotos: 6,
        checkpoints: ['Exterior completely clean', 'Interior properly cleaned', 'No missed areas', 'Customer satisfaction standard met']
      }
    ]
  },

  // Full Service Detailing
  'full-detailing': {
    templateId: 'full-detailing',
    serviceName: 'Full Service Detailing',
    serviceType: 'detailing',
    totalSteps: 12,
    estimatedDurationMinutes: 180,
    steps: [
      {
        stepId: 'initial-inspection',
        name: 'Initial Inspection',
        description: 'Document pre-service condition',
        required: true,
        photoRequired: true,
        photoType: 'before',
        estimatedTimeMinutes: 10,
        category: 'inspection'
      },
      {
        stepId: 'interior-removal',
        name: 'Remove Interior Items',
        description: 'Clear all personal items',
        required: true,
        photoRequired: true,
        photoType: 'before',
        estimatedTimeMinutes: 5,
        category: 'preparation'
      },
      {
        stepId: 'pre-wash',
        name: 'Pre-Wash Treatment',
        description: 'Apply degreaser and pre-rinse',
        required: true,
        photoRequired: false,
        estimatedTimeMinutes: 10,
        category: 'preparation'
      },
      {
        stepId: 'wheel-detail',
        name: 'Detailed Wheel Clean',
        description: 'Deep clean wheels, tires, and wells',
        required: true,
        photoRequired: true,
        photoType: 'process',
        estimatedTimeMinutes: 20,
        category: 'cleaning'
      },
      {
        stepId: 'paint-wash',
        name: 'Paint Wash',
        description: 'Two-bucket method wash',
        required: true,
        photoRequired: false,
        estimatedTimeMinutes: 25,
        category: 'cleaning'
      },
      {
        stepId: 'clay-treatment',
        name: 'Clay Bar Treatment',
        description: 'Remove embedded contaminants',
        required: false,
        photoRequired: true,
        photoType: 'process',
        estimatedTimeMinutes: 30,
        category: 'preparation'
      },
      {
        stepId: 'paint-correction',
        name: 'Paint Correction',
        description: 'Polish and compound as needed',
        required: false,
        photoRequired: true,
        photoType: 'process',
        estimatedTimeMinutes: 45,
        category: 'enhancement'
      },
      {
        stepId: 'wax-sealant',
        name: 'Apply Wax/Sealant',
        description: 'Protect paint with wax or sealant',
        required: true,
        photoRequired: true,
        photoType: 'process',
        estimatedTimeMinutes: 20,
        category: 'protection'
      },
      {
        stepId: 'interior-deep-clean',
        name: 'Deep Interior Clean',
        description: 'Shampoo carpets, clean all surfaces',
        required: true,
        photoRequired: true,
        photoType: 'process',
        estimatedTimeMinutes: 40,
        category: 'interior'
      },
      {
        stepId: 'glass-clean',
        name: 'Clean All Glass',
        description: 'Interior and exterior glass cleaning',
        required: true,
        photoRequired: false,
        estimatedTimeMinutes: 15,
        category: 'finishing'
      },
      {
        stepId: 'final-details',
        name: 'Final Detail Work',
        description: 'Trim, tires, and touch-ups',
        required: true,
        photoRequired: true,
        photoType: 'after',
        estimatedTimeMinutes: 20,
        category: 'finishing'
      },
      {
        stepId: 'final-inspection',
        name: 'Final Quality Inspection',
        description: 'Complete quality check and photos',
        required: true,
        photoRequired: true,
        photoType: 'after',
        estimatedTimeMinutes: 10,
        category: 'quality'
      }
    ]
  },

  // Oil Change Service
  'oil-change': {
    templateId: 'oil-change',
    serviceName: 'Oil Change Service',
    serviceType: 'maintenance',
    totalSteps: 8,
    estimatedDurationMinutes: 30,
    steps: [
      {
        stepId: 'safety-check',
        name: 'Safety Inspection',
        description: 'Check vehicle condition and safety',
        required: true,
        photoRequired: true,
        photoType: 'before',
        estimatedTimeMinutes: 3,
        category: 'safety',
        area: 'general',
        instructions: 'Perform comprehensive safety check including lights, fluids, belts, hoses, battery condition',
        photoInstructions: 'Document engine bay condition, fluid levels, any safety concerns identified',
        requiredPhotos: 3,
        checkpoints: ['Engine bay inspected', 'Fluid levels checked', 'Battery condition assessed', 'Belts and hoses examined', 'Warning lights checked']
      },
      {
        stepId: 'lift-vehicle',
        name: 'Lift Vehicle Safely',
        description: 'Position and secure on lift',
        required: true,
        photoRequired: true,
        photoType: 'process',
        estimatedTimeMinutes: 2,
        category: 'preparation',
        area: 'general',
        instructions: 'Position vehicle properly on lift, ensure secure contact points, verify safety locks',
        photoInstructions: 'Document proper lift positioning and safety measures',
        requiredPhotos: 2,
        checkpoints: ['Vehicle positioned correctly', 'Lift points secured', 'Safety locks engaged', 'Area cleared of obstacles']
      },
      {
        stepId: 'drain-oil',
        name: 'Drain Old Oil',
        description: 'Remove drain plug and drain completely',
        required: true,
        photoRequired: true,
        photoType: 'process',
        estimatedTimeMinutes: 8,
        category: 'service',
        area: 'engine',
        instructions: 'Locate drain plug, position drain pan, remove plug, allow complete drainage',
        photoInstructions: 'Photo old oil condition, drain plug, and drainage process',
        requiredPhotos: 3,
        checkpoints: ['Drain plug located and accessed', 'Oil completely drained', 'Old oil condition documented', 'Drain plug inspected']
      },
      {
        stepId: 'replace-filter',
        name: 'Replace Oil Filter',
        description: 'Remove old filter and install new',
        required: true,
        photoRequired: true,
        photoType: 'process',
        estimatedTimeMinutes: 5,
        category: 'service'
      },
      {
        stepId: 'install-plug',
        name: 'Install Drain Plug',
        description: 'Clean and torque drain plug',
        required: true,
        photoRequired: false,
        estimatedTimeMinutes: 2,
        category: 'service'
      },
      {
        stepId: 'add-oil',
        name: 'Add New Oil',
        description: 'Add correct type and amount',
        required: true,
        photoRequired: true,
        photoType: 'process',
        estimatedTimeMinutes: 5,
        category: 'service'
      },
      {
        stepId: 'check-levels',
        name: 'Check Oil Level',
        description: 'Verify proper oil level on dipstick',
        required: true,
        photoRequired: true,
        photoType: 'after',
        estimatedTimeMinutes: 3,
        category: 'verification'
      },
      {
        stepId: 'test-run',
        name: 'Test Run Engine',
        description: 'Run engine and check for leaks',
        required: true,
        photoRequired: false,
        estimatedTimeMinutes: 5,
        category: 'verification'
      }
    ]
  },

  // Tire Service
  'tire-service': {
    templateId: 'tire-service',
    serviceName: 'Tire Service',
    serviceType: 'maintenance',
    totalSteps: 6,
    estimatedDurationMinutes: 45,
    steps: [
      {
        stepId: 'tire-inspection',
        name: 'Inspect Current Tires',
        description: 'Check wear patterns and damage',
        required: true,
        photoRequired: true,
        photoType: 'before',
        estimatedTimeMinutes: 5,
        category: 'inspection',
        area: 'exterior',
        instructions: 'Examine each tire for tread depth, wear patterns, sidewall damage, foreign objects, proper inflation',
        photoInstructions: 'Document each tire condition, any irregular wear patterns, sidewall condition',
        requiredPhotos: 4,
        checkpoints: ['Tread depth measured', 'Wear patterns assessed', 'Sidewall damage checked', 'Tire pressure verified', 'Foreign objects removed']
      },
      {
        stepId: 'remove-wheels',
        name: 'Remove Wheels',
        description: 'Safely lift and remove wheels',
        required: true,
        photoRequired: true,
        photoType: 'process',
        estimatedTimeMinutes: 10,
        category: 'service'
      },
      {
        stepId: 'mount-tires',
        name: 'Mount New Tires',
        description: 'Mount and balance new tires',
        required: true,
        photoRequired: true,
        photoType: 'process',
        estimatedTimeMinutes: 20,
        category: 'service'
      },
      {
        stepId: 'balance-check',
        name: 'Balance Verification',
        description: 'Verify proper wheel balance',
        required: true,
        photoRequired: true,
        photoType: 'process',
        estimatedTimeMinutes: 5,
        category: 'quality'
      },
      {
        stepId: 'install-wheels',
        name: 'Install Wheels',
        description: 'Mount wheels and torque lugs',
        required: true,
        photoRequired: true,
        photoType: 'after',
        estimatedTimeMinutes: 8,
        category: 'service'
      },
      {
        stepId: 'pressure-check',
        name: 'Check Tire Pressure',
        description: 'Set proper tire pressure',
        required: true,
        photoRequired: true,
        photoType: 'after',
        estimatedTimeMinutes: 3,
        category: 'verification'
      }
    ]
  },

  // COMPREHENSIVE INSPECTION TEMPLATES

  // Pre-Service Vehicle Inspection (Check-in)
  'pre-service-inspection': {
    templateId: 'pre-service-inspection',
    serviceName: 'Pre-Service Vehicle Inspection',
    serviceType: 'inspection',
    totalSteps: 23,
    estimatedDurationMinutes: 20,
    steps: [
      // EXTERIOR INSPECTION
      {
        stepId: 'exterior-overview',
        name: 'Exterior Overview Documentation',
        description: 'Document overall exterior condition',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'exterior',
        instructions: 'Walk around vehicle to assess overall condition. Note any obvious damage, modifications, or concerns.',
        photoInstructions: 'Take 4 photos - front, rear, driver side, passenger side from 45-degree angles showing entire vehicle',
        requiredPhotos: 4,
        checkpoints: ['Overall cleanliness', 'Modifications present', 'Obvious damage visible', 'Customer accessories']
      },
      {
        stepId: 'paint-condition-front',
        name: 'Front Paint & Body Inspection',
        description: 'Inspect front bumper, hood, and fenders for damage',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'exterior',
        instructions: 'Examine front bumper, hood, grille, and front fenders. Look for scratches, dents, chips, cracks, or previous repairs.',
        photoInstructions: 'Take close-up photos of any damage found. Include wide shot of entire front end.',
        requiredPhotos: 2,
        checkpoints: ['Hood condition', 'Bumper damage', 'Grille intact', 'Headlight condition', 'Front fender dents', 'Paint chips']
      },
      {
        stepId: 'paint-condition-sides',
        name: 'Side Panel & Door Inspection',
        description: 'Inspect doors, panels, and trim on both sides',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 3,
        category: 'inspection',
        area: 'exterior',
        instructions: 'Check all doors, side panels, mirror housings, and trim. Open doors to check edges and hinges.',
        photoInstructions: 'Document each side with wide shot, then close-ups of any damage. Include door edges.',
        requiredPhotos: 4,
        checkpoints: ['Door dents/scratches', 'Panel alignment', 'Trim condition', 'Mirror damage', 'Handle condition', 'Door edge chips']
      },
      {
        stepId: 'paint-condition-rear',
        name: 'Rear Paint & Body Inspection',
        description: 'Inspect rear bumper, trunk/hatch, and quarters',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'exterior',
        instructions: 'Examine rear bumper, trunk/hatch, quarter panels, and taillights. Check for damage and proper alignment.',
        photoInstructions: 'Take wide shot of rear end, close-ups of any damage or misalignment.',
        requiredPhotos: 2,
        checkpoints: ['Rear bumper condition', 'Trunk/hatch alignment', 'Quarter panel dents', 'Taillight condition', 'License plate area']
      },
      {
        stepId: 'wheels-tires-inspection',
        name: 'Wheels & Tires Inspection',
        description: 'Inspect all four wheels and tires',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 3,
        category: 'inspection',
        area: 'exterior',
        instructions: 'Check each wheel for curb rash, scratches, or damage. Inspect tires for wear, damage, and proper inflation.',
        photoInstructions: 'Photo each wheel straight-on, include close-ups of any damage or unusual wear patterns.',
        requiredPhotos: 4,
        checkpoints: ['Wheel condition', 'Curb rash', 'Tire tread depth', 'Sidewall damage', 'Valve stems', 'Unusual wear patterns']
      },

      // INTERIOR INSPECTION
      {
        stepId: 'interior-overview',
        name: 'Interior Overview Documentation',
        description: 'Document overall interior condition',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'interior',
        instructions: 'Assess general interior cleanliness and condition. Note odors, stains, or damage.',
        photoInstructions: 'Take wide shots from both front doors showing entire interior, plus one from rear seat forward.',
        requiredPhotos: 3,
        checkpoints: ['Overall cleanliness', 'Odors present', 'General wear level', 'Personal items']
      },
      {
        stepId: 'front-seats-inspection',
        name: 'Front Seats Inspection',
        description: 'Inspect driver and passenger seats',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'interior',
        instructions: 'Check seat surfaces, bolsters, and mechanisms. Test seat adjustments and look for tears, stains, or wear.',
        photoInstructions: 'Photo each seat from multiple angles, close-ups of any damage or stains.',
        requiredPhotos: 4,
        checkpoints: ['Seat surface condition', 'Bolster wear', 'Stains present', 'Tears or holes', 'Seat adjustment function']
      },
      {
        stepId: 'rear-seats-inspection',
        name: 'Rear Seats Inspection',
        description: 'Inspect rear seating area',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'interior',
        instructions: 'Examine rear seat surfaces, fold-down mechanisms, and cargo area access.',
        photoInstructions: 'Wide shot of rear seating area, close-ups of any damage.',
        requiredPhotos: 2,
        checkpoints: ['Rear seat condition', 'Fold mechanisms', 'Child seat marks', 'Stains or damage']
      },
      {
        stepId: 'dashboard-console-inspection',
        name: 'Dashboard & Console Inspection',
        description: 'Inspect dashboard, center console, and controls',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'interior',
        instructions: 'Check dashboard surface, center console, cup holders, and storage areas for damage or excessive wear.',
        photoInstructions: 'Wide dashboard shot, close-ups of console area and any damage.',
        requiredPhotos: 3,
        checkpoints: ['Dashboard cracks', 'Console wear', 'Cup holder condition', 'Button/knob function', 'Screen condition']
      },
      {
        stepId: 'door-panels-inspection',
        name: 'Door Panels & Trim Inspection',
        description: 'Inspect all door panels and interior trim',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'interior',
        instructions: 'Examine door panels, armrests, window switches, and interior trim pieces.',
        photoInstructions: 'Photo each door panel, focus on armrests and high-wear areas.',
        requiredPhotos: 4,
        checkpoints: ['Door panel condition', 'Armrest wear', 'Switch function', 'Trim attachment', 'Handle condition']
      },
      {
        stepId: 'carpet-floor-inspection',
        name: 'Carpet & Floor Mat Inspection',
        description: 'Inspect carpets, floor mats, and floor condition',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'interior',
        instructions: 'Lift and examine floor mats, check carpet condition, look for stains, wear, or damage.',
        photoInstructions: 'Photo carpets with and without mats, close-ups of any stains or wear.',
        requiredPhotos: 4,
        checkpoints: ['Carpet stains', 'Mat condition', 'Pedal wear', 'Floor damage', 'Water damage signs']
      },
      {
        stepId: 'headliner-pillar-inspection',
        name: 'Headliner & Pillar Inspection',
        description: 'Inspect headliner, pillars, and overhead components',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 1,
        category: 'inspection',
        area: 'interior',
        instructions: 'Check headliner for sagging, stains, or damage. Inspect pillar trim and grab handles.',
        photoInstructions: 'Wide shot of headliner, close-ups of any sagging or stains.',
        requiredPhotos: 2,
        checkpoints: ['Headliner sagging', 'Stains on ceiling', 'Pillar trim condition', 'Grab handle function', 'Sunroof condition']
      },
      {
        stepId: 'interior-glass-inspection',
        name: 'Interior Glass Inspection',
        description: 'Inspect all interior glass surfaces',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'interior',
        instructions: 'Check all windows from inside, inspect mirrors, and note any tinting or film condition.',
        photoInstructions: 'Photo each window from inside showing condition, close-ups of any damage.',
        requiredPhotos: 5,
        checkpoints: ['Window tinting', 'Glass chips/cracks', 'Mirror condition', 'Film peeling', 'Visibility issues']
      },

      // ENGINE BAY INSPECTION
      {
        stepId: 'engine-bay-overview',
        name: 'Engine Bay Overview',
        description: 'Document engine bay condition',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'engine',
        instructions: 'Open hood and assess overall engine bay cleanliness and condition. Note any leaks, corrosion, or modifications.',
        photoInstructions: 'Wide shot of entire engine bay, additional angles to show all areas clearly.',
        requiredPhotos: 3,
        checkpoints: ['Overall cleanliness', 'Fluid leaks', 'Corrosion present', 'Modifications visible', 'Access panel condition']
      },
      {
        stepId: 'engine-components-inspection',
        name: 'Engine Components Inspection',
        description: 'Inspect visible engine components',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'engine',
        instructions: 'Check belts, hoses, fluid reservoirs, battery, and air filter housing for condition.',
        photoInstructions: 'Close-ups of battery, belts, hoses, and any areas of concern.',
        requiredPhotos: 4,
        checkpoints: ['Belt condition', 'Hose condition', 'Battery terminals', 'Fluid levels', 'Air filter housing', 'Visible wear/damage']
      },

      // TRUNK/CARGO INSPECTION
      {
        stepId: 'trunk-cargo-inspection',
        name: 'Trunk/Cargo Area Inspection',
        description: 'Inspect trunk or cargo area',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'trunk',
        instructions: 'Open trunk/hatch and inspect carpet, spare tire area, tools, and overall condition.',
        photoInstructions: 'Wide shot of cargo area, close-ups of spare tire well and any damage.',
        requiredPhotos: 3,
        checkpoints: ['Cargo carpet condition', 'Spare tire present', 'Tools present', 'Trunk liner condition', 'Water damage', 'Odors']
      },

      // EXTERIOR GLASS & LIGHTS
      {
        stepId: 'exterior-glass-lights',
        name: 'Exterior Glass & Lights Inspection',
        description: 'Inspect all exterior glass and lighting',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'exterior',
        instructions: 'Check windshield, side windows, rear glass for chips, cracks, or damage. Test all lights.',
        photoInstructions: 'Photo each glass surface showing condition, close-ups of any damage.',
        requiredPhotos: 6,
        checkpoints: ['Windshield condition', 'Side window damage', 'Rear glass condition', 'Headlight clarity', 'Taillight function', 'Turn signal operation']
      },

      // ODOMETER & DOCUMENTATION
      {
        stepId: 'odometer-documentation',
        name: 'Odometer & Vehicle Documentation',
        description: 'Document current odometer reading',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 1,
        category: 'inspection',
        area: 'general',
        instructions: 'Start engine and document current odometer reading. Note any warning lights on dashboard.',
        photoInstructions: 'Clear photo of odometer reading, dashboard with engine running showing any warning lights.',
        requiredPhotos: 2,
        checkpoints: ['Odometer reading', 'Warning lights', 'Engine starts normally', 'Dashboard display function']
      },

      // FINAL INSPECTION NOTES
      {
        stepId: 'inspection-summary',
        name: 'Inspection Summary & Notes',
        description: 'Complete inspection documentation',
        required: true,
        photoRequired: false,
        photoType: 'inspection',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'general',
        instructions: 'Review all findings, add any additional notes, and prepare summary for customer discussion.',
        checkpoints: ['All areas inspected', 'Key findings noted', 'Customer discussion points', 'Service recommendations']
      }
    ]
  },

  // Post-Service Quality Inspection (QC)
  'post-service-inspection': {
    templateId: 'post-service-inspection',
    serviceName: 'Post-Service Quality Inspection',
    serviceType: 'inspection',
    totalSteps: 18,
    estimatedDurationMinutes: 15,
    steps: [
      // QUALITY CHECK - EXTERIOR
      {
        stepId: 'qc-exterior-finish',
        name: 'Exterior Finish Quality Check',
        description: 'Verify quality of exterior cleaning/detailing',
        required: true,
        photoRequired: true,
        photoType: 'after',
        estimatedTimeMinutes: 3,
        category: 'quality',
        area: 'exterior',
        instructions: 'Inspect entire exterior for cleaning quality, missed spots, water marks, or damage.',
        photoInstructions: 'Take after photos from same angles as pre-service inspection.',
        requiredPhotos: 4,
        checkpoints: ['Paint finish quality', 'Water marks removed', 'Trim cleaned', 'No new damage', 'Consistent finish']
      },
      {
        stepId: 'qc-wheels-tires',
        name: 'Wheels & Tires Quality Check',
        description: 'Verify wheel and tire cleaning quality',
        required: true,
        photoRequired: true,
        photoType: 'after',
        estimatedTimeMinutes: 2,
        category: 'quality',
        area: 'exterior',
        instructions: 'Check all wheels for proper cleaning, tire shine application, and overall appearance.',
        photoInstructions: 'Photo each wheel showing final result.',
        requiredPhotos: 4,
        checkpoints: ['Wheel cleanliness', 'Tire shine application', 'Wheel wells cleaned', 'No residue left']
      },
      {
        stepId: 'qc-glass-exterior',
        name: 'Exterior Glass Quality Check',
        description: 'Verify all exterior glass is properly cleaned',
        required: true,
        photoRequired: true,
        photoType: 'after',
        estimatedTimeMinutes: 2,
        category: 'quality',
        area: 'exterior',
        instructions: 'Check all exterior glass for streaks, spots, or missed areas.',
        photoInstructions: 'Photo glass surfaces showing clarity and cleanliness.',
        requiredPhotos: 3,
        checkpoints: ['No streaks', 'No water spots', 'Complete coverage', 'Mirror cleanliness']
      },

      // QUALITY CHECK - INTERIOR
      {
        stepId: 'qc-interior-surfaces',
        name: 'Interior Surfaces Quality Check',
        description: 'Verify quality of interior cleaning',
        required: true,
        photoRequired: true,
        photoType: 'after',
        estimatedTimeMinutes: 3,
        category: 'quality',
        area: 'interior',
        instructions: 'Inspect all interior surfaces for proper cleaning, protection application, and finish quality.',
        photoInstructions: 'Wide shots of interior showing final result, close-ups of treated areas.',
        requiredPhotos: 5,
        checkpoints: ['Dashboard finish', 'Seat condition', 'Door panel cleaning', 'Console cleanliness', 'Trim protection']
      },
      {
        stepId: 'qc-carpet-mats',
        name: 'Carpet & Mats Quality Check',
        description: 'Verify carpet and floor mat cleaning quality',
        required: true,
        photoRequired: true,
        photoType: 'after',
        estimatedTimeMinutes: 2,
        category: 'quality',
        area: 'interior',
        instructions: 'Check carpets and mats for proper cleaning, stain removal, and final appearance.',
        photoInstructions: 'Photo carpets and mats showing final condition.',
        requiredPhotos: 4,
        checkpoints: ['Carpet cleanliness', 'Stain removal', 'Mat condition', 'Vacuum quality', 'No residue']
      },
      {
        stepId: 'qc-interior-glass',
        name: 'Interior Glass Quality Check',
        description: 'Verify interior glass cleaning quality',
        required: true,
        photoRequired: true,
        photoType: 'after',
        estimatedTimeMinutes: 1,
        category: 'quality',
        area: 'interior',
        instructions: 'Check all interior glass surfaces for streaks, spots, or film residue.',
        photoInstructions: 'Photo interior glass showing clarity.',
        requiredPhotos: 3,
        checkpoints: ['No streaks', 'Film removal complete', 'Mirror cleanliness', 'Visibility clear']
      },

      // ENGINE BAY QC (if applicable)
      {
        stepId: 'qc-engine-bay',
        name: 'Engine Bay Quality Check',
        description: 'Verify engine bay cleaning quality (if serviced)',
        required: false,
        photoRequired: true,
        photoType: 'after',
        estimatedTimeMinutes: 2,
        category: 'quality',
        area: 'engine',
        instructions: 'If engine bay was serviced, verify cleaning quality and proper protection of components.',
        photoInstructions: 'Wide shot of cleaned engine bay.',
        requiredPhotos: 2,
        checkpoints: ['Component cleaning', 'No water in electronics', 'Proper protection', 'Overall appearance']
      },

      // TRUNK/CARGO QC
      {
        stepId: 'qc-trunk-cargo',
        name: 'Trunk/Cargo Area Quality Check',
        description: 'Verify trunk/cargo area cleaning quality',
        required: true,
        photoRequired: true,
        photoType: 'after',
        estimatedTimeMinutes: 1,
        category: 'quality',
        area: 'trunk',
        instructions: 'Check trunk/cargo area for proper cleaning and organization.',
        photoInstructions: 'Wide shot of clean trunk area.',
        requiredPhotos: 2,
        checkpoints: ['Carpet cleaning', 'Spare tire area', 'Tool organization', 'Overall cleanliness']
      },

      // FUNCTIONAL CHECKS
      {
        stepId: 'qc-functional-check',
        name: 'Functional Systems Check',
        description: 'Verify all systems function properly after service',
        required: true,
        photoRequired: false,
        photoType: 'after',
        estimatedTimeMinutes: 2,
        category: 'quality',
        area: 'general',
        instructions: 'Test key vehicle functions to ensure nothing was damaged during service.',
        checkpoints: ['Engine starts', 'Electronics function', 'Windows operate', 'Lights work', 'A/C operates', 'Radio functions']
      },

      // FINAL INSPECTION
      {
        stepId: 'qc-final-walkthrough',
        name: 'Final Quality Walkthrough',
        description: 'Complete final inspection before customer pickup',
        required: true,
        photoRequired: true,
        photoType: 'after',
        estimatedTimeMinutes: 2,
        category: 'quality',
        area: 'general',
        instructions: 'Perform final walkthrough to ensure service meets company standards and customer expectations.',
        photoInstructions: 'Final beauty shots of completed vehicle - same angles as initial inspection.',
        requiredPhotos: 4,
        checkpoints: ['Service completion', 'Quality standards met', 'No defects present', 'Ready for delivery']
      }
    ]
  },

  // During-Service Inspection (Mid-Service Quality Check)
  'during-service-inspection': {
    templateId: 'during-service-inspection',
    serviceName: 'During-Service Quality Check',
    serviceType: 'inspection',
    totalSteps: 12,
    estimatedDurationMinutes: 10,
    steps: [
      // MID-SERVICE PROGRESS DOCUMENTATION
      {
        stepId: 'mid-service-progress',
        name: 'Mid-Service Progress Documentation',
        description: 'Document current service progress',
        required: true,
        photoRequired: true,
        photoType: 'process',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'general',
        instructions: 'Take photos showing current state of work in progress. Document which areas are complete vs remaining.',
        photoInstructions: 'Wide shots showing work progress, close-ups of completed sections and areas still in progress.',
        requiredPhotos: 4,
        checkpoints: ['Work progress documented', 'Completed areas noted', 'Remaining work identified', 'Timeline on track']
      },
      {
        stepId: 'mid-service-damage-check',
        name: 'Mid-Service Damage Check',
        description: 'Check for any new damage during service',
        required: true,
        photoRequired: true,
        photoType: 'damage',
        estimatedTimeMinutes: 3,
        category: 'inspection',
        area: 'exterior',
        instructions: 'Carefully inspect all areas for any damage that may have occurred during service process.',
        photoInstructions: 'Document any new scratches, dents, or damage with close-up photos showing exact location.',
        requiredPhotos: 2,
        checkpoints: ['No new exterior damage', 'No interior damage', 'Equipment marks absent', 'Original condition maintained']
      },
      {
        stepId: 'mid-service-quality-standards',
        name: 'Quality Standards Check',
        description: 'Verify work meets quality standards so far',
        required: true,
        photoRequired: true,
        photoType: 'process',
        estimatedTimeMinutes: 2,
        category: 'quality',
        area: 'general',
        instructions: 'Check completed work against company quality standards. Identify any rework needed.',
        photoInstructions: 'Close-up photos of completed work showing quality level achieved.',
        requiredPhotos: 3,
        checkpoints: ['Quality standards met', 'No rework needed', 'Customer expectations on track', 'Process improvements noted']
      },
      {
        stepId: 'mid-service-customer-items',
        name: 'Customer Items Security Check',
        description: 'Verify customer items remain secure and undisturbed',
        required: true,
        photoRequired: false,
        photoType: 'inspection',
        estimatedTimeMinutes: 1,
        category: 'inspection',
        area: 'interior',
        instructions: 'Check that customer personal items, electronics, and valuables remain secure and undisturbed.',
        checkpoints: ['Personal items secure', 'Electronics undisturbed', 'Valuables accounted for', 'No items moved unnecessarily']
      },
      {
        stepId: 'mid-service-environmental-check',
        name: 'Environmental Safety Check',
        description: 'Verify proper environmental and safety protocols',
        required: true,
        photoRequired: false,
        photoType: 'process',
        estimatedTimeMinutes: 1,
        category: 'safety',
        area: 'general',
        instructions: 'Confirm proper chemical usage, waste disposal, and safety protocols are being followed.',
        checkpoints: ['Chemical usage proper', 'Waste disposal correct', 'Safety equipment used', 'Environmental compliance']
      },
      {
        stepId: 'mid-service-timeline-review',
        name: 'Service Timeline Review',
        description: 'Review progress against estimated completion time',
        required: true,
        photoRequired: false,
        photoType: 'process',
        estimatedTimeMinutes: 1,
        category: 'inspection',
        area: 'general',
        instructions: 'Assess progress against original time estimate. Identify any delays or acceleration opportunities.',
        checkpoints: ['Timeline assessment', 'Delay identification', 'Resource allocation', 'Customer communication needed']
      }
    ]
  },

  // Comprehensive Damage Assessment
  'damage-assessment': {
    templateId: 'damage-assessment',
    serviceName: 'Comprehensive Damage Assessment',
    serviceType: 'inspection',
    totalSteps: 16,
    estimatedDurationMinutes: 25,
    steps: [
      // SYSTEMATIC PANEL-BY-PANEL MAPPING
      {
        stepId: 'damage-hood-assessment',
        name: 'Hood Damage Assessment',
        description: 'Systematic inspection of hood for all damage types',
        required: true,
        photoRequired: true,
        photoType: 'damage',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'exterior',
        instructions: 'Open hood and inspect both top and underside surfaces. Look for dents, scratches, chips, rust, or impact damage.',
        photoInstructions: 'Photo hood from multiple angles, close-ups of each damage point with ruler/coin for scale.',
        requiredPhotos: 4,
        checkpoints: ['Paint chips mapped', 'Dent locations noted', 'Scratch depth assessed', 'Rust spots documented', 'Impact damage recorded']
      },
      {
        stepId: 'damage-front-bumper-assessment',
        name: 'Front Bumper Damage Assessment',
        description: 'Detailed inspection of front bumper assembly',
        required: true,
        photoRequired: true,
        photoType: 'damage',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'exterior',
        instructions: 'Inspect entire front bumper including lower sections, grille, and fog light areas.',
        photoInstructions: 'Wide shot of entire bumper, close-ups of damage with measurement references.',
        requiredPhotos: 5,
        checkpoints: ['Bumper cracks noted', 'Paint damage mapped', 'Grille damage assessed', 'Fog light condition', 'Mounting integrity checked']
      },
      {
        stepId: 'damage-front-fenders-assessment',
        name: 'Front Fenders Damage Assessment',
        description: 'Inspect both front fenders for damage',
        required: true,
        photoRequired: true,
        photoType: 'damage',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'exterior',
        instructions: 'Check both front fenders including wheel well areas and door edge interfaces.',
        photoInstructions: 'Photo each fender from multiple angles, detail shots of wheel well damage.',
        requiredPhotos: 6,
        checkpoints: ['Dent severity assessed', 'Wheel well damage', 'Door gap alignment', 'Paint condition', 'Rust assessment']
      },
      {
        stepId: 'damage-doors-assessment',
        name: 'All Doors Damage Assessment',
        description: 'Systematic inspection of all vehicle doors',
        required: true,
        photoRequired: true,
        photoType: 'damage',
        estimatedTimeMinutes: 4,
        category: 'inspection',
        area: 'exterior',
        instructions: 'Open each door to inspect exterior, interior, edges, and door frames. Check handles, mirrors, and windows.',
        photoInstructions: 'Photo each door exterior and interior, close-ups of handles, mirrors, edges, and any damage.',
        requiredPhotos: 8,
        checkpoints: ['Door ding mapping', 'Handle damage', 'Mirror condition', 'Window condition', 'Edge chip assessment', 'Frame alignment']
      },
      {
        stepId: 'damage-quarter-panels-assessment',
        name: 'Quarter Panels Damage Assessment',
        description: 'Inspect rear quarter panels and C-pillars',
        required: true,
        photoRequired: true,
        photoType: 'damage',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'exterior',
        instructions: 'Check both rear quarter panels including C-pillar areas and fuel door region.',
        photoInstructions: 'Wide shots of quarters, close-ups of any damage or rust spots.',
        requiredPhotos: 4,
        checkpoints: ['Rust spot mapping', 'Dent documentation', 'Fuel door condition', 'Panel alignment', 'Paint condition']
      },
      {
        stepId: 'damage-rear-bumper-assessment',
        name: 'Rear Bumper Damage Assessment',
        description: 'Detailed rear bumper and hatch inspection',
        required: true,
        photoRequired: true,
        photoType: 'damage',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'exterior',
        instructions: 'Inspect rear bumper, trunk/hatch, and license plate area for damage.',
        photoInstructions: 'Wide rear view, close-ups of bumper damage, hatch alignment photos.',
        requiredPhotos: 4,
        checkpoints: ['Bumper impact damage', 'Hatch/trunk alignment', 'Taillight condition', 'License plate area', 'Exhaust tip condition']
      },
      {
        stepId: 'damage-roof-assessment',
        name: 'Roof and Pillars Damage Assessment',
        description: 'Inspect roof surface and all pillars',
        required: true,
        photoRequired: true,
        photoType: 'damage',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'exterior',
        instructions: 'Check roof for dents, scratches, sunroof damage. Inspect A, B, C pillars.',
        photoInstructions: 'Elevated shots of roof, close-ups of any damage, sunroof condition.',
        requiredPhotos: 4,
        checkpoints: ['Roof dent mapping', 'Pillar damage', 'Sunroof condition', 'Antenna damage', 'Roof rail condition']
      },
      {
        stepId: 'damage-wheels-assessment',
        name: 'Wheels and Tires Damage Assessment',
        description: 'Systematic inspection of all wheels and tires',
        required: true,
        photoRequired: true,
        photoType: 'damage',
        estimatedTimeMinutes: 3,
        category: 'inspection',
        area: 'exterior',
        instructions: 'Check each wheel for curb rash, scratches, dents. Inspect tires for damage, wear patterns.',
        photoInstructions: 'Straight-on photo of each wheel, close-ups of curb rash, tire sidewall damage.',
        requiredPhotos: 8,
        checkpoints: ['Curb rash severity', 'Wheel scratches', 'Tire sidewall damage', 'Unusual wear patterns', 'Valve stem condition']
      },
      {
        stepId: 'damage-interior-seats-assessment',
        name: 'Interior Seating Damage Assessment',
        description: 'Detailed inspection of all seating surfaces',
        required: true,
        photoRequired: true,
        photoType: 'damage',
        estimatedTimeMinutes: 3,
        category: 'inspection',
        area: 'interior',
        instructions: 'Check all seats for tears, stains, burns, wear. Test seat mechanisms and adjustments.',
        photoInstructions: 'Photo each seat from multiple angles, close-ups of tears, stains, or damage.',
        requiredPhotos: 6,
        checkpoints: ['Tear documentation', 'Stain mapping', 'Burn assessment', 'Wear patterns', 'Mechanism function']
      },
      {
        stepId: 'damage-interior-surfaces-assessment',
        name: 'Interior Surfaces Damage Assessment',
        description: 'Systematic inspection of dashboard, console, door panels',
        required: true,
        photoRequired: true,
        photoType: 'damage',
        estimatedTimeMinutes: 3,
        category: 'inspection',
        area: 'interior',
        instructions: 'Check dashboard for cracks, console for damage, door panels for tears or scratches.',
        photoInstructions: 'Wide dashboard shot, close-ups of cracks, console damage, door panel issues.',
        requiredPhotos: 6,
        checkpoints: ['Dashboard crack mapping', 'Console damage', 'Door panel tears', 'Button/switch damage', 'Trim piece condition']
      },
      {
        stepId: 'damage-glass-assessment',
        name: 'All Glass Surfaces Damage Assessment',
        description: 'Comprehensive inspection of all vehicle glass',
        required: true,
        photoRequired: true,
        photoType: 'damage',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'general',
        instructions: 'Inspect windshield, all windows, mirrors for chips, cracks, scratches.',
        photoInstructions: 'Photo each glass surface, close-ups of chips/cracks with size reference.',
        requiredPhotos: 7,
        checkpoints: ['Windshield chip mapping', 'Window crack assessment', 'Mirror damage', 'Tinting condition', 'Visibility impact']
      },
      {
        stepId: 'damage-documentation-summary',
        name: 'Damage Documentation Summary',
        description: 'Compile comprehensive damage report',
        required: true,
        photoRequired: false,
        photoType: 'damage',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'general',
        instructions: 'Review all documented damage, prioritize by severity, prepare summary for customer discussion.',
        checkpoints: ['All damage catalogued', 'Severity assessed', 'Cost implications noted', 'Customer discussion points', 'Before photos complete']
      }
    ]
  },

  // Enhanced Interior Inspection
  'interior-deep-inspection': {
    templateId: 'interior-deep-inspection',
    serviceName: 'Comprehensive Interior Inspection',
    serviceType: 'inspection',
    totalSteps: 15,
    estimatedDurationMinutes: 20,
    steps: [
      // SEATING SYSTEMS
      {
        stepId: 'interior-seating-systems',
        name: 'Seating Systems Full Inspection',
        description: 'Complete evaluation of all seating components',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 3,
        category: 'inspection',
        area: 'interior',
        instructions: 'Test all seat adjustments, heat/cooling, memory functions. Check for wear, tears, stains.',
        photoInstructions: 'Photo each seat position, close-ups of wear areas, stains, damage. Include seat controls.',
        requiredPhotos: 8,
        checkpoints: ['Seat adjustment function', 'Heating/cooling operation', 'Memory settings', 'Surface condition', 'Bolster wear', 'Lumbar support']
      },
      {
        stepId: 'interior-dashboard-systems',
        name: 'Dashboard and Control Systems',
        description: 'Comprehensive dashboard and control inspection',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'interior',
        instructions: 'Test all buttons, switches, knobs. Check display screens, gauges, warning lights.',
        photoInstructions: 'Wide dashboard view, close-ups of gauge cluster, infotainment screen, control panels.',
        requiredPhotos: 5,
        checkpoints: ['All buttons functional', 'Displays working', 'Warning lights check', 'Gauge accuracy', 'Surface condition', 'No cracks/damage']
      },
      {
        stepId: 'interior-electronics-connectivity',
        name: 'Electronics and Connectivity Systems',
        description: 'Test all electronic systems and connectivity',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 3,
        category: 'inspection',
        area: 'interior',
        instructions: 'Test radio, navigation, Bluetooth, USB ports, charging systems, Wi-Fi hotspot.',
        photoInstructions: 'Photos of screens showing functionality, USB/charging ports, connectivity menus.',
        requiredPhotos: 4,
        checkpoints: ['Radio operation', 'Navigation accuracy', 'Bluetooth pairing', 'USB ports working', 'Charging systems', 'Wi-Fi function']
      },
      {
        stepId: 'interior-climate-systems',
        name: 'Climate Control Systems',
        description: 'Test heating, ventilation, and air conditioning',
        required: true,
        photoRequired: false,
        photoType: 'inspection',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'interior',
        instructions: 'Test A/C cooling, heat, fan speeds, air distribution, automatic climate control.',
        checkpoints: ['A/C cooling effective', 'Heat output good', 'Fan speeds work', 'Air direction control', 'Temperature accuracy', 'Auto climate function']
      },
      {
        stepId: 'interior-storage-compartments',
        name: 'Storage Compartments and Organizers',
        description: 'Inspect all interior storage areas',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'interior',
        instructions: 'Check glove box, center console, door pockets, cup holders, overhead storage.',
        photoInstructions: 'Photo each storage area open, close-ups of any damage or wear.',
        requiredPhotos: 6,
        checkpoints: ['Glove box function', 'Console storage', 'Door pocket condition', 'Cup holder integrity', 'Overhead compartments', 'Hidden storage areas']
      },
      {
        stepId: 'interior-carpet-flooring',
        name: 'Carpet and Flooring Systems',
        description: 'Detailed inspection of all floor surfaces',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'interior',
        instructions: 'Remove floor mats, inspect carpet condition, check for stains, wear, water damage.',
        photoInstructions: 'Photos of carpet without mats, floor mats condition, any stains or damage.',
        requiredPhotos: 6,
        checkpoints: ['Carpet stain mapping', 'Water damage signs', 'Wear pattern assessment', 'Mat condition', 'Floor pan integrity', 'Pedal rubber condition']
      },
      {
        stepId: 'interior-window-systems',
        name: 'Interior Window and Glass Systems',
        description: 'Test window operations and inspect glass condition',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'interior',
        instructions: 'Test power windows, inspect glass for damage, check tinting, mirror adjustments.',
        photoInstructions: 'Photo window controls, glass condition from interior, mirror positions.',
        requiredPhotos: 5,
        checkpoints: ['Window operation smooth', 'Glass clarity good', 'Tinting condition', 'Mirror adjustment', 'Switch functionality', 'Safety features']
      },
      {
        stepId: 'interior-lighting-systems',
        name: 'Interior Lighting Systems',
        description: 'Test all interior lighting functions',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 1,
        category: 'inspection',
        area: 'interior',
        instructions: 'Test dome lights, reading lights, footwell lighting, ambient lighting, door courtesy lights.',
        photoInstructions: 'Photos showing various lighting zones active, any burned out bulbs.',
        requiredPhotos: 4,
        checkpoints: ['Dome light function', 'Reading lights work', 'Footwell lighting', 'Ambient lighting', 'Door courtesy lights', 'Dashboard illumination']
      },
      {
        stepId: 'interior-safety-systems',
        name: 'Interior Safety Systems',
        description: 'Inspect seatbelts, airbag systems, emergency features',
        required: true,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'interior',
        instructions: 'Test seatbelt operation, check airbag warning lights, inspect emergency brake, door locks.',
        photoInstructions: 'Photos of seatbelt condition, safety system indicators, emergency features.',
        requiredPhotos: 4,
        checkpoints: ['Seatbelt retraction', 'Airbag warning status', 'Emergency brake function', 'Child safety locks', 'Door lock operation', 'Panic button']
      },
      {
        stepId: 'interior-odor-assessment',
        name: 'Interior Odor and Air Quality Assessment',
        description: 'Evaluate interior air quality and identify odor sources',
        required: true,
        photoRequired: false,
        photoType: 'inspection',
        estimatedTimeMinutes: 2,
        category: 'inspection',
        area: 'interior',
        instructions: 'Assess for smoke, pet, food, mold, or chemical odors. Check cabin air filter.',
        checkpoints: ['Smoke odor detected', 'Pet odor present', 'Food odor sources', 'Mold/mildew smell', 'Chemical odors', 'Air freshener overuse']
      },
      {
        stepId: 'interior-accessibility-features',
        name: 'Accessibility Features Inspection',
        description: 'Check accessibility modifications and features',
        required: false,
        photoRequired: true,
        photoType: 'inspection',
        estimatedTimeMinutes: 1,
        category: 'inspection',
        area: 'interior',
        instructions: 'Inspect any wheelchair accessibility, hand controls, or mobility modifications.',
        photoInstructions: 'Document any accessibility modifications or adaptive equipment.',
        requiredPhotos: 2,
        checkpoints: ['Mobility equipment present', 'Hand controls function', 'Accessibility modifications', 'Equipment condition']
      }
    ]
  }
};

// Helper functions
export function getSOPTemplate(templateId: string): SOPTemplate | null {
  return SOP_TEMPLATES[templateId] || null;
}

export function getTemplatesByServiceType(serviceType: string): SOPTemplate[] {
  return Object.values(SOP_TEMPLATES).filter(template => template.serviceType === serviceType);
}

export function calculateSOPProgress(steps: SOPStep[], completedSteps: string[]): number {
  if (steps.length === 0) return 0;
  
  const completedCount = steps.filter(step => completedSteps.includes(step.stepId)).length;
  return Math.round((completedCount / steps.length) * 100);
}

export function getRequiredSteps(steps: SOPStep[]): SOPStep[] {
  return steps.filter(step => step.required);
}

export function getRequiredPhotosCount(steps: SOPStep[]): number {
  return steps.filter(step => step.required && step.photoRequired).length;
}

export function canAdvanceToNextStage(steps: SOPStep[], completedSteps: string[], completedPhotos: string[]): boolean {
  const requiredSteps = getRequiredSteps(steps);
  
  return requiredSteps.every(step => {
    const isCompleted = completedSteps.includes(step.stepId);
    const hasRequiredPhoto = !step.photoRequired || completedPhotos.includes(step.stepId);
    
    return isCompleted && hasRequiredPhoto;
  });
}