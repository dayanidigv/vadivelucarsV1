// Type definitions for 3D Car Showcase

export interface CameraPreset {
    position: [number, number, number];
    target: [number, number, number];
    fov?: number;
}

export interface ServiceZone {
    id: string;
    position: [number, number, number];
    label: string;
    icon: string;
    camera: CameraPreset;
    description: string;
    priceRange?: string;
}

export interface ServiceCategory {
    id: string;
    name: string;
    nameTranslated?: string;
    icon: string;
    description: string;
    priceRange: string;
    zone: ServiceZone;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
    {
        id: 'tires',
        name: 'Tires & Alignment',
        nameTranslated: 'டயர் & அலைன்மென்ட்',
        icon: '🛞',
        description: 'Wheel balancing, alignment, and tire replacement services',
        priceRange: '₹500 - ₹3,000',
        zone: {
            id: 'tires',
            position: [14.4, 3.6, 0],
            label: 'Tires & Wheels',
            icon: '🛞',
            camera: {
                position: [3, 1, 0],
                target: [0, 0.3, 0],
                fov: 50
            },
            description: 'Professional tire services'
        }
    },
    {
        id: 'engine',
        name: 'Engine Service',
        nameTranslated: 'எஞ்சின் சர்வீஸ்',
        icon: '🔧',
        description: 'Complete engine diagnostics, repair, and maintenance',
        priceRange: '₹2,500 - ₹8,000',
        zone: {
            id: 'engine',
            position: [0, 9.6, 18],
            label: 'Engine Bay',
            icon: '🔧',
            camera: {
                position: [0, 1.5, 4],
                target: [0, 0.8, 0],
                fov: 45
            },
            description: 'Engine repair & diagnostics'
        }
    },
    {
        id: 'ac',
        name: 'AC Service',
        nameTranslated: 'ஏசி சர்வீஸ்',
        icon: '❄️',
        description: 'AC repair, gas refilling, and cooling system maintenance',
        priceRange: '₹1,500 - ₹4,500',
        zone: {
            id: 'ac',
            position: [0, 12, 6],
            label: 'AC System',
            icon: '❄️',
            camera: {
                position: [-2, 1.2, 2],
                target: [0, 0.9, 0],
                fov: 55
            },
            description: 'AC repair & maintenance'
        }
    },
    {
        id: 'body',
        name: 'Body Work & Paint',
        nameTranslated: 'பாடி வேலை & பெயிண்ட்',
        icon: '🎨',
        description: 'Dent removal, painting, and full body restoration',
        priceRange: '₹3,000 - ₹15,000',
        zone: {
            id: 'body',
            position: [0, 14.4, 0],
            label: 'Body & Paint',
            icon: '🎨',
            camera: {
                position: [4, 1.5, 3],
                target: [0, 0.8, 0],
                fov: 60
            },
            description: 'Body work & painting'
        }
    },
    {
        id: 'oil',
        name: 'Oil Change',
        nameTranslated: 'ஆயில் மாற்றம்',
        icon: '🛢️',
        description: 'Engine oil, oil filter, and fluid replacement',
        priceRange: '₹800 - ₹2,500',
        zone: {
            id: 'oil',
            position: [0, 2.4, 6],
            label: 'Oil Change',
            icon: '🛢️',
            camera: {
                position: [2, 0.5, 3],
                target: [0, 0.2, 0],
                fov: 50
            },
            description: 'Oil & filter change'
        }
    },
    {
        id: 'transmission',
        name: 'Transmission',
        nameTranslated: 'டிரான்ஸ்மிஷன்',
        icon: '⚙️',
        description: 'Transmission repair, clutch, and gearbox services',
        priceRange: '₹3,500 - ₹12,000',
        zone: {
            id: 'transmission',
            position: [9.6, 4.8, -6],
            label: 'Transmission',
            icon: '⚙️',
            camera: {
                position: [3, 0.8, -2],
                target: [0, 0.4, 0],
                fov: 50
            },
            description: 'Transmission services'
        }
    },
    {
        id: 'battery',
        name: 'Battery Service',
        nameTranslated: 'பேட்டரி சர்வீஸ்',
        icon: '🔋',
        description: 'Battery testing, charging, and replacement',
        priceRange: '₹500 - ₹8,000',
        zone: {
            id: 'battery',
            position: [-7.2, 10.8, 15.6],
            label: 'Battery',
            icon: '🔋',
            camera: {
                position: [-2, 1.2, 3],
                target: [-0.3, 0.9, 0],
                fov: 50
            },
            description: 'Battery services'
        }
    },
    {
        id: 'general',
        name: 'General Service',
        nameTranslated: 'ஜெனரல் சர்வீஸ்',
        icon: '🚗',
        description: 'Complete vehicle inspection and maintenance',
        priceRange: '₹2,000 - ₹5,000',
        zone: {
            id: 'general',
            position: [0, 8.4, 0],
            label: 'General Service',
            icon: '🚗',
            camera: {
                position: [5, 2, 5],
                target: [0, 0.5, 0],
                fov: 55
            },
            description: 'Complete car service'
        }
    }
];

export const DEFAULT_CAMERA: CameraPreset = {
    position: [10, 5, 10],
    target: [0, 0.5, 0],
    fov: 55
};
