"use client";
import { useEffect } from "react";

export default function ScrollToContactOnLoad() {
  useEffect(() => {
    if (window.location.hash === "#contact") {
      const el = document.getElementById("contact");
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, []);
  return null;
}
