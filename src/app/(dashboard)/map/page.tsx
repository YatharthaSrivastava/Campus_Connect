'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { COLLEGES, getCollegeShortName } from '@/lib/colleges';
import {
  MapPin,
  ShieldCheck,
  BookOpen,
  Laptop,
  Coffee,
  Search,
  Navigation,
  Compass,
  Wifi,
  Zap,
  VolumeX,
  Users,
  Eye,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface CampusSpot {
  id: string;
  campusId: string;
  name: string;
  category: 'handshake' | 'study' | 'lab' | 'cafe';
  coordinates: [number, number]; // [lng, lat]
  locationName: string;
  description: string;
  securityRating: string;
  securityBadges: string[];
  amenities: string[];
  activeSessions: number;
  status: 'Available' | 'Moderate' | 'Busy';
  walkingGuide: string[];
}

interface CampusDetails {
  id: string;
  name: string;
  shortName: string;
  city: string;
  coordinates: [number, number];
  spots: CampusSpot[];
}

const CAMPUS_DATA: Record<string, CampusDetails> = {
  psit_kanpur: {
    id: 'psit_kanpur',
    name: 'Pranveer Singh Institute of Technology (PSIT), Kanpur',
    shortName: 'PSIT Kanpur',
    city: 'Kanpur, UP',
    coordinates: [80.1983, 26.4729],
    spots: [
      {
        id: 'psit_1',
        campusId: 'psit_kanpur',
        name: 'Central Library Pod 3',
        category: 'study',
        coordinates: [80.1983, 26.4729],
        locationName: 'PSIT Central Library - 2nd Floor Pod A',
        description:
          'Air-conditioned quiet study zone with dedicated power sockets, whiteboards, and high-speed campus Wi-Fi.',
        securityRating: 'Very High (Staff Supervised + CCTV)',
        securityBadges: ['CCTV 24/7', 'Biometric Turnstiles', 'Quiet Guarded Zone'],
        amenities: ['Power Sockets', 'Wi-Fi 500Mbps', 'Silent Zone', 'Air Conditioned'],
        activeSessions: 3,
        status: 'Available',
        walkingGuide: [
          'Enter through Main Library Foyer.',
          'Take the central staircase to the 2nd Floor.',
          'Turn right past the reference section into Pod 3.',
        ],
      },
      {
        id: 'psit_2',
        campusId: 'psit_kanpur',
        name: 'Academic Block 1 Central Foyer',
        category: 'handshake',
        coordinates: [80.1984, 26.473],
        locationName: 'Main Admin & Academic Entrance Foyer',
        description:
          'Designated Primary Safe Exchange Zone with active CCTV coverage and constant student & faculty footfall.',
        securityRating: 'Maximum (24/7 Guarded + 4K CCTV)',
        securityBadges: ['Guard On Duty', '4K PTZ Security', 'High Visibility'],
        amenities: ['CCTV Covered', 'Well Lit', 'Main Foyer Seating', 'Safe Spot'],
        activeSessions: 1,
        status: 'Available',
        walkingGuide: [
          'Head towards Academic Block 1 entrance.',
          'Locate the security reception desk at the center of the foyer.',
          'Safe exchange zone is directly opposite the help desk.',
        ],
      },
      {
        id: 'psit_3',
        campusId: 'psit_kanpur',
        name: 'Computer Science Lab 2 & Hub',
        category: 'lab',
        coordinates: [80.1985, 26.4731],
        locationName: 'Academic Block 2 - Ground Floor Wing B',
        description:
          'High-performance Linux workstations for coding peer reviews, DBMS queries, and open-source project sprints.',
        securityRating: 'High (Lab Incharge Present)',
        securityBadges: ['Lab Supervisor', 'Entry Logged', 'Equipment Insured'],
        amenities: ['Linux Terminals', 'Dual Monitors', 'Gigabit Ethernet', 'Whiteboards'],
        activeSessions: 2,
        status: 'Moderate',
        walkingGuide: [
          'Walk into Academic Block 2 from the courtyard.',
          'Follow the corridor to Wing B on the ground floor.',
          'Enter CS Lab 2 through the glass door.',
        ],
      },
      {
        id: 'psit_4',
        campusId: 'psit_kanpur',
        name: 'Main Campus Gate Security Station',
        category: 'handshake',
        coordinates: [80.198, 26.4735],
        locationName: 'PSIT Main Gate Visitor & Exchange Canopy',
        description:
          'Safe outdoor transaction and meetup zone ideal for daytime and evening textbook, lab kit, and engineering gear handoffs.',
        securityRating: 'Maximum (24/7 Campus Police Guarded)',
        securityBadges: ['Armed Campus Guards', 'Perimeter CCTV', 'Vehicle Checkpoint'],
        amenities: ['24/7 Lit Canopy', 'Guard Assistance', 'Visitor Parking Access'],
        activeSessions: 0,
        status: 'Available',
        walkingGuide: [
          'Walk along the main entrance boulevard towards Gate 1.',
          'The Safe Handshake canopy is situated next to the security booth.',
        ],
      },
      {
        id: 'psit_5',
        campusId: 'psit_kanpur',
        name: 'Student Activity Cafeteria Nook',
        category: 'cafe',
        coordinates: [80.1988, 26.4725],
        locationName: 'SAC Food Court - 1st Floor Collaborative Corner',
        description:
          'Lively student zone suitable for informal exam discussions, project ideation, and peer review meetups over tea/coffee.',
        securityRating: 'High (Public Campus Space)',
        securityBadges: ['Public Area', 'Staff Monitored'],
        amenities: ['Cafeteria Food/Drink', 'Booth Seating', 'Casual Ambient Noise'],
        activeSessions: 4,
        status: 'Busy',
        walkingGuide: [
          'Go to the Student Activity Center behind Block 1.',
          'Take stairs to the 1st floor food court.',
          'Corner booths 4-8 are designated collaborative study booths.',
        ],
      },
    ],
  },
  iit_kanpur: {
    id: 'iit_kanpur',
    name: 'Indian Institute of Technology (IIT), Kanpur',
    shortName: 'IIT Kanpur',
    city: 'Kanpur, UP',
    coordinates: [80.2329, 26.5123],
    spots: [
      {
        id: 'iitk_1',
        campusId: 'iit_kanpur',
        name: 'PK Kelkar Library 2nd Floor Reading Pods',
        category: 'study',
        coordinates: [80.2332, 26.5125],
        locationName: 'PK Kelkar Central Library - East Wing',
        description:
          'One of India’s premier academic libraries. Acoustically optimized silent study cubicles with high-density power banks.',
        securityRating: 'Maximum (Library RFID + CCTV)',
        securityBadges: ['RFID Access', 'CCTV 24/7', 'Campus Police Guarded'],
        amenities: ['Power Sockets', 'Wi-Fi 1Gbps', 'Silent Zone', 'Research Archives'],
        activeSessions: 5,
        status: 'Busy',
        walkingGuide: [
          'Enter PK Kelkar Library through the main security turnstiles.',
          'Ascend to the 2nd Floor East Wing.',
          'Pods 12 through 24 are available for silent academic work.',
        ],
      },
      {
        id: 'iitk_2',
        campusId: 'iit_kanpur',
        name: 'Hall of Residence 3 Main Foyer (Safe Zone)',
        category: 'handshake',
        coordinates: [80.234, 26.5118],
        locationName: 'Hall 3 Entrance Quadrangle',
        description:
          'Designated safe peer exchange kiosk under continuous security guard visibility and hall monitoring.',
        securityRating: 'Very High (Hall Guard Station)',
        securityBadges: ['24/7 Guarded', 'Well Lit Quad', 'Emergency Call Box'],
        amenities: ['Bench Seating', 'Security Post Adjacent', 'Covered Quadrangle'],
        activeSessions: 1,
        status: 'Available',
        walkingGuide: [
          'Head to the Hall 3 main gate entrance.',
          'Exchange spot is located right at the central courtyard kiosk.',
        ],
      },
      {
        id: 'iitk_3',
        campusId: 'iit_kanpur',
        name: 'Computer Center (CC) Terminal Cluster 1',
        category: 'lab',
        coordinates: [80.2325, 26.513],
        locationName: 'CC Building - Ground Floor',
        description:
          'High performance computing terminals, GPU clusters, and fast peer-to-peer programming workstations.',
        securityRating: 'High (Biometric CC Access)',
        securityBadges: ['Biometric Access', 'System Admin Onsite'],
        amenities: ['High-End Linux Desktops', '10G LAN', 'Laser Printers'],
        activeSessions: 3,
        status: 'Available',
        walkingGuide: [
          'Enter Computer Center from the academic concourse.',
          'Show IITK student ID at front desk.',
          'Cluster 1 is to the left of the main hall.',
        ],
      },
      {
        id: 'iitk_4',
        campusId: 'iit_kanpur',
        name: 'OAT (Open Air Theatre) Foyer Meetup',
        category: 'cafe',
        coordinates: [80.2336, 26.5115],
        locationName: 'Open Air Theatre Canteen Promenade',
        description:
          'Open green spaces and cafe benches for casual meetups, hackathon discussions, and campus goods handoffs.',
        securityRating: 'High (Campus Monitored)',
        securityBadges: ['High Visibility', 'Public Concourse'],
        amenities: ['Outdoor Seating', 'Canteen Nearby', 'Open Air'],
        activeSessions: 2,
        status: 'Available',
        walkingGuide: [
          'Walk past the student union building to the OAT steps.',
          'Canteen promenade benches are located along the tree line.',
        ],
      },
    ],
  },
  hbtu_kanpur: {
    id: 'hbtu_kanpur',
    name: 'Harcourt Butler Technical University (HBTU), Kanpur',
    shortName: 'HBTU Kanpur',
    city: 'Kanpur, UP',
    coordinates: [80.3012, 26.4952],
    spots: [
      {
        id: 'hbtu_1',
        campusId: 'hbtu_kanpur',
        name: 'East Campus Central Library Hall',
        category: 'study',
        coordinates: [80.3015, 26.4955],
        locationName: 'HBTU East Campus Library - Ground Floor',
        description:
          'Historic academic library equipped with renovated quiet reading pods and research reference desks.',
        securityRating: 'Very High (University Security)',
        securityBadges: ['CCTV Covered', 'Librarian Supervised'],
        amenities: ['Power Sockets', 'Wi-Fi Access', 'Reading Cubicles'],
        activeSessions: 2,
        status: 'Available',
        walkingGuide: [
          'Enter East Campus through the main gate on Nawabganj Road.',
          'Library building is situated next to the admin block.',
        ],
      },
      {
        id: 'hbtu_2',
        campusId: 'hbtu_kanpur',
        name: 'Academic Block 3 Admin Foyer (Safe Spot)',
        category: 'handshake',
        coordinates: [80.301, 26.495],
        locationName: 'HBTU Academic Block 3 Reception',
        description:
          'Main student service foyer with high security presence, excellent lighting, and safe peer-to-peer handoffs.',
        securityRating: 'Maximum (Main Admin Security Desk)',
        securityBadges: ['Security Desk', '24/7 Guarded', 'CCTV Monitored'],
        amenities: ['Waiting Lounge', 'Safe Zone Marker', 'Clean Water Point'],
        activeSessions: 1,
        status: 'Available',
        walkingGuide: [
          'Proceed to Block 3 entrance.',
          'Enter the main glass doors to the reception lounge.',
        ],
      },
      {
        id: 'hbtu_3',
        campusId: 'hbtu_kanpur',
        name: 'Mechanical & IT Innovation Hub',
        category: 'lab',
        coordinates: [80.302, 26.4948],
        locationName: 'Innovation Cell - West Wing',
        description:
          'Prototyping equipment, 3D printers, and collaborative tech tables for engineering project groups.',
        securityRating: 'High (Faculty Advisor Supervised)',
        securityBadges: ['Faculty Monitored', 'Safe Tools Zone'],
        amenities: ['Toolkits', '3D Printer Access', 'Power Benches'],
        activeSessions: 1,
        status: 'Available',
        walkingGuide: [
          'Walk to the West Wing Innovation building.',
          'Room 104 on the ground floor.',
        ],
      },
    ],
  },
  general_hub: {
    id: 'general_hub',
    name: 'National Inter-Campus Safe Hub & Metro Exchange',
    shortName: 'General University Hub',
    city: 'Kanpur / Metro Concourse',
    coordinates: [80.21, 26.48],
    spots: [
      {
        id: 'gen_1',
        campusId: 'general_hub',
        name: 'Central Metro Concourse Safe Exchange Kiosk',
        category: 'handshake',
        coordinates: [80.21, 26.48],
        locationName: 'University Station Concourse - Gate 2',
        description:
          'Verified multi-college exchange zone located inside the secure transit concourse with CISF & Metro security oversight.',
        securityRating: 'Maximum (CISF & Transit Police)',
        securityBadges: ['CISF Guarded', 'Metal Detectors', '360° CCTV'],
        amenities: ['Well Lit', 'Near Ticket Counter', 'Public Security'],
        activeSessions: 2,
        status: 'Available',
        walkingGuide: [
          'Take exit towards Gate 2 of University Metro Station.',
          'Exchange point is right beside the customer care center.',
        ],
      },
      {
        id: 'gen_2',
        campusId: 'general_hub',
        name: 'City Youth Center Collaborative Reading Space',
        category: 'study',
        coordinates: [80.212, 26.482],
        locationName: 'Student Cultural Complex - Hall B',
        description:
          'Open cross-college learning pods for students from any recognized university or college.',
        securityRating: 'High (Municipal Youth Desk)',
        securityBadges: ['Staffed', 'CCTV Monitored'],
        amenities: ['High Speed Wi-Fi', 'Study Desks', 'Cafeteria Onsite'],
        activeSessions: 3,
        status: 'Moderate',
        walkingGuide: [
          'Enter the Cultural Complex through main gates.',
          'Hall B is on the right side of the garden plaza.',
        ],
      },
    ],
  },
};

export default function CampusMapPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Resolve active campus from user's college or fallback
  const initialCampusId = useMemo(() => {
    if (!user?.collegeName) return 'psit_kanpur';
    const lower = user.collegeName.toLowerCase();
    if (lower.includes('iit')) return 'iit_kanpur';
    if (lower.includes('hbtu')) return 'hbtu_kanpur';
    if (lower.includes('psit')) return 'psit_kanpur';
    return 'general_hub';
  }, [user]);

  const [selectedCampusId, setSelectedCampusId] = useState<string>(initialCampusId);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'handshake' | 'study' | 'lab'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSpot, setActiveSpot] = useState<CampusSpot | null>(null);
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);

  const activeCampus = CAMPUS_DATA[selectedCampusId] || CAMPUS_DATA.psit_kanpur;

  useEffect(() => {
    if (activeCampus.spots.length > 0) {
      setActiveSpot(activeCampus.spots[0]);
    }
  }, [selectedCampusId, activeCampus]);

  const filteredSpots = useMemo(() => {
    return activeCampus.spots.filter((spot) => {
      const matchesFilter = selectedFilter === 'all' || spot.category === selectedFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        spot.name.toLowerCase().includes(q) ||
        spot.locationName.toLowerCase().includes(q) ||
        spot.amenities.some((a) => a.toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    });
  }, [activeCampus, selectedFilter, searchQuery]);

  const handleMeetHere = (spot: CampusSpot) => {
    // Save chosen spot to active transaction meetup location
    try {
      const existing = localStorage.getItem('active_handshake');
      const parsed = existing ? JSON.parse(existing) : {};
      localStorage.setItem(
        'active_handshake',
        JSON.stringify({
          ...parsed,
          locationName: `${spot.name} (${spot.locationName})`,
          collegeName: activeCampus.shortName,
        })
      );
    } catch (e) {
      console.error(e);
    }
    router.push('/handshake');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'handshake':
        return <ShieldCheck className="w-4 h-4 text-[#BB3E03]" />;
      case 'study':
        return <BookOpen className="w-4 h-4 text-[#0A9396]" />;
      case 'lab':
        return <Laptop className="w-4 h-4 text-indigo-600" />;
      case 'cafe':
        return <Coffee className="w-4 h-4 text-amber-600" />;
      default:
        return <MapPin className="w-4 h-4 text-[#005F73]" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#faf8f5] text-[#005F73] border border-[#0A9396]/30">
              Multi-Campus Spatial Network
            </span>
            <span className="text-xs text-gray-500 font-medium">GeoJSON 2dsphere Ready</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#005F73] tracking-tight">
            Interactive Campus Map & Hotspots
          </h1>
          <p className="text-xs sm:text-sm text-[#334155] font-medium">
            Explore verified Safe Handshake Zones, silent library pods, and tech coding hubs across campuses.
          </p>
        </div>

        {/* Campus Switcher Dropdown */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <label className="text-xs font-bold text-gray-500 shrink-0">Campus:</label>
          <select
            value={selectedCampusId}
            onChange={(e) => setSelectedCampusId(e.target.value)}
            className="px-3.5 py-2 bg-white border-2 border-[#005F73]/40 rounded-xl text-xs font-bold text-[#005F73] shadow-xs outline-none focus:ring-2 focus:ring-[#0A9396]/30 cursor-pointer"
          >
            <option value="psit_kanpur">PSIT Kanpur (Main Campus)</option>
            <option value="iit_kanpur">IIT Kanpur (Academic Concourse)</option>
            <option value="hbtu_kanpur">HBTU Kanpur (East Campus)</option>
            <option value="general_hub">General University & Transit Hub</option>
          </select>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              selectedFilter === 'all'
                ? 'bg-[#005F73] text-white shadow-xs'
                : 'bg-white text-[#334155] border border-gray-200 hover:border-[#0A9396]'
            }`}
          >
            All Hotspots ({activeCampus.spots.length})
          </button>
          <button
            onClick={() => setSelectedFilter('handshake')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              selectedFilter === 'handshake'
                ? 'bg-[#BB3E03] text-white shadow-xs'
                : 'bg-white text-[#334155] border border-gray-200 hover:border-[#BB3E03]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Safe Exchange Zones</span>
          </button>
          <button
            onClick={() => setSelectedFilter('study')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              selectedFilter === 'study'
                ? 'bg-[#0A9396] text-white shadow-xs'
                : 'bg-white text-[#334155] border border-gray-200 hover:border-[#0A9396]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Study Pods</span>
          </button>
          <button
            onClick={() => setSelectedFilter('lab')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              selectedFilter === 'lab'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-[#334155] border border-gray-200 hover:border-indigo-400'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Tech Labs</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search hotspots or amenities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#005F73] shadow-xs"
          />
        </div>
      </div>

      {/* Main Interactive Spatial Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Campus Spatial Canvas */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-indigo-950 to-[#005F73] rounded-3xl p-6 text-white min-h-[460px] flex flex-col justify-between relative overflow-hidden shadow-lg border border-white/10">
          {/* Spatial Blueprint Grid Background */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

          {/* Top Radar Status & GPS Coordinates */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-xs font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>
                {activeCampus.shortName} GPS: {activeCampus.coordinates[1]}° N,{' '}
                {activeCampus.coordinates[0]}° E
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold bg-white/10 px-2.5 py-1 rounded-lg border border-white/20">
                {activeCampus.city}
              </span>
              <span className="bg-emerald-400/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md text-[11px] border border-emerald-400/30">
                ● Live Campus Link
              </span>
            </div>
          </div>

          {/* Dynamic Interactive Hotspot Nodes on Canvas */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 my-8">
            {filteredSpots.map((spot) => {
              const isSelected = activeSpot?.id === spot.id;
              const isHandshake = spot.category === 'handshake';
              const isStudy = spot.category === 'study';

              return (
                <div
                  key={spot.id}
                  onClick={() => setActiveSpot(spot)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 transform hover:scale-[1.03] backdrop-blur-md border ${
                    isSelected
                      ? 'bg-white text-gray-900 shadow-2xl border-white ring-4 ring-[#E9D8A6]'
                      : isHandshake
                      ? 'bg-[#BB3E03]/25 hover:bg-[#BB3E03]/35 text-white border-[#BB3E03]/40'
                      : isStudy
                      ? 'bg-[#0A9396]/25 hover:bg-[#0A9396]/35 text-white border-[#0A9396]/40'
                      : 'bg-indigo-900/40 hover:bg-indigo-900/50 text-white border-indigo-400/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">
                      {isHandshake ? '🛡️' : isStudy ? '📚' : spot.category === 'lab' ? '💻' : '☕'}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-[#005F73] text-white'
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      {spot.status}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-xs leading-snug line-clamp-1">{spot.name}</h4>
                  <p
                    className={`text-[10px] line-clamp-1 mt-0.5 ${
                      isSelected ? 'text-gray-500' : 'text-white/80'
                    }`}
                  >
                    {spot.locationName}
                  </p>

                  <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                    {spot.amenities.slice(0, 2).map((amenity, i) => (
                      <span
                        key={i}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-white/10 text-white/90'
                        }`}
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Canvas Controls & Legend */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-xs pt-3 border-t border-white/15">
            <div className="flex items-center gap-4 text-[11px] font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#BB3E03]" /> Safe Handshake Zones
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0A9396]" /> Quiet Study Pods
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> Tech Labs
              </span>
            </div>
            <span className="text-[11px] text-white/70 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Select any node to view real-time metrics</span>
            </span>
          </div>
        </div>

        {/* Spot Inspection Panel */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-gray-200 shadow-xs flex flex-col justify-between space-y-6">
          {activeSpot ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                    activeSpot.category === 'handshake'
                      ? 'bg-[#BB3E03]/15 text-[#BB3E03]'
                      : activeSpot.category === 'study'
                      ? 'bg-[#0A9396]/15 text-[#005F73]'
                      : 'bg-indigo-50 text-indigo-700'
                  }`}
                >
                  {getCategoryIcon(activeSpot.category)}
                  <span>
                    {activeSpot.category === 'handshake'
                      ? 'Safe Exchange Hub'
                      : activeSpot.category === 'study'
                      ? 'Study Pod'
                      : 'Tech Lab'}
                  </span>
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ● {activeSpot.status}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 leading-snug">{activeSpot.name}</h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#BB3E03] shrink-0" />
                  <span>{activeSpot.locationName}</span>
                </p>
              </div>

              <p className="text-xs text-[#334155] leading-relaxed bg-gray-50 p-3 rounded-2xl border border-gray-100">
                {activeSpot.description}
              </p>

              {/* Security & Surveillance Metrics */}
              <div className="space-y-2 pt-1 text-xs">
                <span className="font-extrabold text-[#005F73] text-xs block">
                  Security & Surveillance Level
                </span>
                <div className="p-3 rounded-xl bg-[#faf8f5] border border-[#0A9396]/20 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Protection:</span>
                    <span className="font-bold text-gray-900">{activeSpot.securityRating}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeSpot.securityBadges.map((badge, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#005F73] border border-[#0A9396]/30"
                      >
                        ✓ {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Amenities Grid */}
              <div className="space-y-1.5 text-xs">
                <span className="font-extrabold text-gray-700 block">Available Amenities</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeSpot.amenities.map((amenity, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg font-semibold text-[11px] flex items-center gap-1"
                    >
                      <span>•</span> {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Peer Activity Gauge */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                <span className="text-gray-500 font-medium flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#005F73]" />
                  <span>Current Activity:</span>
                </span>
                <span className="font-extrabold text-[#005F73]">
                  {activeSpot.activeSessions} active student group
                  {activeSpot.activeSessions !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Primary Call to Actions */}
              <div className="space-y-2 pt-2">
                {activeSpot.category === 'handshake' ? (
                  <button
                    type="button"
                    onClick={() => handleMeetHere(activeSpot)}
                    className="w-full py-3 px-4 bg-[#BB3E03] hover:bg-[#BB3E03]/90 text-white text-xs font-extrabold rounded-xl transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Designate This Spot for Handshake →</span>
                  </button>
                ) : (
                  <Link
                    href="/study-groups"
                    className="w-full py-3 px-4 bg-[#005F73] hover:bg-[#0A9396] text-white text-xs font-extrabold rounded-xl transition shadow-xs flex items-center justify-center gap-2 text-center"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Organize Study Group Here →</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={() => setShowDirectionsModal(true)}
                  className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-[#334155] text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-gray-500" />
                  <span>View Walking Navigation Directions</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400 space-y-2">
              <Compass className="w-10 h-10 text-gray-300" />
              <h4 className="font-bold text-gray-700 text-sm">Select a Campus Spot</h4>
              <p className="text-xs text-gray-400">
                Click any hotspot node on the spatial grid to view CCTV coverage, amenities, and walking directions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Walking Navigation Modal ─────────────────────────────────── */}
      {showDirectionsModal && activeSpot && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-gray-200 shadow-2xl relative animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-[#005F73]" />
                <h3 className="font-extrabold text-gray-900 text-sm">Campus Navigation Route</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDirectionsModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#0A9396] uppercase tracking-wider block">
                Destination Hotspot
              </span>
              <h4 className="font-extrabold text-gray-900 text-base">{activeSpot.name}</h4>
              <p className="text-xs text-gray-500 mt-0.5">{activeSpot.locationName}</p>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-700 block">
                Step-by-Step Walking Directions:
              </span>
              <div className="space-y-2.5">
                {activeSpot.walkingGuide.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-[#334155]">
                    <span className="w-5 h-5 rounded-full bg-[#005F73] text-white font-extrabold text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="leading-snug pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#0A9396]/30 text-xs text-gray-600">
              <span className="font-bold text-[#005F73] block">Campus Safety Tip:</span>
              Always inform a peer or keep your CampusConnect app open during exchanges after 7:00 PM.
            </div>

            <button
              type="button"
              onClick={() => setShowDirectionsModal(false)}
              className="w-full py-2.5 bg-[#005F73] text-white text-xs font-bold rounded-xl hover:bg-[#0A9396] transition cursor-pointer"
            >
              Got It, Close Route
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
