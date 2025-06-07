import { useState } from "react";
import Head from "next/head";

const COUNTRY_OPTIONS = [
  "Czech Republic", "Hungary", "Italy", "Ireland", "Germany", "Lithuania", "Cyprus",
  "Poland", "United Arab Emirates", "United Kingdom", "Latvia", "Malaysia", "Bahrain",
  "Spain", "Romania", "Bulgaria", "Croatia"
];

const GOOGLE_REVIEW_URL = "https://g.page/r/CfvMwTpV5oK7EBM/review";

export default function Home() {
  const [form, setForm] = useState({
    studentName: "",
    email: "",
    phone: "",
    altPhone: "",
    registered: "",
    referral: "",
    country: "",
    university: "",
    file: null,
    recommend: "",
    acknowledge: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else if (type === "file") {
      setForm({ ...form, file: files[0] });
      setFileName(files[0]?.name || "");
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Validation
    if (!form.studentName || !form.email || !form.phone || !form.country || !form.university || !form.file || !form.recommend || !form.acknowledge) {
      setError("Please fill all required fields.");
      setSubmitting(false);
      return;
    }
    if (form.registered === "no" && !form.referral) {
      setError("Please provide the name of the person/student who referred you.");
      setSubmitting(false);
      return;
    }

    // Prepare form data
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "file" && value) {
        data.append("file", value);
      } else {
        data.append(key, value);
      }
    });

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        body: data,
      });
      if (res.ok) {
        if (parseInt(form.recommend, 10) >= 8) {
          window.location.href = GOOGLE_REVIEW_URL;
        } else {
          setSubmitted(true);
        }
      } else {
        setError("Submission failed. Please try again.");
      }
    } catch (err) {
      setError("Submission failed. Please try again.");
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <>
        <Head>
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
        </Head>
        <style jsx global>{`
          body, .form-container {
            font-family: 'Montserrat', Arial, sans-serif;
          }
        `}</style>
        <div className="form-container">
          <h2>Thank you for your submission!</h2>
          <p>We will contact you soon.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      <style jsx global>{`
        body, .form-container {
          font-family: 'Montserrat', Arial, sans-serif;
        }
      `}</style>
      <div className="form-container">
        <h2>Gyanberry - Student WhatsApp Group Registration – 2025 Intake</h2>
        <p className="help-text">
          Please fill out this form to be added to the official WhatsApp group for students enrolling in the 2025 intake.<br />
          This group will help you stay informed, connect with fellow students, and receive important updates about your university journey.
        </p>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <label>
            Student Name*<br />
            <input type="text" name="studentName" value={form.studentName} onChange={handleChange} required />
          </label>
          <label>
            Gyanberry App Registered Email ID*<br />
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
            <span className="field-help">Mention the primary email id that you registered with on Gyanberry App.</span>
          </label>
          <label>
            Registered Phone Number With Country Code*<br />
            <input type="text" name="phone" value={form.phone} onChange={handleChange} required placeholder="ex: +9715012345652" />
            <span className="field-help">Primary Number with country code to be added on WhatsApp group</span>
          </label>
          <label>
            Alternate Phone Number With Country Code<br />
            <input type="text" name="altPhone" value={form.altPhone} onChange={handleChange} placeholder="ex: +9715012345652" />
            <span className="field-help">Alternate Number with country code to be added on WhatsApp group</span>
          </label>
          <label>
            Did you register with Gyanberry for the University Application/Admission Process?*<br />
            <input type="radio" name="registered" value="yes" checked={form.registered === "yes"} onChange={handleChange} required /> Yes, I am registered with Gyanberry<br />
            <input type="radio" name="registered" value="no" checked={form.registered === "no"} onChange={handleChange} required /> No, I am not registered with Gyanberry
          </label>
          {form.registered === "no" && (
            <label>
              If you are not registered with Gyanberry, kindly provide the name of the person/Student who referred you.*<br />
              <input type="text" name="referral" value={form.referral} onChange={handleChange} required />
            </label>
          )}
          <label>
            Which is your final choice of country?*<br />
            <select name="country" value={form.country} onChange={handleChange} required>
              <option value="">Select a country</option>
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Please specify your final choice of University that you will be enrolling in*<br />
            <input type="text" name="university" value={form.university} onChange={handleChange} required />
          </label>
          <label>
            Upload Valid proof to confirm your enrolment at the specified University*<br />
            <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} required />
            {fileName && <span>Selected file: {fileName}</span>}
            <span className="field-help">
              <em>Acceptable Valid Proofs:</em><br />
              1. Proof of tuition fee or deposit fee payment (partial or full) - Either in form of official receipt received from University or Bank transfer copy.<br />
              2. In case the University did not require any tuition fee payment to confirm your seat then upload copy of Email sent by you to the University to accept the admission offer.
            </span>
          </label>
          <label>
            How strongly would you recommend Gyanberry to other students*<br />
            <select name="recommend" value={form.recommend} onChange={handleChange} required>
              <option value="">Select rating</option>
              {[...Array(10)].map((_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </select>
            <span> (10 - Highly recommended, 1 - Not at all recommended)</span>
          </label>
          <div style={{ background: "#f7f7f7", padding: 10, borderRadius: 4, marginBottom: 10 }}>
            <b>Terms & Conditions and Declaration</b>
            <ul>
              <li>The student MUST HAVE PAID TUITION FEES OR CONFIRMED THEIR ADMISSION to the final University they wish to join, as per the specified requirements from the University to accept the offer.</li>
              <li>The student must submit a valid proof of confirmation in the form. The file uploaded will be validated by the Gyanberry team.</li>
              <li>The Whatsapp group will be created for each University where we have more than 5 students confirmed to proceed with the University.</li>
              <li>You will be added ONLY IN ONE Whatsapp group based on the final university choice you are proceeding with.</li>
              <li>The sole purpose of the whatsapp group is to introduce students/families with each other. The questions towards Gyanberry must not be added in the whatsapp and they should be directly written to admissions@gyanberry.com</li>
            </ul>
          </div>
          <label>
            <input type="checkbox" name="acknowledge" checked={form.acknowledge} onChange={handleChange} required />
            I agree to have read and accepted all of the above declaration and terms and conditions.*
          </label>
          {error && <div className="error">{error}</div>}
          <button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</button>
        </form>
        <style jsx>{`
          .form-container {
            max-width: 500px;
            margin: 40px auto;
            background: #fff;
            padding: 32px 28px;
            border-radius: 16px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          }
          h2 {
            text-align: center;
            margin-bottom: 18px;
            font-size: 2.4rem;
            font-weight: 700;
            color: #2d3a4a;
          }
          .help-text {
            font-size: 1.08rem;
            color: #333;
            margin-bottom: 18px;
            text-align: center;
          }
          .field-help {
            display: block;
            font-size: 0.97rem;
            color: #555;
            margin-top: 2px;
            margin-bottom: 8px;
          }
          label {
            display: block;
            margin-bottom: 18px;
            font-weight: 500;
            color: #2d3a4a;
          }
          input[type="text"], input[type="email"], input[type="tel"], select, input[type="file"] {
            width: 100%;
            padding: 10px 12px;
            margin-top: 6px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 1rem;
            background: #f9fafb;
            transition: border 0.2s;
          }
          input[type="text"]:focus, input[type="email"]:focus, input[type="tel"]:focus, select:focus {
            border: 1.5px solid #007bff;
            outline: none;
            background: #fff;
          }
          input[type="radio"], input[type="checkbox"] {
            margin-right: 8px;
          }
          button[type="submit"] {
            width: 100%;
            background: #007bff;
            color: #fff;
            border: none;
            padding: 12px 0;
            border-radius: 6px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            margin-top: 18px;
            transition: background 0.2s;
          }
          button[type="submit"]:hover {
            background: #0056b3;
          }
          .error {
            color: #d32f2f;
            margin-bottom: 12px;
            font-weight: 500;
          }
        `}</style>
      </div>
    </>
  );
} 