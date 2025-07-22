"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getJobs, submitApplication } from "@/utils/api";
import { JobData } from "@/types";
import { Dialog } from "@/components/ui/Dialog";
import { MapPinIcon, ArrowRightIcon, CheckCircleIcon, XMarkIcon, PaperClipIcon } from "@heroicons/react/24/outline";

export default function JobDetailsPage() {
  const { slug } = useParams();
  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    coverLetter: "",
    coverLetterType: "write", // 'write', 'upload', 'none'
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJob() {
      setLoading(true);
      setError(null);
      try {
        const res = await getJobs();
        const jobs: JobData[] = res.data;
        const found = jobs.find((j) => j.slug === slug);
        if (!found) {
          setError("Job not found");
        } else {
          setJob(found);
        }
      } catch (e) {
        setError("Failed to load job details");
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [slug]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setResumeFile(file);
  };
  const handleCoverLetterFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCoverLetterFile(file);
  };
  const handleCoverLetterTypeChange = (type: string) => {
    setFormData((prev) => ({ ...prev, coverLetterType: type, coverLetter: "No Cover Letter" }));
    setCoverLetterFile(null);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      if (!job || !resumeFile) return;
      const formDataToSend = new FormData();
      formDataToSend.append("jobId", job._id || "");
      formDataToSend.append("name", formData.name || "");
      formDataToSend.append("email", formData.email || "");
      formDataToSend.append("phone", formData.phone || "");
      if (resumeFile) formDataToSend.append("resume", resumeFile);
      if (formData.coverLetterType === "write" && formData.coverLetter) {
        formDataToSend.append("coverLetter", formData.coverLetter);
      } else if (formData.coverLetterType === "upload" && coverLetterFile) {
        formDataToSend.append("coverLetterFile", coverLetterFile);
      } else if (formData.coverLetterType === "none") {
        formDataToSend.append("coverLetter", "No cover letter");
      }
      await submitApplication(formDataToSend);
      setSubmitSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess(false);
      }, 2000);
    } catch (err) {
      setFormError("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-blue-700 text-lg">Loading job details...</div>
    );
  }
  if (error || !job) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-red-600 text-lg">
        {error || "Job not found"}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-2xl border border-blue-100/80 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 font-archivo mb-2">{job.title}</h1>
            <div className="flex flex-wrap gap-3 text-blue-700/90 text-sm mb-2">
              <span className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" />
                {job.location}
              </span>
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold capitalize">
                {job.type.replace("-", " ")}
              </span>
              <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded-full text-xs font-semibold">
                {job.salary.currency}
                {job.salary.min.toLocaleString()} - {job.salary.currency}
                {job.salary.max.toLocaleString()} <span className="text-blue-700">/month</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-lg"
          >
            Apply Now <ArrowRightIcon className="w-5 h-5 ml-2" />
          </button>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-blue-900 mb-2">Job Description</h2>
          <p className="text-blue-900/90 leading-relaxed mb-4">{job.description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-blue-800 text-lg mb-2">Requirements</h3>
            <ul className="list-disc list-inside text-blue-900/80 text-base space-y-1">
              {job.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-blue-800 text-lg mb-2">Responsibilities</h3>
            <ul className="list-disc list-inside text-blue-900/80 text-base space-y-1">
              {job.responsibilities.map((resp, i) => (
                <li key={i}>{resp}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* Application Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-2xl border border-blue-100/80 relative overflow-hidden p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold font-archivo text-blue-900">Apply for {job.title}</h2>
            <button className="text-blue-700 hover:text-red-500" onClick={() => setShowModal(false)}>
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-green-900 mb-2">Application Submitted!</h4>
              <p className="text-green-700">
                Thank you for your interest. We&apos;ll review your application and get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-blue-900 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg bg-white placeholder-gray-400 font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-blue-900 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg bg-white placeholder-gray-400 font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    placeholder="you@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-900 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg bg-white placeholder-gray-400 font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-900 mb-1">Cover Letter</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                      formData.coverLetterType === "write"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-blue-700 border-blue-200"
                    }`}
                    onClick={() => handleCoverLetterTypeChange("write")}
                  >
                    Write
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                      formData.coverLetterType === "upload"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-blue-700 border-blue-200"
                    }`}
                    onClick={() => handleCoverLetterTypeChange("upload")}
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                      formData.coverLetterType === "none"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-blue-700 border-blue-200"
                    }`}
                    onClick={() => handleCoverLetterTypeChange("none")}
                  >
                    Skip
                  </button>
                </div>
                {formData.coverLetterType === "write" && (
                  <textarea
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg bg-white placeholder-gray-400 font-archivo text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                    rows={4}
                    placeholder="Write your cover letter here..."
                  />
                )}
                {formData.coverLetterType === "upload" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="application/pdf,.doc,.docx"
                      onChange={handleCoverLetterFileChange}
                      className="w-full"
                    />
                    {coverLetterFile && <span className="text-xs text-green-600">{coverLetterFile.name}</span>}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-blue-900 mb-1">Resume/CV (PDF/DOC) *</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => document.getElementById("resume-upload")?.click()}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm"
                  >
                    <PaperClipIcon className="w-5 h-5 mr-2" />
                    {resumeFile ? "Change File" : "Upload Resume"}
                  </button>
                  <input
                    id="resume-upload"
                    type="file"
                    accept="application/pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    required
                    className="hidden"
                  />
                  {resumeFile && (
                    <span className="flex items-center gap-1 text-green-700 text-xs font-semibold">
                      <CheckCircleIcon className="w-4 h-4" />
                      {resumeFile.name}
                    </span>
                  )}
                </div>
              </div>
              {formData.coverLetterType === "upload" && (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => document.getElementById("coverletter-upload")?.click()}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-sm"
                  >
                    <PaperClipIcon className="w-5 h-5 mr-2" />
                    {coverLetterFile ? "Change File" : "Upload Cover Letter"}
                  </button>
                  <input
                    id="coverletter-upload"
                    type="file"
                    accept="application/pdf,.doc,.docx"
                    onChange={handleCoverLetterFileChange}
                    className="hidden"
                  />
                  {coverLetterFile && (
                    <span className="flex items-center gap-1 text-green-700 text-xs font-semibold">
                      <CheckCircleIcon className="w-4 h-4" />
                      {coverLetterFile.name}
                    </span>
                  )}
                </div>
              )}
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <button
                type="submit"
                disabled={submitting || !resumeFile}
                className="w-full mt-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <ArrowRightIcon className="w-5 h-5" /> Submit Application
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </Dialog>
    </div>
  );
}
