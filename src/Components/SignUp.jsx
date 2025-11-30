import { useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import "../Styling/details.css";

const SUPABASE_USERS_TABLE =
  import.meta.env.VITE_SUPABASE_USERS_TABLE || "users";
const USERS_CONTACT_COLUMN =
  import.meta.env.VITE_SUPABASE_USERS_CONTACT_COLUMN || "contact";
const REG_NO_LENGTH = 13;

export default function SignUp() {
  const [formData, setFormData] = useState({
    registrationNumber: "",
    name: "",
    contact: "",
    department: "",
  });
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);
  
    if (!supabase || !SUPABASE_USERS_TABLE) {
      setStatus("Supabase client missing. Add VITE vars.");
      return;
    }
  
    const regNumber = formData.registrationNumber.trim();
    if (regNumber.length !== REG_NO_LENGTH) {
      setStatus("Registration number must be 13 characters.");
      return;
    }
  
    const contactValue = formData.contact.trim();
    if (!contactValue) {
      setStatus("Contact field is required.");
      return;
    }
  
    setIsSubmitting(true);
    try {
      const payload = {
        reg_no: regNumber,
        name: formData.name.trim(),
        department: formData.department.trim(),
        contact: contactValue,        // ⬅️ ALWAYS insert contact here
      };
  
      const { error } = await supabase
        .from(SUPABASE_USERS_TABLE)
        .insert(payload);
  
      if (error) {
        console.log("FULL SUPABASE ERROR:", error);
        if (error.code === "23505") {
          setStatus("That registration number already exists.");
        } else {
          console.error("Supabase insert error:", error);
          setStatus("Could not save details. Please try again.");
        }
        return;
      }
  
      setStatus("Details saved! You can close this tab now.");
  
      setFormData({
        registrationNumber: "",
        name: "",
        contact: "",
        department: "",
      });
  
    } catch (err) {
      console.error(err);
      setStatus("Unexpected error. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  

  return (
    <section className="details-container">
      <div className="details-card signup-card">
        <div className="details-info">
          <h2>Sign up to make campus safer</h2>
          <p>
            Save your basic details once so it’s easier for others to contact you
            if your things are lost or found.
          </p>
          <ul className="signup-highlights">
            <li>Use your official registration number</li>
            <li>Share a phone or email you actually check</li>
            <li>Department helps us reach the right block faster</li>
          </ul>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="signup-grid">
            <label className="signup-field">
              <span className="field-label">Registration Number</span>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                placeholder="e.g. 23ICT0123"
              minLength={REG_NO_LENGTH}
              maxLength={REG_NO_LENGTH}
                required
              />
            </label>

            <label className="signup-field">
              <span className="field-label">Full Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </label>
          </div>

          <label className="signup-field">
            <span className="field-label">Contact</span>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Phone number or email"
              required
            />
          </label>

          <label className="signup-field">
            <span className="field-label">Department</span>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Computer Science"
              required
            />
          </label>

          <button type="submit" className="signup-submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save details"}
          </button>
          {status && <p className="signup-status">{status}</p>}
        </form>
      </div>
    </section>
  );
}

