"use client";

import Image from "next/image";
import { motion, useAnimation, useInView } from "framer-motion";

export type TeamMember = { name: string; role: string; image: string };

export type OurTeamProps = {
  management?: TeamMember[];
  admin?: TeamMember[];
  production?: TeamMember[];
};

const defaultManagement: TeamMember[] = [
  { name: "Nicky Santiago", role: "Partner", image: "/DENS0602.jpg" },
  { name: "Jon Lanuza", role: "Partner", image: "/DENS0133.jpg" },
];
const defaultProduction: TeamMember[] = [
  { name: "Van Climaco", role: "Associate Architect", image: "/image0.jpg" },
  { name: "Ar. John Lu", role: "BIM Manager/Consultant", image: "/DENS0227.jpg" },
  { name: "Joanne Martinez", role: "BIM Coordinator", image: "/DENS0146.jpg" },
  { name: "Ar. Rachel Rivera", role: "Senior 3D Architect", image: "/DENS0008.jpg" },
];

// Add detailed bios for each member
const managementBios: Record<string, string> = {
  "Nicky Santiago":
    "Co-founder of Weave and Santuza, with over 11 years at XL-Axiata in Indonesia and prior roles at SM, Globe, Piltel, Colgate-Palmolive, and Shell. Ateneo BS Management (Honors) graduate, known for building high-performance teams.",
  "Jon Lanuza":
    "Co-founder of Weave and Santuza, with 27 years in institutional stockbroking across the U.S., Indonesia, and the Philippines. Former U.S. country head for CIMB/CGS-CIMB. Holds degrees from Ateneo (BS), Wharton (MBA), and UPenn (MA).",
};
const productionBios: Record<string, string> = {
  "Van Climaco":
    "Architect with 11+ years of global experience in design, documentation, and project management. Worked in New York, London, Dubai, and more on residential, commercial, and entertainment projects. Skilled in AutoCAD, Revit, and SketchUp.",
  "Ar. John Lu":
    "Licensed architect (9 yrs) and master plumber (8 yrs) with international experience in BIM, 3D design, and sustainable development. Managed projects across the U.S., Europe, and Asia. Certified Sustainable Designer, skilled in Revit, AutoCAD, and Lumion.",
  "Joanne Martinez":
    "BIM Coordinator with 3 years’ experience in BIM and IFC. Former modeler for a Singapore IT firm, now leading Southeast Asia BIM projects for Santuza. Proficient in AutoCAD, Revit, ArchiCAD, and OpenBuildings Designer.",
  "Ar. Rachel Rivera":
    "Architect with 6+ years’ experience in 3D visualization, interiors, and project management. Worked internationally and at Jonathan O. Gan & Associates. Skilled in AutoCAD, SketchUp, Enscape, Lumion, V-Ray, and 3DS Max.",
};

function TeamCard({ member, bio, custom }: { member: TeamMember; bio: string; custom?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: custom ? custom * 0.13 : 0, ease: "easeInOut" }}
      viewport={{ once: true, amount: 0.3 }}
      className="relative w-full md:w-80 h-[420px] rounded-2xl overflow-hidden group shadow-lg border border-gray-200 hover:shadow-2xl hover:border-blue-400 focus-within:shadow-2xl focus-within:border-blue-400 transition-all duration-300 mx-auto"
    >
      {/* Image as background */}
      <Image
        src={member.image && member.image !== "" ? member.image : "/placeholder-profile.png"}
        alt={member.name}
        fill
        className="object-cover object-top w-full h-full"
        priority={false}
      />
      {/* Name and role at bottom left (always visible, animates to top left on hover) */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: (custom ? custom * 0.13 : 0) + 0.18, ease: "easeInOut" }}
        className="absolute left-0 right-0 p-5 z-30 flex flex-col items-start pointer-events-none transition-transform duration-700 ease-in-out bottom-0 translate-y-0 group-hover:-translate-y-[320px]"
      >
        {/* Gradient background for text readability, only visible when not hovered */}
        <div className="absolute inset-0 rounded-b-2xl bg-gradient-to-t from-[#181c3a]/90 via-[#1a237e]/80 to-transparent opacity-90 transition-opacity duration-500 pointer-events-none group-hover:opacity-0" />
        <div className="relative font-extrabold text-xl text-white mb-1 tracking-tight leading-tight drop-shadow-lg pointer-events-none transition-all duration-700 ease-in-out">
          {member.name}
        </div>
        <div className="relative text-blue-200 text-base font-semibold mb-1 drop-shadow-lg pointer-events-none transition-all duration-700 ease-in-out">
          {member.role}
        </div>
      </motion.div>
      {/* Overlay: slides up from bottom, covers card, bio at bottom, but never covers name/role */}
      <div className="absolute left-0 bottom-0 w-full h-full pointer-events-none z-20 overflow-hidden">
        <div className="absolute left-0 bottom-0 w-full h-full bg-gradient-to-b from-blue-900/90 via-blue-800/95 to-indigo-900/95 backdrop-blur-sm rounded-b-2xl group-hover:rounded-2xl transition-transform transition-opacity duration-700 ease-in-out flex flex-col justify-between group-hover:justify-between translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
          {/* Bio text at bottom on hover */}
          <div className="p-5 pb-6 text-white text-xs md:text-sm font-normal opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-300 mt-auto">
            {bio}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TeamGrid({ members, bios }: { members: TeamMember[]; bios: Record<string, string> }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-10 gap-x-6">
      {members.map((member, idx) => (
        <TeamCard key={`${member.name || "unnamed"}-${idx}`} member={member} bio={bios[member.name] || ""} />
      ))}
    </div>
  );
}

export default function OurTeam({ management = defaultManagement, production = defaultProduction }: OurTeamProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.13 } },
      }}
      className="py-16 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-5xl font-bold text-center mb-12 text-white">Our Team</h2>
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-center mb-8 text-blue-100 tracking-wide uppercase">Management</h3>
          <motion.div
            className="flex flex-col md:flex-row justify-center items-center gap-2 m-0"
            variants={{ visible: { transition: { staggerChildren: 0.13 } } }}
          >
            {management.map((member, idx) => (
              <TeamCard
                key={`${member.name || "unnamed"}-${idx}`}
                member={member}
                bio={managementBios[member.name] || ""}
                custom={idx}
              />
            ))}
          </motion.div>
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-center mb-8 text-blue-100 tracking-wide uppercase">
            Production Team Leads
          </h3>
          <motion.div
            className="flex flex-col md:flex-row justify-center items-center gap-2 m-0"
            variants={{ visible: { transition: { staggerChildren: 0.13 } } }}
          >
            {production.map((member, idx) => (
              <TeamCard
                key={`${member.name || "unnamed"}-${idx}`}
                member={member}
                bio={productionBios[member.name] || ""}
                custom={idx}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
