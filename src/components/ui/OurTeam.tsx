"use client";

import Image from "next/image";
import { motion } from "framer-motion";

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
const defaultAdmin: TeamMember[] = [
  { name: "Yza Buenaventura", role: "HR Manager", image: "/DENS0315.jpg" },
  { name: "Jonathan Fernandez", role: "IT Administrator", image: "/IMG_1985.JPG" },
  { name: "Wence Medina", role: "General & Administrative Associate", image: "/DENS0273.jpg" },
  { name: "Hannah Urrera", role: "Finance & Accounting Associate", image: "/IMG_1983.JPG" },
];
const defaultProduction: TeamMember[] = [
  { name: "Van Climaco", role: "Associate Architect", image: "/image0.jpg" },
  { name: "Ar. John Lu", role: "BIM Manager/Consultant", image: "/DENS0227.jpg" },
  { name: "Joanne Martinez", role: "BIM Coordinator", image: "/DENS0146.jpg" },
  { name: "Ar. Rachel Rivera", role: "Senior 3D Architect", image: "/DENS0008.jpg" },
  { name: "Trisha Chua", role: "Junior Architect", image: "/DENS0089.jpg" },
  { name: "Isabelle De Guzman", role: "Junior Architect", image: "/DENS0068.jpg" },
  { name: "Ar. Bea Garcia", role: "Revit Architect", image: "/DENS0163.jpg" },
  { name: "Jesalyn Paglinawan", role: "BIM Modeller", image: "/DENS0241.jpg" },
  { name: "Chel Sarmiento", role: "Architectural Modeler", image: "/DENS0209.jpg" },
];

function TeamGrid({ members }: { members: TeamMember[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-10 gap-x-6">
      {members.map((member, idx) => (
        <motion.div
          key={`${member.name || "unnamed"}-${idx}`}
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: idx * 0.08, type: "spring", bounce: 0.18 }}
          viewport={{ once: true, amount: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-0 flex flex-col items-center text-center border border-gray-200 hover:shadow-2xl hover:border-blue-400 focus-within:shadow-2xl focus-within:border-blue-400 transition-all duration-300 group"
        >
          <div className="relative w-full aspect-[3/4] h-72 bg-gray-100 overflow-hidden rounded-t-2xl">
            <Image
              src={member.image && member.image !== "" ? member.image : "/placeholder-profile.png"}
              alt={member.name}
              fill
              className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-5 flex flex-col flex-1 w-full">
            <div className="font-extrabold text-lg md:text-xl text-gray-900 mb-1 tracking-tight leading-tight">
              {member.name}
            </div>
            <div className="text-blue-700 text-sm md:text-base font-semibold mb-1">{member.role}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function OurTeam({
  management = defaultManagement,
  admin = defaultAdmin,
  production = defaultProduction,
}: OurTeamProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Our Team</h2>
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-center mb-8 text-gray-800 tracking-wide uppercase">Management</h3>
          <div className="flex flex-col md:flex-row justify-center gap-8">
            {management.map((member, idx) => (
              <motion.div
                key={`${member.name || "unnamed"}-${idx}`}
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: idx * 0.12, type: "spring", bounce: 0.18 }}
                viewport={{ once: true, amount: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-0 flex flex-col items-center text-center border border-gray-200 hover:shadow-2xl hover:border-blue-400 focus-within:shadow-2xl focus-within:border-blue-400 transition-all duration-300 w-full md:w-80 mx-auto group"
              >
                <div className="relative w-full aspect-[3/4] h-80 bg-gray-100 overflow-hidden rounded-t-2xl">
                  <Image
                    src={member.image && member.image !== "" ? member.image : "/placeholder-profile.png"}
                    alt={member.name}
                    fill
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1 w-full">
                  <div className="font-extrabold text-xl text-gray-900 mb-1 tracking-tight leading-tight">
                    {member.name}
                  </div>
                  <div className="text-blue-700 text-base font-semibold mb-1">{member.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-center mb-8 text-gray-800 tracking-wide uppercase">Admin</h3>
          <TeamGrid members={admin} />
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-center mb-8 text-gray-800 tracking-wide uppercase">
            Production Team
          </h3>
          <TeamGrid members={production} />
        </div>
      </div>
    </section>
  );
}
