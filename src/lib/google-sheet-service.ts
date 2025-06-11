// src/lib/google-sheet-service.ts
import type { PujaEventData } from '@/types';

// Mock data based on the provided Google Sheet structure
const mockPujaEvents: PujaEventData[] = [
  {
    Date: "13/06/2025",
    Time: "17:30",
    Seva: "Lalitha Sahasranam Parayan",
    Venue: "Prayogshala",
    Activity: "Parayanam-Lalitha Sahasranamam Parayanam",
    link: "/event/?transid=61540",
    UniqueID: "Event1", // Original field was just "Event", making it more unique for mock
    details: "13 Jun 2025|5:30 pm|Lalitha Sahasranam Parayan|Prayogshala",
  },
  {
    Date: "14/06/2025",
    Time: "17:30",
    Seva: "Vishnu Sahasranam Parayan",
    Venue: "Prayogshala",
    Activity: "Parayanam-Vishnu Sahasranamam Parayanam",
    link: "/event/?transid=61544",
    UniqueID: "Event2",
    details: "14 Jun 2025|5:30 pm|Vishnu Sahasranam Parayan|Prayogshala",
  },
  {
    Date: "14/06/2025",
    Time: "08:00",
    Seva: "Navgraha Homa",
    Venue: "Prayogshala",
    Activity: "Homa-Navagraha Homa",
    link: "/event/?transid=61566",
    UniqueID: "Event3",
    details: "14 Jun 2025|8:00 am|Navgraha Homa|Prayogshala",
  },
  {
    Date: "15/06/2025",
    Time: "07:30",
    Seva: "Chaturthi Spl Ganpati Homa",
    Venue: "Sri Pratap Ganpati Temple",
    Activity: "Homa-Ganpati Homa",
    link: "/event/?transid=61526",
    UniqueID: "Event4",
    details: "15 Jun 2025|7:30 am|Chaturthi Spl Ganpati Homa|Sri Pratap Ganpati Temple",
  },
  {
    Date: "15/06/2025",
    Time: "17:00",
    Seva: "Chaturthi Spl Sahasra Durva Archana",
    Venue: "Sri Pratap Ganpati Temple",
    Activity: "Archana-Durva Archana",
    link: "/event/?transid=61528",
    UniqueID: "Event5",
    details: "15 Jun 2025|5:00 pm|Chaturthi Spl Sahasra Durva Archana|Sri Pratap Ganpati Temple",
  },
  // Adding a mock event for "tomorrow" for testing purposes (relative to a fixed current date for consistency)
  // Let's assume current date for testing is 12/06/2025. Then 13/06/2025 is tomorrow.
  // The first event above will serve as "tomorrow" if tests are run with this assumption.

  // Adding some events for "this week"
  {
    Date: "16/06/2025",
    Time: "09:00",
    Seva: "Special Rudra Homa",
    Venue: "Main Hall",
    Activity: "Homa-Rudra Homa",
    link: "/event/?transid=61570",
    UniqueID: "Event6",
    details: "16 Jun 2025|9:00 am|Special Rudra Homa|Main Hall",
  },
  {
    Date: "17/06/2025",
    Time: "18:00",
    Seva: "Devi Puja",
    Venue: "Temple Complex",
    Activity: "Puja-Devi Puja",
    link: "/event/?transid=61575",
    UniqueID: "Event7",
    details: "17 Jun 2025|6:00 pm|Devi Puja|Temple Complex",
  },
];

// In a real application, this would fetch from the Google Sheet API.
export async function fetchEvents(): Promise<PujaEventData[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return a copy to prevent modification of mock data
  return JSON.parse(JSON.stringify(mockPujaEvents));
}
