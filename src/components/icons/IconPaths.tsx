// Define TypeScript interfaces for the icon paths and colors
interface IconPathsType {
  [key: string]: string;
  booth: string;
  furniture: string;
  door: string;
  plant: string;
  wall: string;
  line: string;
  text: string;
  meeting: string;
  restroom: string;
  emergency: string;
  medical: string;
  childcare: string;
  accessible: string;
  restaurant: string;
  cafeteria: string;
  info: string;
  atm: string;
  elevator: string;
  transportation: string;
  "no-smoking": string;
  baggage: string;
}

interface IconColorsType {
  [key: string]: string;
  booth: string;
  furniture: string;
  door: string;
  plant: string;
  wall: string;
  line: string;
  text: string;
  shape: string;
  meeting: string;
  restroom: string;
  emergency: string;
  medical: string;
  childcare: string;
  accessible: string;
  restaurant: string;
  cafeteria: string;
  info: string;
  atm: string;
  elevator: string;
  transportation: string;
  "no-smoking": string;
  baggage: string;
}

// SVG path data for various element icons
export const IconPaths: IconPathsType = {
  // Booth icon - simple booth outline
  booth: "M10,15 L10,25 L15,25 L15,15 Z M25,15 L25,25 L30,25 L30,15 Z M5,25 L35,25 L35,30 L5,30 Z",
  
  // Furniture icon - sofa
  furniture: "M5,20 L5,30 L35,30 L35,20 L30,20 L30,15 L10,15 L10,20 Z",
  
  // Door icon - door with frame
  door: "M10,5 L30,5 L30,30 L10,30 Z M15,10 L25,10 L25,25 L15,25 Z",
  
  // Plant icon - simple tree/plant
  plant: "M20,5 L20,30 M10,15 C15,5 25,5 30,15 M5,25 C15,15 25,15 35,25",
  
  // Wall icon - rectangle
  wall: "M5,5 L35,5 L35,30 L5,30 Z",
  
  // Line icon - diagonal line
  line: "M5,5 L35,30",
  
  // Text icon - "T" shape
  text: "M10,10 L30,10 M20,10 L20,30",
  
  // Meeting/Conference icon - two people sitting at a table
  meeting: "M10,15 C10,12 13,12 13,15 M27,15 C27,12 30,12 30,15 M5,20 L35,20 M10,15 L10,25 M30,15 L30,25 M15,25 L25,25",
  
  // Restroom/People icon - male and female figures
  restroom: "M15,10 C15,7 18,7 18,10 L18,15 L12,15 L12,10 C12,7 15,7 15,10 M15,15 L15,25 M12,20 L18,20 M25,10 C25,7 28,7 28,10 L25,20 L28,20 L28,30 M22,20 L28,20",
  
  // Emergency exit icon - person running through doorway
  emergency: "M20,10 C20,7 23,7 23,10 M20,15 L26,15 L26,30 L20,30 Z M15,20 L30,20 M26,15 L30,20 L26,25",
  
  // Medical/First Aid icon - cross symbol
  medical: "M15,20 L25,20 M20,15 L20,25 M10,10 L30,10 L30,30 L10,30 Z",
  
  // Childcare icon - parent and child
  childcare: "M15,10 C15,7 18,7 18,10 M15,15 L15,25 M25,15 C25,13 27,13 27,15 M25,18 L25,25 M12,20 L18,20",
  
  // Accessible icon - wheelchair symbol
  accessible: "M20,10 C20,7 23,7 23,10 M15,15 L25,15 M25,15 C30,15 30,25 25,25 C20,25 20,15 25,15 M15,25 L25,25",
  
  // Restaurant/Cafeteria icon - fork and knife
  restaurant: "M15,10 L15,30 M25,10 L25,20 C20,20 20,30 25,30",
  cafeteria: "M15,10 L15,30 M25,10 L25,20 C20,20 20,30 25,30 M10,15 L30,15",
  
  // Information icon - "i" symbol
  info: "M20,10 C20,8 22,8 22,10 C22,12 20,12 20,10 M20,15 L20,30",
  
  // ATM icon - card and money symbol
  atm: "M10,15 L30,15 L30,25 L10,25 Z M15,20 L25,20 M15,10 L25,10",
  
  // Elevator icon - up/down arrows
  elevator: "M20,10 L15,15 L25,15 Z M20,25 L15,20 L25,20 Z M15,5 L25,5 L25,30 L15,30 Z",
  
  // Transportation icon - car symbol
  transportation: "M10,20 L30,20 L28,15 L12,15 Z M12,20 L12,25 M28,20 L28,25",
  
  // No Smoking icon - cigarette with ban symbol
  "no-smoking": "M10,10 L30,30 M30,10 L10,30 M15,20 L25,20",
  
  // Baggage icon - suitcase
  baggage: "M10,15 L30,15 L30,30 L10,30 Z M15,15 L15,10 M25,15 L25,10"
};

// Icon colors for different element types
export const IconColors: IconColorsType = {
  booth: "#4285F4",       // Blue
  furniture: "#A0A0A0",   // Gray
  door: "#DB4437",        // Red
  plant: "#0F9D58",       // Green
  wall: "#8B4513",        // Brown
  line: "#333333",        // Dark Gray
  text: "#333333",        // Dark Gray
  shape: "#F4B400",       // Yellow
  meeting: "#4285F4",     // Blue
  restroom: "#3F51B5",    // Indigo
  emergency: "#F44336",   // Red
  medical: "#F44336",     // Red
  childcare: "#CDDC39",   // Lime
  accessible: "#00BCD4",  // Cyan
  restaurant: "#FF9800",  // Orange
  cafeteria: "#FFC107",   // Amber
  info: "#03A9F4",        // Light Blue
  atm: "#4CAF50",         // Green
  elevator: "#9C27B0",    // Purple
  transportation: "#607D8B", // Blue Gray
  "no-smoking": "#9E9E9E", // Gray
  baggage: "#795548"      // Brown
};