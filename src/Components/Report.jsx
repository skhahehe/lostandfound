import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./../Styling/found.css";
import { supabase } from "../lib/supabaseClient";

const SUPABASE_LOST_TABLE =
  import.meta.env.VITE_SUPABASE_LOST_TABLE || "lost";
const SUPABASE_FOUND_TABLE =
  import.meta.env.VITE_SUPABASE_FOUND_TABLE || "found";
const supabaseEnabled =
  Boolean(supabase) &&
  Boolean(SUPABASE_LOST_TABLE) &&
  Boolean(SUPABASE_FOUND_TABLE);

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function Report({ item, fetchLostItems, fetchFoundItems }) {
  const [formData, setFormData] = useState({
    added_by: "",
    contact: "",
    location: "",
    name: "",
    Category: "",
    image: null,
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    console.log(formData);

    setFormData({
      ...formData,
      [name]: name === "image" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      if (supabaseEnabled) {
        const table =
          item.toLowerCase() === "lost"
            ? SUPABASE_LOST_TABLE
            : SUPABASE_FOUND_TABLE;

 let finalImage = null;

// If user uploaded an image, use it
if (formData.image) {
  finalImage = await fileToDataUrl(formData.image);
}

// Otherwise fetch default based on category
if (!finalImage) {
  const { data: d, error: defaultError } = await supabase
    .from("category_defaults")
    .select("default_image")
    .eq("category", formData.Category)
    .single();

  if (defaultError || !d?.default_image) {
    console.error("Error fetching default image:", defaultError);
    finalImage = "https://jtzvwgbzhqjosvahyfmm.supabase.co/storage/v1/object/public/Defaults/default.jpg";
  } else {
    finalImage = d.default_image;
  }
}

// Build payload
const payload = {
  name: formData.name.trim(),
  description: formData.description.trim(),
  location: formData.location.trim(),
  contact: formData.contact.trim(),
  date: new Date().toISOString().slice(0, 10),
  Category: formData.Category,
  added_by: formData.added_by,
  imageURL: finalImage,
};

// Insert into Supabase
const { error } = await supabase.from(table).insert(payload);


        if (error) {
          console.error("Supabase insert error:", error);
          alert("Could not save item. Please try again.");
        } else {
          alert("Item added successfully!");
          if (item.toLowerCase() === "lost") fetchLostItems();
          else fetchFoundItems();
          navigate(-1);
        }
      } else {
        const form = new FormData();
        form.append("added_by", formData.added_by);
        form.append("contact", formData.contact);
        form.append("location", formData.location);
        form.append("name", formData.name);
        form.append("Category", formData.Category);
        form.append("description", formData.description);
        if (formData.image) form.append("imageURL", formData.image);

        const endpoint = item.toLowerCase() === "lost" ? "lost" : "found";

        const res = await fetch(`${BASE_URL}/api/${endpoint}`, {
          method: "POST",
          body: form,
        });

        const data = await res.json();

        if (data.error) {
          alert("Error adding item: " + data.error);
        } else {
          alert("Item added successfully!");
          if (item.toLowerCase() === "lost") fetchLostItems();
          else fetchFoundItems();
          navigate(-1);
        }
      }
    } catch (err) {
      console.error("Error submitting item:", err);
      alert("Failed to connect to backend.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="header-back">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>
      <div className="found-container">
        <h2>{`Report a ${item} item`}</h2>
        <form onSubmit={handleSubmit} className="found-form">
          <label>
            Registration ID:
            <input
              type="text"
              name="added_by"
              placeholder="Enter your Registration ID Eg;B25XXXXXXXXXX  "
              value={formData.added_by}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Contact Info:
            <input
              type="text"
              name="contact"
              placeholder="Eg: 03xxxxxxxxx"
              value={formData.contact}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Location:
            <input
              type="text"
              name="location"
              placeholder="Where did you find it?"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Item Name:
            <input
              type="text"
              name="name"
              placeholder="What item is this?"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Category:
            <select
              className="styled-select"
              name="Category"
              value={formData.Category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              <option>Watch</option>
              <option>Wallet</option>
              <option>Phone</option>
              <option>Jacket</option>
              <option>Shirt</option>
              <option>Bag</option>
              <option>Laptop</option>
              <option>Cap</option>
              <option>Card</option>
              <option>Others</option>
            </select>
          </label>
          <label>
            Image:
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />
          </label>
          <label>
            Description:
            <textarea
              name="description"
              placeholder="Add a short description..."
              value={formData.description}
              onChange={handleChange}
              rows="3"
              required
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </>
  );
}

export default Report;
