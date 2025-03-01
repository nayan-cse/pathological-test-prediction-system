"use client";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useState, useEffect } from "react";
import { X, Search, AlertCircle, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import Modal from "react-modal";

const symptoms = [
  { name: "Itching", bangla: "চুলকানি" },
  { name: "Skin Rash", bangla: "চামড়ার ফুসকুড়ি" },
  { name: "Nodal Skin Eruptions", bangla: "ত্বকের ফোঁড়া বা ফোসকা" },
  { name: "Continuous Sneezing", bangla: "বিরতিহীন হাঁচি" },
  { name: "Shivering", bangla: "শরীর কাঁপা বা ঝাঁকুনি দেওয়া" },
  { name: "Chills", bangla: "ঠান্ডা লেগে যাওয়া" },
  { name: "Joint Pain", bangla: "হাড়ের জয়েন্টে ব্যথা" },
  { name: "Stomach Pain", bangla: "পেটে ব্যথা" },
  { name: "Acidity", bangla: "গ্যাস্ট্রিক বা এসিডিটি" },
  { name: "Ulcers on Tongue", bangla: "জিভে ঘা" },
  { name: "Muscle Wasting", bangla: "পেশী সঙ্কোচন বা ক্ষয়" },
  { name: "Vomiting", bangla: "বমি" },
  { name: "Burning Micturition", bangla: "মূত্রে জ্বালাপোড়া" },
  { name: "Spotting Urination", bangla: "মূত্রের সাথে রক্ত পড়া" },
  { name: "Fatigue", bangla: "অধিক ক্লান্তি" },
  { name: "Weight Gain", bangla: "ওজন বেড়ে যাওয়া" },
  { name: "Anxiety", bangla: "উদ্বিগ্নতা বা অস্থিরতা" },
  { name: "Cold Hands and Feet", bangla: "হাত-পা ঠান্ডা  অনুভব" },
  { name: "Mood Swings", bangla: "মেজাজের পরিবর্তন" },
  { name: "Weight Loss", bangla: "ওজন কমে যাওয়া" },
  { name: "Restlessness", bangla: "অশান্তি,অস্বস্থি বা অস্থিরতা" },
  { name: "Lethargy", bangla: "অলসতা বা অবসাদগ্রস্থ" },
  { name: "Patches in Throat", bangla: "গলায় দাগ বা গলায় ব্যাথা" },
  { name: "Irregular Sugar Level", bangla: "অস্বাভাবিক সুগার লেভেল" },
  { name: "Cough", bangla: "কাশি" },
  { name: "High Fever", bangla: "উচ্চ তাপমাত্রা বা জ্বর" },
  { name: "Sunken Eyes", bangla: "চোখ গভীরে যাওয়া" },
  { name: "Breathlessness", bangla: "শ্বাসকষ্ট" },
  { name: "Sweating", bangla: "অস্বাভাবিক ঘাম" },
  { name: "Dehydration", bangla: "জল বা পানি শূন্যতা" },
  { name: "Indigestion", bangla: "অম্বল বা পেটে চিনচিন ব্যাথা" },
  { name: "Headache", bangla: "মাথাব্যথা" },
  { name: "Yellowish Skin", bangla: "ত্বক হলদেভাব" },
  { name: "Dark Urine", bangla: "হালকা বাদামী মূত্র" },
  { name: "Nausea", bangla: "বমি বমি ভাব" },
  { name: "Loss of Appetite", bangla: "খাবারের প্রতি অনীহা" },
  { name: "Pain Behind the Eyes", bangla: "চোখের পেছনে ব্যথা" },
  { name: "Back Pain", bangla: "পিঠের ব্যথা" },
  { name: "Constipation", bangla: "কোষ্ঠ্যকাঠিন্য বা পায়খানা কঠিন" },
  { name: "Abdominal Pain", bangla: "পেটের বিভিন্ন অংশে ব্যথা" },
  { name: "Diarrhoea", bangla: "পাতলা পায়খানা" },
  { name: "Mild Fever", bangla: "হালকা জ্বর" },
  { name: "Yellow Urine", bangla: "হলুদ মূত্র" },
  { name: "Yellowing of Eyes", bangla: "চোখের হলদে হওয়া" },
  { name: "Acute Liver Failure", bangla: "লিভারে (যকৃত) সংক্রমণ" },
  { name: "Fluid Overload", bangla: "শরীরের পানি জমা" },
  { name: "Swelling of Stomach", bangla: "পেটের ফোলাভাব" },
  { name: "Swelled Lymph Nodes", bangla: "যকৃতের লিম্ফ নোড বড় হওয়া" },
  { name: "Malaise", bangla: "অস্বস্তি বা অবসাদ" },
  { name: "Blurred and Distorted Vision", bangla: "চোখে অস্পষ্ট দেখা" },
  { name: "Phlegm", bangla: "কাশির সঙ্গে শ্লেষ্মা" },
  { name: "Throat Irritation", bangla: "গলায় জ্বালাপোড়া" },
  { name: "Redness of Eyes", bangla: "চোখের লাল হওয়া" },
  { name: "Sinus Pressure", bangla: "সাইনাসের চাপ" },
  { name: "Runny Nose", bangla: "নাক দিয়ে স্রাব বের হওয়া" },
  { name: "Congestion", bangla: "গলা বা নাক বন্ধ হওয়া" },
  { name: "Chest Pain", bangla: "বুকে ব্যথা" },
  { name: "Weakness in Limbs", bangla: "অঙ্গপ্রত্যঙ্গে দুর্বলতা" },
  { name: "Fast Heart Rate", bangla: "তীব্র হৃদস্পন্দন" },
  {
    name: "Pain During Bowel Movements",
    bangla: "পায়খানার সময় তীব্র বা তীক্ষ্ণ ব্যথা",
  },
  { name: "Pain in Anal Region", bangla: "মলদ্বারের অঞ্চলে ব্যথা" },
  { name: "Bloody Stool", bangla: "রক্তাক্ত পায়খানা" },
  { name: "Irritation in Anus", bangla: "মলদ্বারের অস্বস্তি বা জ্বালাপোড়া" },
  { name: "Neck Pain", bangla: "গলায় ব্যথা" },
  { name: "Dizziness", bangla: "মাথা ঘোরা" },
  { name: "Cramps", bangla: "পেশীর টান বা খিঁচুনি" },
  { name: "Bruising", bangla: "রক্তবর্ণ ছোপ বা রক্তক্ষরণ" },
  { name: "Obesity", bangla: "মোটা হওয়া" },
  { name: "Swollen Legs", bangla: "পা ফুলে যাওয়া" },
  { name: "Swollen Blood Vessels", bangla: "ফুলে যাওয়া রক্তনালী" },
  { name: "Puffy Face and Eyes", bangla: "ফোলা মুখ এবং চোখ" },
  { name: "Enlarged Thyroid", bangla: "থাইরয়েড বড় হয়ে যাওয়া" },
  { name: "Brittle Nails", bangla: "সহজে নখ ভেঙ্গে যাওয়া" },
  { name: "Swollen Extremities", bangla: "অঙ্গপ্রত্যঙ্গ অতিরিক্ত ফুলে যাওয়া" },
  { name: "Excessive Hunger", bangla: "অতিরিক্ত ক্ষুধা" },
  {
    name: "Extra Marital Contacts",
    bangla: "বিবাহ বহির্ভুত সম্পর্ক",
  },
  { name: "Drying and Tingling Lips", bangla: "শুকনো ঠোঁট" },
  { name: "Slurred Speech", bangla: "কথা জড়িয়ে যাওয়া" },
  { name: "Knee Pain", bangla: "ঘাড় ব্যথা" },
  { name: "Hip Joint Pain", bangla: "কোমড়ের জয়েন্টে ব্যথা" },
  { name: "Muscle Weakness", bangla: "পেশিতে দুর্বলতা" },
  { name: "Stiff Neck", bangla: "ঘাড় শক্ত হয়ে যাওয়া" },
  { name: "Swelling Joints", bangla: "জয়েন্ট ফুলে যাওয়া" },
  { name: "Movement Stiffness", bangla: "গতির কঠিনতা" },
  { name: "Spinning Movements", bangla: "চলাচল করতে অসুবিধা" },
  { name: "Loss of Balance", bangla: "চলাচল করার সময় ভারসাম্য হারানো" },
  { name: "Unsteadiness", bangla: "চলাচল করার সময় অস্থিরতা" },
  { name: "Weakness of One Body Side", bangla: "শরীরের একপাশে দুর্বলতা" },
  { name: "Loss of Smell", bangla: "ঘ্রাণশক্তি হাড়ানো" },
  { name: "Bladder Discomfort", bangla: "মূত্রথলির অস্বস্তি" },
  { name: "Foul Smell of Urine", bangla: "মূত্রে দুর্গন্ধ" },
  { name: "Continuous Feel of Urine", bangla: "বাবার মূত্র অনুভূতি" },
  { name: "Passage of Gases", bangla: "গ্যাসের নিঃসরণ" },
  { name: "Internal Itching", bangla: "শরীরের মধ্যে চুলকানি" },
  { name: "Depression", bangla: "বিষন্নতা" },
  { name: "Irritability", bangla: "রাগ হওয়া" },
  { name: "Muscle Pain", bangla: "পেশীতে ব্যথা" },
  { name: "Red Spots Over Body", bangla: "দেহে লাল দাগ" },
  { name: "Belly Pain", bangla: "পেটে ব্যথা" },
  { name: "Abnormal Menstruation", bangla: "অস্বাভাবিক মাসিক" },
  { name: "Dischromic Patches", bangla: "ত্বকে অস্বাভাবিক রঙের পরিবর্তন" },
  { name: "Watering from Eyes", bangla: "চোখ থেকে পানি ঝরা" },
  { name: "Increased Appetite", bangla: "অতিরিক্ত ক্ষুধা" },
  { name: "Polyuria", bangla: "অতিরিক্ত মূত্রত্যাগ" },
  { name: "Family History", bangla: "পারিবারিক ইতিহাস" },
  { name: "Mucoid Sputum", bangla: "স্লাইম জাতীয় কফ বা শ্লেষ্মা" },
  { name: "Rusty Sputum", bangla: "লালচে কফ" },
  { name: "Lack of Concentration", bangla: "মনোযোগের অভাব" },
  { name: "Visual Disturbances", bangla: "দৃষ্টি প্রতিবন্ধকতা" },
  { name: "Receiving Blood Transfusion", bangla: "রক্ত স্থানান্তর গ্রহণ" },
  { name: "Receiving Unsterile Injections", bangla: "অস্টেরিল ইনজেকশন গ্রহণ" },
  { name: "Coma", bangla: "কোমা" },
  { name: "Stomach Bleeding", bangla: "পেটের রক্তপাত" },
  { name: "Distention of Abdomen", bangla: "পেটের ফোলাভাব" },
  { name: "History of Alcohol Consumption", bangla: "মদ্যপান ইতিহাস" },
  { name: "Jaundice", bangla: "জন্ডিস" },
  { name: "High Blood Pressure", bangla: "উচ্চ রক্তচাপ" },
  { name: "Muscle Cramps", bangla: "পেশীতে টান বা সংকোচন" },
  { name: "Hair Loss", bangla: "চুল পড়া" },
  { name: "Frequent Urination", bangla: "ঘন ঘন মূত্রত্যাগ" },
  { name: "Swelling", bangla: "কোনো স্থান ফোলাভাব" },
  { name: "Thirst", bangla: "বারবার পিপাসা অনুভব করা" },
  { name: "Fever", bangla: "জ্বর" },
  { name: "Cold Intolerance", bangla: "ঠান্ডার প্রতি অস্বাভাবিক সহিষ্ণুতা" },
  { name: "Bone Pain", bangla: "হাড়ে ব্যথা" },
  { name: "Urinary Issues", bangla: "মূত্রথলিতে ব্যাথা" },
  { name: "Blood in Sputum", bangla: "শ্লেষ্মায় বা কফে রক্ত" },
  { name: "Prominent Veins on Calf", bangla: "পায়ের পেশীতে শিরা ফোলা" },
  { name: "Palpitations", bangla: "হৃদস্পন্দন দ্রুত বা অনিয়মিত হওয়া" },
  { name: "Painful Walking", bangla: "ব্যথাযুক্ত হাঁটা" },
  { name: "Pus Filled Pimples", bangla: "পুঁজপূর্ণ পিম্পল" },
  { name: "Blackheads", bangla: "ত্বকে কালো দাগ" },
  { name: "Scurring", bangla: "ক্ষতচিহ্ন" },
  { name: "Skin Peeling", bangla: "চামড়ার উঠে যাওয়া" },
  { name: "Diarrhea", bangla: "ডায়রিয়া" },
  { name: "Blurred Vision", bangla: "দেখতে অসুবিধা" },
  { name: "Tingling Sensation", bangla: "ঝিমঝিম বা শিরশিরান অনুভূতি" },
  { name: "Silver Like Dusting", bangla: "ত্বকে রূপালী বা সোনালি দানার মতো স্তর" },
  { name: "Small Dents in Nails", bangla: "নখে ছোট গর্ত" },
  { name: "Inflammatory Nails", bangla: "নখের গোরায় ব্যাথা" },
  { name: "Blister", bangla: "ফুসকুড়ি" },
  { name: "Red Sore Around Nose", bangla: "নাকের চারপাশে লাল ঘা" },
  { name: "Yellow Crust Ooze", bangla: "ত্বকের ওপর হলুদ ক্রাস্ট বা তরল নিঃসরণ" },
];


const MakeReport = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const router = useRouter();

  useEffect(() => {
    // Check if the user is logged in when the component is mounted
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setError("You need to log in to access this page.");
      router.push("/login"); // Redirect to login page if no token
    }
  }, [router]); // Trigger the check once when the component mounts

  const handleSelect = (e) => {
    const value = e.target.value;
    if (!selectedSymptoms.includes(value)) {
      setSelectedSymptoms([...selectedSymptoms, value]);
    }
  };

  const removeSymptom = (symptomToRemove) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptomToRemove));
  };

  const filteredSymptoms = symptoms.filter(
    (symptom) =>
      !selectedSymptoms.includes(symptom.name) &&
      (symptom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        symptom.bangla.includes(searchTerm))
  );

  const handleSubmit = async () => {
    const token = localStorage.getItem("accessToken"); // Get the JWT token from localStorage
    
    if (!token) {
      setError("No token found. Please log in again.");
      router.push("/login"); // Redirect to the login page
      return;
    }

    setLoading(true); // Start loading spinner

    try {
      const response = await fetch("/api/v1/patient/make-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,  // Send JWT token to the API
        },
        body: JSON.stringify({ symptoms: selectedSymptoms }),
      });

      const result = await response.json();

      setLoading(false); // Stop loading spinner

      if (response.ok) {
        setError(null); // Clear any previous error
        openModal(); // Open the success modal
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error("Error during request:", err);
      setLoading(false); // Stop loading spinner
      setError("An error occurred while making the report.");
      toast.error(err.message);  // Show the error message
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setTimeout(() => {
      closeModal();
      router.push("/patient/report-history"); // Redirect after 5 seconds
    }, 5000);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-gray-600">Select your symptoms for a preliminary health assessment</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left side: Selection Area */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Symptoms</h2>

            {/* Search Box */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search symptoms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Symptoms Dropdown */}
            <select
              multiple
              value={selectedSymptoms}
              onChange={handleSelect}
              className="w-full h-[calc(100vh-400px)] min-h-[300px] border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {filteredSymptoms.map((symptom) => (
                <option key={symptom.name} value={symptom.name} className="p-3 hover:bg-blue-50 cursor-pointer">
                  {symptom.name} ({symptom.bangla})
                </option>
              ))}
            </select>
          </div>

          {/* Right side: Selected Symptoms */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Selected Symptoms</h2>

            {selectedSymptoms.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p>No symptoms selected yet</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedSymptoms.map((symptom) => {
                  const symptomData = symptoms.find((s) => s.name === symptom);
                  return (
                    <div
                      key={symptom}
                      className="group flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-full transition-colors"
                    >
                      <span>{symptom}</span>
                      <span className="text-sm text-blue-500">({symptomData?.bangla})</span>
                      <button
                        onClick={() => removeSymptom(symptom)}
                        className="ml-1 p-1 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedSymptoms.length === 0}
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Generating Report...
              </div>
            ) : (
              "Generate Report"
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-600 text-center mt-4">{error}</p>}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Processing Report"
        className="modal-overlay"
        ariaHideApp={false}
      >
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your report is being reviewed by the doctor.</h2>
          <div className="mt-4">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Okay
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MakeReport;
