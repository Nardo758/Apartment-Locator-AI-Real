// Mock data for Texas zip codes with offer success rates
export interface ZipCodeData {
  zip: string;
  city: string;
  lat: number;
  lng: number;
  successRate: number; // 0-100
  avgSavings: number;
  offerCount: number;
  avgRent: number;
  bedrooms?: {
    studio: number;
    one: number;
    two: number;
    three: number;
  };
}

// Texas cities coordinates for SVG projection
export const TEXAS_BOUNDS = {
  minLat: 29.4,
  maxLat: 33.2,
  minLng: -100.0,
  maxLng: -94.0,
};

export const mockZipCodeData: ZipCodeData[] = [
  // Austin (High Success Zone)
  { zip: '78701', city: 'Austin', lat: 30.2711, lng: -97.7437, successRate: 85, avgSavings: 320, offerCount: 147, avgRent: 2200 },
  { zip: '78702', city: 'Austin', lat: 30.2640, lng: -97.7208, successRate: 78, avgSavings: 285, offerCount: 124, avgRent: 2100 },
  { zip: '78703', city: 'Austin', lat: 30.2897, lng: -97.7640, successRate: 82, avgSavings: 310, offerCount: 156, avgRent: 2400 },
  { zip: '78704', city: 'Austin', lat: 30.2449, lng: -97.7697, successRate: 88, avgSavings: 340, offerCount: 189, avgRent: 2350 },
  { zip: '78705', city: 'Austin', lat: 30.2897, lng: -97.7437, successRate: 75, avgSavings: 270, offerCount: 98, avgRent: 2000 },
  { zip: '78712', city: 'Austin', lat: 30.2849, lng: -97.7341, successRate: 71, avgSavings: 255, offerCount: 87, avgRent: 1850 },
  { zip: '78721', city: 'Austin', lat: 30.2688, lng: -97.7028, successRate: 79, avgSavings: 290, offerCount: 112, avgRent: 1950 },
  { zip: '78722', city: 'Austin', lat: 30.2883, lng: -97.7178, successRate: 73, avgSavings: 265, offerCount: 95, avgRent: 1900 },
  { zip: '78723', city: 'Austin', lat: 30.2938, lng: -97.6958, successRate: 76, avgSavings: 275, offerCount: 103, avgRent: 1850 },
  { zip: '78724', city: 'Austin', lat: 30.2883, lng: -97.6428, successRate: 68, avgSavings: 240, offerCount: 76, avgRent: 1650 },
  { zip: '78725', city: 'Austin', lat: 30.2321, lng: -97.6708, successRate: 72, avgSavings: 260, offerCount: 89, avgRent: 1750 },
  { zip: '78726', city: 'Austin', lat: 30.4394, lng: -97.8708, successRate: 65, avgSavings: 230, offerCount: 68, avgRent: 1600 },
  { zip: '78727', city: 'Austin', lat: 30.4322, lng: -97.7708, successRate: 70, avgSavings: 250, offerCount: 82, avgRent: 1700 },
  { zip: '78728', city: 'Austin', lat: 30.4533, lng: -97.6858, successRate: 67, avgSavings: 235, offerCount: 74, avgRent: 1600 },
  { zip: '78729', city: 'Austin', lat: 30.4533, lng: -97.8208, successRate: 69, avgSavings: 245, offerCount: 79, avgRent: 1650 },
  { zip: '78730', city: 'Austin', lat: 30.3538, lng: -97.8658, successRate: 64, avgSavings: 225, offerCount: 65, avgRent: 1550 },
  { zip: '78731', city: 'Austin', lat: 30.3488, lng: -97.7658, successRate: 74, avgSavings: 268, offerCount: 97, avgRent: 1900 },
  { zip: '78732', city: 'Austin', lat: 30.3888, lng: -97.8958, successRate: 61, avgSavings: 215, offerCount: 58, avgRent: 1500 },
  { zip: '78733', city: 'Austin', lat: 30.3088, lng: -97.8958, successRate: 63, avgSavings: 220, offerCount: 61, avgRent: 1550 },
  { zip: '78734', city: 'Austin', lat: 30.3588, lng: -97.9458, successRate: 59, avgSavings: 210, offerCount: 52, avgRent: 1450 },
  { zip: '78735', city: 'Austin', lat: 30.2488, lng: -97.8658, successRate: 66, avgSavings: 232, offerCount: 71, avgRent: 1600 },
  { zip: '78736', city: 'Austin', lat: 30.2088, lng: -97.9158, successRate: 60, avgSavings: 212, offerCount: 55, avgRent: 1500 },
  { zip: '78737', city: 'Austin', lat: 30.1688, lng: -97.9658, successRate: 57, avgSavings: 205, offerCount: 48, avgRent: 1400 },
  { zip: '78738', city: 'Austin', lat: 30.3188, lng: -97.9658, successRate: 58, avgSavings: 208, offerCount: 50, avgRent: 1450 },
  { zip: '78739', city: 'Austin', lat: 30.1888, lng: -97.8658, successRate: 62, avgSavings: 218, offerCount: 59, avgRent: 1550 },
  { zip: '78741', city: 'Austin', lat: 30.2321, lng: -97.7208, successRate: 77, avgSavings: 280, offerCount: 106, avgRent: 1950 },
  { zip: '78742', city: 'Austin', lat: 30.2321, lng: -97.6708, successRate: 71, avgSavings: 257, offerCount: 86, avgRent: 1750 },
  { zip: '78744', city: 'Austin', lat: 30.1821, lng: -97.7208, successRate: 75, avgSavings: 272, offerCount: 99, avgRent: 1850 },
  { zip: '78745', city: 'Austin', lat: 30.2021, lng: -97.7958, successRate: 80, avgSavings: 292, offerCount: 115, avgRent: 2050 },
  { zip: '78746', city: 'Austin', lat: 30.2821, lng: -97.8358, successRate: 68, avgSavings: 242, offerCount: 77, avgRent: 1650 },
  { zip: '78747', city: 'Austin', lat: 30.1421, lng: -97.7858, successRate: 72, avgSavings: 262, offerCount: 90, avgRent: 1800 },
  { zip: '78748', city: 'Austin', lat: 30.1621, lng: -97.8358, successRate: 69, avgSavings: 247, offerCount: 80, avgRent: 1700 },
  { zip: '78749', city: 'Austin', lat: 30.2021, lng: -97.8658, successRate: 67, avgSavings: 237, offerCount: 73, avgRent: 1600 },
  { zip: '78750', city: 'Austin', lat: 30.4633, lng: -97.7858, successRate: 70, avgSavings: 252, offerCount: 84, avgRent: 1750 },
  { zip: '78751', city: 'Austin', lat: 30.3133, lng: -97.7258, successRate: 76, avgSavings: 276, offerCount: 101, avgRent: 1950 },
  { zip: '78752', city: 'Austin', lat: 30.3233, lng: -97.7008, successRate: 74, avgSavings: 269, offerCount: 94, avgRent: 1850 },
  { zip: '78753', city: 'Austin', lat: 30.3733, lng: -97.6758, successRate: 69, avgSavings: 246, offerCount: 78, avgRent: 1700 },
  { zip: '78754', city: 'Austin', lat: 30.3333, lng: -97.6508, successRate: 66, avgSavings: 233, offerCount: 70, avgRent: 1600 },
  { zip: '78756', city: 'Austin', lat: 30.3133, lng: -97.7458, successRate: 79, avgSavings: 287, offerCount: 109, avgRent: 2000 },
  { zip: '78757', city: 'Austin', lat: 30.3533, lng: -97.7408, successRate: 73, avgSavings: 264, offerCount: 92, avgRent: 1800 },
  { zip: '78758', city: 'Austin', lat: 30.3833, lng: -97.7008, successRate: 68, avgSavings: 243, offerCount: 75, avgRent: 1650 },
  { zip: '78759', city: 'Austin', lat: 30.4133, lng: -97.7408, successRate: 71, avgSavings: 254, offerCount: 85, avgRent: 1750 },

  // Dallas (Medium Success Zone)
  { zip: '75201', city: 'Dallas', lat: 32.7833, lng: -96.7989, successRate: 72, avgSavings: 260, offerCount: 112, avgRent: 2100 },
  { zip: '75202', city: 'Dallas', lat: 32.7789, lng: -96.7953, successRate: 68, avgSavings: 245, offerCount: 98, avgRent: 2000 },
  { zip: '75203', city: 'Dallas', lat: 32.7589, lng: -96.7753, successRate: 64, avgSavings: 230, offerCount: 87, avgRent: 1850 },
  { zip: '75204', city: 'Dallas', lat: 32.8089, lng: -96.7853, successRate: 75, avgSavings: 272, offerCount: 118, avgRent: 2200 },
  { zip: '75205', city: 'Dallas', lat: 32.8289, lng: -96.8053, successRate: 78, avgSavings: 285, offerCount: 125, avgRent: 2350 },
  { zip: '75206', city: 'Dallas', lat: 32.8389, lng: -96.7753, successRate: 76, avgSavings: 278, offerCount: 121, avgRent: 2250 },
  { zip: '75207', city: 'Dallas', lat: 32.7889, lng: -96.8253, successRate: 62, avgSavings: 222, offerCount: 78, avgRent: 1750 },
  { zip: '75208', city: 'Dallas', lat: 32.7489, lng: -96.8353, successRate: 59, avgSavings: 212, offerCount: 69, avgRent: 1650 },
  { zip: '75209', city: 'Dallas', lat: 32.8489, lng: -96.8253, successRate: 77, avgSavings: 280, offerCount: 123, avgRent: 2300 },
  { zip: '75210', city: 'Dallas', lat: 32.7689, lng: -96.7453, successRate: 61, avgSavings: 218, offerCount: 73, avgRent: 1700 },
  { zip: '75211', city: 'Dallas', lat: 32.7489, lng: -96.8753, successRate: 56, avgSavings: 202, offerCount: 64, avgRent: 1550 },
  { zip: '75212', city: 'Dallas', lat: 32.7889, lng: -96.8853, successRate: 58, avgSavings: 208, offerCount: 67, avgRent: 1600 },
  { zip: '75214', city: 'Dallas', lat: 32.8389, lng: -96.7353, successRate: 74, avgSavings: 268, offerCount: 115, avgRent: 2150 },
  { zip: '75215', city: 'Dallas', lat: 32.7289, lng: -96.7953, successRate: 60, avgSavings: 215, offerCount: 71, avgRent: 1650 },
  { zip: '75216', city: 'Dallas', lat: 32.6889, lng: -96.8253, successRate: 55, avgSavings: 198, offerCount: 61, avgRent: 1500 },
  { zip: '75217', city: 'Dallas', lat: 32.7089, lng: -96.6953, successRate: 57, avgSavings: 205, offerCount: 65, avgRent: 1550 },
  { zip: '75218', city: 'Dallas', lat: 32.8489, lng: -96.7053, successRate: 70, avgSavings: 252, offerCount: 105, avgRent: 2000 },
  { zip: '75219', city: 'Dallas', lat: 32.8089, lng: -96.8153, successRate: 79, avgSavings: 288, offerCount: 127, avgRent: 2400 },
  { zip: '75220', city: 'Dallas', lat: 32.8689, lng: -96.8753, successRate: 66, avgSavings: 237, offerCount: 92, avgRent: 1850 },
  { zip: '75223', city: 'Dallas', lat: 32.8189, lng: -96.7553, successRate: 73, avgSavings: 265, offerCount: 112, avgRent: 2100 },
  { zip: '75224', city: 'Dallas', lat: 32.7189, lng: -96.8453, successRate: 58, avgSavings: 209, offerCount: 68, avgRent: 1600 },
  { zip: '75225', city: 'Dallas', lat: 32.8589, lng: -96.8053, successRate: 80, avgSavings: 292, offerCount: 131, avgRent: 2450 },
  { zip: '75226', city: 'Dallas', lat: 32.7789, lng: -96.7653, successRate: 69, avgSavings: 248, offerCount: 100, avgRent: 1950 },
  { zip: '75227', city: 'Dallas', lat: 32.7589, lng: -96.6853, successRate: 59, avgSavings: 213, offerCount: 70, avgRent: 1650 },
  { zip: '75228', city: 'Dallas', lat: 32.8489, lng: -96.6753, successRate: 68, avgSavings: 244, offerCount: 96, avgRent: 1900 },
  { zip: '75229', city: 'Dallas', lat: 32.8889, lng: -96.8853, successRate: 65, avgSavings: 233, offerCount: 88, avgRent: 1800 },
  { zip: '75230', city: 'Dallas', lat: 32.9089, lng: -96.7953, successRate: 71, avgSavings: 257, offerCount: 108, avgRent: 2050 },
  { zip: '75231', city: 'Dallas', lat: 32.8989, lng: -96.7553, successRate: 72, avgSavings: 261, offerCount: 110, avgRent: 2100 },
  { zip: '75232', city: 'Dallas', lat: 32.6689, lng: -96.8653, successRate: 54, avgSavings: 195, offerCount: 59, avgRent: 1450 },
  { zip: '75233', city: 'Dallas', lat: 32.6889, lng: -96.7753, successRate: 56, avgSavings: 201, offerCount: 63, avgRent: 1500 },
  { zip: '75234', city: 'Dallas', lat: 32.9489, lng: -96.8753, successRate: 67, avgSavings: 240, offerCount: 94, avgRent: 1850 },
  { zip: '75235', city: 'Dallas', lat: 32.8389, lng: -96.8553, successRate: 70, avgSavings: 253, offerCount: 106, avgRent: 2000 },

  // Houston (Medium-Low Success Zone)
  { zip: '77002', city: 'Houston', lat: 29.7589, lng: -95.3653, successRate: 68, avgSavings: 242, offerCount: 105, avgRent: 2000 },
  { zip: '77003', city: 'Houston', lat: 29.7489, lng: -95.3453, successRate: 64, avgSavings: 228, offerCount: 92, avgRent: 1850 },
  { zip: '77004', city: 'Houston', lat: 29.7189, lng: -95.3653, successRate: 70, avgSavings: 252, offerCount: 110, avgRent: 2050 },
  { zip: '77005', city: 'Houston', lat: 29.7189, lng: -95.4253, successRate: 75, avgSavings: 270, offerCount: 122, avgRent: 2200 },
  { zip: '77006', city: 'Houston', lat: 29.7489, lng: -95.3953, successRate: 72, avgSavings: 260, offerCount: 115, avgRent: 2100 },
  { zip: '77007', city: 'Houston', lat: 29.7789, lng: -95.4053, successRate: 74, avgSavings: 267, offerCount: 118, avgRent: 2150 },
  { zip: '77008', city: 'Houston', lat: 29.8089, lng: -95.4053, successRate: 69, avgSavings: 248, offerCount: 102, avgRent: 1950 },
  { zip: '77009', city: 'Houston', lat: 29.7889, lng: -95.3753, successRate: 67, avgSavings: 240, offerCount: 98, avgRent: 1900 },
  { zip: '77010', city: 'Houston', lat: 29.7589, lng: -95.3753, successRate: 66, avgSavings: 237, offerCount: 95, avgRent: 1850 },
  { zip: '77019', city: 'Houston', lat: 29.7589, lng: -95.4153, successRate: 76, avgSavings: 275, offerCount: 125, avgRent: 2250 },
  { zip: '77020', city: 'Houston', lat: 29.7689, lng: -95.3353, successRate: 62, avgSavings: 222, offerCount: 85, avgRent: 1750 },
  { zip: '77021', city: 'Houston', lat: 29.6889, lng: -95.3453, successRate: 58, avgSavings: 208, offerCount: 73, avgRent: 1600 },
  { zip: '77022', city: 'Houston', lat: 29.8189, lng: -95.3653, successRate: 63, avgSavings: 226, offerCount: 88, avgRent: 1800 },
  { zip: '77023', city: 'Houston', lat: 29.7389, lng: -95.3153, successRate: 60, avgSavings: 215, offerCount: 78, avgRent: 1650 },
  { zip: '77024', city: 'Houston', lat: 29.7689, lng: -95.4953, successRate: 71, avgSavings: 255, offerCount: 112, avgRent: 2050 },
  { zip: '77025', city: 'Houston', lat: 29.7089, lng: -95.4353, successRate: 73, avgSavings: 263, offerCount: 117, avgRent: 2100 },
  { zip: '77026', city: 'Houston', lat: 29.7989, lng: -95.3553, successRate: 61, avgSavings: 219, offerCount: 82, avgRent: 1700 },
  { zip: '77027', city: 'Houston', lat: 29.7489, lng: -95.4353, successRate: 77, avgSavings: 278, offerCount: 128, avgRent: 2300 },
  { zip: '77028', city: 'Houston', lat: 29.8089, lng: -95.3253, successRate: 57, avgSavings: 205, offerCount: 70, avgRent: 1550 },
  { zip: '77030', city: 'Houston', lat: 29.7089, lng: -95.3953, successRate: 68, avgSavings: 244, offerCount: 100, avgRent: 1950 },
  { zip: '77031', city: 'Houston', lat: 29.6589, lng: -95.5353, successRate: 59, avgSavings: 212, offerCount: 75, avgRent: 1650 },
  { zip: '77035', city: 'Houston', lat: 29.6489, lng: -95.4953, successRate: 60, avgSavings: 216, offerCount: 80, avgRent: 1700 },
  { zip: '77036', city: 'Houston', lat: 29.6989, lng: -95.5353, successRate: 62, avgSavings: 223, offerCount: 86, avgRent: 1750 },
  { zip: '77040', city: 'Houston', lat: 29.9089, lng: -95.5153, successRate: 64, avgSavings: 230, offerCount: 91, avgRent: 1800 },
  { zip: '77042', city: 'Houston', lat: 29.7389, lng: -95.5353, successRate: 65, avgSavings: 233, offerCount: 93, avgRent: 1850 },
  { zip: '77043', city: 'Houston', lat: 29.7889, lng: -95.5553, successRate: 61, avgSavings: 220, offerCount: 83, avgRent: 1700 },
  { zip: '77045', city: 'Houston', lat: 29.6589, lng: -95.4453, successRate: 59, avgSavings: 213, offerCount: 76, avgRent: 1650 },
  { zip: '77046', city: 'Houston', lat: 29.7289, lng: -95.4453, successRate: 70, avgSavings: 251, offerCount: 108, avgRent: 2000 },
  { zip: '77047', city: 'Houston', lat: 29.6289, lng: -95.3653, successRate: 56, avgSavings: 202, offerCount: 68, avgRent: 1550 },
  { zip: '77054', city: 'Houston', lat: 29.6889, lng: -95.4153, successRate: 66, avgSavings: 237, offerCount: 96, avgRent: 1850 },
  { zip: '77055', city: 'Houston', lat: 29.7789, lng: -95.4953, successRate: 72, avgSavings: 259, offerCount: 113, avgRent: 2050 },
  { zip: '77056', city: 'Houston', lat: 29.7489, lng: -95.4653, successRate: 78, avgSavings: 283, offerCount: 132, avgRent: 2350 },
  { zip: '77057', city: 'Houston', lat: 29.7189, lng: -95.4853, successRate: 74, avgSavings: 268, offerCount: 120, avgRent: 2150 },
  { zip: '77063', city: 'Houston', lat: 29.7489, lng: -95.5153, successRate: 67, avgSavings: 241, offerCount: 99, avgRent: 1900 },
  { zip: '77070', city: 'Houston', lat: 29.9489, lng: -95.5153, successRate: 63, avgSavings: 227, offerCount: 89, avgRent: 1800 },
  { zip: '77072', city: 'Houston', lat: 29.6889, lng: -95.5853, successRate: 58, avgSavings: 209, offerCount: 72, avgRent: 1600 },
  { zip: '77077', city: 'Houston', lat: 29.7389, lng: -95.5853, successRate: 66, avgSavings: 238, offerCount: 97, avgRent: 1850 },
  { zip: '77079', city: 'Houston', lat: 29.7789, lng: -95.5853, successRate: 68, avgSavings: 245, offerCount: 103, avgRent: 1950 },
  { zip: '77081', city: 'Houston', lat: 29.6889, lng: -95.4953, successRate: 64, avgSavings: 231, offerCount: 90, avgRent: 1800 },
  { zip: '77098', city: 'Houston', lat: 29.7389, lng: -95.4253, successRate: 75, avgSavings: 272, offerCount: 124, avgRent: 2200 },
];

export const getTopZipCodes = (limit: number = 10): ZipCodeData[] => {
  return [...mockZipCodeData]
    .sort((a, b) => b.successRate - a.successRate)
    .slice(0, limit);
};

export const getZipCodesByCity = (city: string): ZipCodeData[] => {
  return mockZipCodeData.filter(zip => zip.city.toLowerCase() === city.toLowerCase());
};

export const getSuccessRateColor = (rate: number): string => {
  if (rate >= 80) return '#10b981'; // green-500
  if (rate >= 70) return '#84cc16'; // lime-500
  if (rate >= 60) return '#eab308'; // yellow-500
  if (rate >= 50) return '#f97316'; // orange-500
  return '#ef4444'; // red-500
};
