"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MapPinIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon,
  UsersIcon,
  LightBulbIcon,
  HeartIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

import { getJobs } from "@/utils/api";
import { JobData } from "@/types";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import Link from "next/link";

export default function CareersPage() {
  const [jobs, setJobs] = useState<JobData[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getJobs();
        // Filter only active jobs for the careers page
        const activeJobs = response.data?.filter((job) => job.isActive) || [];
        setJobs(activeJobs);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load job postings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const benefits = [
    { icon: HeartIcon, title: "Health & Wellness", description: "Comprehensive health coverage and wellness programs" },
    {
      icon: StarIcon,
      title: "Professional Growth",
      description: "Continuous learning and career development opportunities",
    },
    {
      icon: UsersIcon,
      title: "Collaborative Culture",
      description: "Work with talented professionals in a supportive environment",
    },
    { icon: LightBulbIcon, title: "Innovation Focus", description: "Cutting-edge projects and creative freedom" },
    { icon: GlobeAltIcon, title: "Flexible Work", description: "Remote work options and flexible schedules" },
    { icon: CheckCircleIcon, title: "Work-Life Balance", description: "Generous PTO and work-life integration" },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior Architect",
      image: "/DENS0008.jpg",
      quote:
        "Joining Weave was the best career decision I've made. The projects are challenging, the team is supportive, and I've grown tremendously as a professional.",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "3D Visualization Specialist",
      image: "/DENS0068.jpg",
      quote:
        "The creative freedom and cutting-edge technology here are incredible. Every day brings new challenges and opportunities to innovate.",
      rating: 5,
    },
    {
      name: "Emily Watson",
      role: "Project Manager",
      image: "/DENS0089.jpg",
      quote:
        "The collaborative culture and work-life balance at Weave are unmatched. I feel valued and supported in everything I do.",
      rating: 5,
    },
  ];

  const jobTypes = [
    { value: "all", label: "All Positions" },
    { value: "full-time", label: "Full Time" },
    { value: "part-time", label: "Part Time" },
    { value: "contract", label: "Contract" },
    { value: "internship", label: "Internship" },
  ];

  // Filter jobs based on search and type
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || job.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[450px] md:h-[550px] flex items-center justify-center overflow-hidden">
        <Image
          src="/bg-careers-1.jpg"
          alt="Careers Hero Background"
          fill
          className="object-cover object-center w-full h-full absolute z-0 opacity-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-blue-900/70 to-white/10 z-10" />
        <div className="relative z-20 w-full max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between h-full">
          {/* Left: About Us link */}
          <motion.div
            className="hidden md:flex flex-col justify-center items-start h-full w-1/3"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.1 }}
          >
            <Link
              href="/#aboutPreview"
              className="relative text-lg font-semibold text-white group cursor-pointer select-none"
            >
              ABOUT US
              <span className="block h-0.5 bg-gradient-to-r from-blue-700 to-indigo-800 w-full mt-1 transition-all duration-300 group-hover:h-1 group-hover:bg-blue-700"></span>
            </Link>
          </motion.div>

          {/* Center: Main Content */}
          <motion.div
            className="flex flex-col items-center justify-center text-center h-full w-full md:w-1/3"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 font-archivo leading-tight">
              Join Our Team
            </h1>
            <p className="text-lg md:text-xl text-blue-100 font-medium max-w-md mb-6">
              Shape the future of architecture with creativity, technology, and passion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#open-roles"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-lg"
              >
                View Open Roles <ArrowRightIcon className="w-5 h-5 ml-2" />
              </a>
            </div>
          </motion.div>

          {/* Right: Stats */}
          <motion.div
            className="hidden md:flex flex-col justify-center items-end h-full w-1/3"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.1, ease: "easeOut", delay: 0.5 }}
          >
            <div className="text-right text-white">
              <div className="text-3xl font-bold mb-1">{jobs.length}+</div>
              <div className="text-blue-200 text-sm">Open Positions</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Join Us Section */}
      <section id="why-join-us" className="py-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4 font-archivo">Why Join Weave?</h2>
            <p className="text-lg text-blue-700 max-w-2xl mx-auto">
              We&apos;re not just building structures—we&apos;re creating experiences, shaping communities, and pushing
              the boundaries of what&apos;s possible in architecture.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100/60 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-2 font-archivo">{benefit.title}</h3>
                <p className="text-blue-700 leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4 font-archivo">What Our Team Says</h2>
            <p className="text-lg text-blue-700 max-w-2xl mx-auto">
              Hear from our talented team members about their experience working at Weave.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100/60"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-blue-900 mb-6 leading-relaxed italic">&quot;{testimonial.quote}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="font-semibold text-blue-900">{testimonial.name}</div>
                    <div className="text-blue-700 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Culture Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6 font-archivo">Our Culture</h2>
              <p className="text-lg text-blue-700 mb-6 leading-relaxed">
                At Weave, we believe that great architecture comes from great people. Our culture is built on
                collaboration, innovation, and a shared passion for creating spaces that inspire and endure.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Collaborative Environment</h4>
                    <p className="text-blue-700 text-sm">
                      Work alongside talented professionals who share your passion for excellence
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Innovation-Driven</h4>
                    <p className="text-blue-700 text-sm">
                      Push boundaries with cutting-edge technology and creative solutions
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Growth Opportunities</h4>
                    <p className="text-blue-700 text-sm">
                      Continuous learning and career advancement in a supportive environment
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4 font-archivo">Join Our Mission</h3>
                <p className="text-blue-100 mb-6 leading-relaxed">
                  We&apos;re on a mission to transform the built environment through innovative design, sustainable
                  practices, and human-centered solutions.
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">50+</div>
                    <div className="text-blue-200 text-sm">Projects Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">15+</div>
                    <div className="text-blue-200 text-sm">Team Members</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Open Roles Section */}
      <section id="open-roles" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4 font-archivo">Open Positions</h2>
            <p className="text-lg text-blue-700 max-w-2xl mx-auto">
              Ready to make your mark in architecture? Explore our current opportunities and find the perfect role for
              your skills and aspirations.
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100/60 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                  <input
                    type="text"
                    placeholder="Search jobs by title, location, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
                <div className="relative">
                  <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 appearance-none bg-white"
                  >
                    {jobTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {searchTerm || selectedType !== "all" ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
                  <span>
                    Showing {filteredJobs.length} of {jobs.length} positions
                  </span>
                  {(searchTerm || selectedType !== "all") && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedType("all");
                      }}
                      className="text-blue-800 hover:text-blue-900 underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg border border-blue-100/60 p-6">
                  <LoadingSkeleton height={24} className="mb-2" />
                  <LoadingSkeleton height={16} className="mb-4" />
                  <LoadingSkeleton height={60} className="mb-4" />
                  <LoadingSkeleton height={40} className="w-32" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 text-lg mb-4">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-2">No Positions Found</h3>
              <p className="text-blue-700 mb-6">
                {searchTerm || selectedType !== "all"
                  ? "No positions match your current filters. Try adjusting your search criteria."
                  : "We don&apos;t have any open positions at the moment. Check back later!"}
              </p>
              {(searchTerm || selectedType !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedType("all");
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mr-2"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl shadow-lg border border-blue-100/60 p-6 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-blue-900 font-archivo group-hover:text-blue-700 transition-colors">
                        {job.title}
                      </span>
                      <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold capitalize">
                        {job.type.replace("-", " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-blue-700/80 text-sm mb-3">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>

                    <div className="mb-4">
                      <div className="text-blue-900 font-semibold mb-1">
                        {job.salary.currency}
                        {job.salary.min.toLocaleString()} - {job.salary.currency}
                        {job.salary.max.toLocaleString()}
                      </div>
                      <div className="text-blue-700/70 text-sm">Monthly Salary</div>
                    </div>

                    <p className="text-blue-900/90 mb-4 line-clamp-3 min-h-[60px] leading-relaxed">{job.description}</p>

                    <div className="mb-4">
                      <div className="text-sm font-semibold text-blue-800 mb-2">Key Requirements:</div>
                      <div className="flex flex-wrap gap-1">
                        {job.requirements.slice(0, 2).map((req, i) => (
                          <span key={i} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs">
                            {req}
                          </span>
                        ))}
                        {job.requirements.length > 2 && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs">
                            +{job.requirements.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/careers/${job.slug}`}
                    className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 group-hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    Apply Now
                    <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-archivo">Ready to Join Our Team?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Don&apos;t see the perfect role? We&apos;re always looking for talented individuals to join our growing
              team. Send us your resume and let&apos;s start a conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#open-roles"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 transition-all text-lg"
              >
                View All Positions
              </a>
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-4 bg-transparent text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 transition-all text-lg"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
