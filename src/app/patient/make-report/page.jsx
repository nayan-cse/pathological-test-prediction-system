"use client";

import React, { useState, useEffect } from "react";
import { X, Search, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

const symptoms = [
  { name: "Itching", bangla: "চুলকানি" },
  { name: "Skin Rash", bangla: "চামড়ার ফুসকুড়ি" },
  { name: "Nodal Skin Eruptions", bangla: "নোডাল ত্বকের ফুসকুড়ি" },
  { name: "Continuous Sneezing", bangla: "বিরতিহীন হাঁচি" },
  { name: "Shivering", bangla: "কম্পন" },
  { name: "Chills", bangla: "ঠান্ডা লেগে যাওয়া" },
  { name: "Joint Pain", bangla: "গাঁটের ব্যথা" },
  { name: "Stomach Pain", bangla: "পেটের ব্যথা" },
  { name: "Acidity", bangla: "অম্লতা" },
  { name: "Ulcers on Tongue", bangla: "জিভে ঘা" },
  { name: "Muscle Wasting", bangla: "পেশীর অপচয়" },
  { name: "Vomiting", bangla: "বমি" },
  { name: "Burning Micturition", bangla: "অগ্নি মূত্র" },
  { name: "Spotting Urination", bangla: "মূত্র পথে স্পটিং" },
  { name: "Fatigue", bangla: "অধিক ক্লান্তি" },
  { name: "Weight Gain", bangla: "ওজন বাড়ানো" },
  { name: "Anxiety", bangla: "উদ্বিগ্নতা" },
  { name: "Cold Hands and Feet", bangla: "ঠান্ডা হাত-পা" },
  { name: "Mood Swings", bangla: "মেজাজের ওঠানামা" },
  { name: "Weight Loss", bangla: "ওজন কমানো" },
  { name: "Restlessness", bangla: "অশান্তি" },
  { name: "Lethargy", bangla: "অলসতা" },
  { name: "Patches in Throat", bangla: "গলায় দাগ" },
  { name: "Irregular Sugar Level", bangla: "অস্বাভাবিক সুগার লেভেল" },
  { name: "Cough", bangla: "কাশি" },
  { name: "High Fever", bangla: "উচ্চ তাপমাত্রা" },
  { name: "Sunken Eyes", bangla: "ডুবানো চোখ" },
  { name: "Breathlessness", bangla: "শ্বাসকষ্ট" },
  { name: "Sweating", bangla: "ঘাম" },
  { name: "Dehydration", bangla: "জল শূন্যতা" },
  { name: "Indigestion", bangla: "অজীর্ণ" },
  { name: "Headache", bangla: "মাথাব্যথা" },
  { name: "Yellowish Skin", bangla: "হলদে ত্বক" },
  { name: "Dark Urine", bangla: "গা dark ় মূত্র" },
  { name: "Nausea", bangla: "বমির অনুভূতি" },
  { name: "Loss of Appetite", bangla: "অ্যাপেটাইটের ক্ষতি" },
  { name: "Pain Behind the Eyes", bangla: "চোখের পেছনে ব্যথা" },
  { name: "Back Pain", bangla: "পিঠের ব্যথা" },
  { name: "Constipation", bangla: "কবজ" },
  { name: "Abdominal Pain", bangla: "পেটের ব্যথা" },
  { name: "Diarrhoea", bangla: "পঁচন" },
  { name: "Mild Fever", bangla: "হালকা জ্বর" },
  { name: "Yellow Urine", bangla: "হলুদ মূত্র" },
  { name: "Yellowing of Eyes", bangla: "চোখের হলদে হওয়া" },
  { name: "Acute Liver Failure", bangla: "তীব্র লিভারের ব্যর্থতা" },
  { name: "Fluid Overload", bangla: "পানির অতিরিক্ত লোড" },
  { name: "Swelling of Stomach", bangla: "পেটের ফোলাভাব" },
  { name: "Swelled Lymph Nodes", bangla: "ফোলা লিম্ফ নোডস" },
  { name: "Malaise", bangla: "অসুস্থতা" },
  { name: "Blurred and Distorted Vision", bangla: "অস্পষ্ট এবং বিকৃত দৃশ্য" },
  { name: "Phlegm", bangla: "কাশির সঙ্গে শ্লেষ্মা" },
  { name: "Throat Irritation", bangla: "গলায় জ্বালাপোড়া" },
  { name: "Redness of Eyes", bangla: "চোখের লাল হওয়া" },
  { name: "Sinus Pressure", bangla: "সাইনাসের চাপ" },
  { name: "Runny Nose", bangla: "নাক দিয়ে স্রাব" },
  { name: "Congestion", bangla: "নাক বন্ধ" },
  { name: "Chest Pain", bangla: "বুকে ব্যথা" },
  { name: "Weakness in Limbs", bangla: "অঙ্গের দুর্বলতা" },
  { name: "Fast Heart Rate", bangla: "তীব্র হৃদস্পন্দন" },
  {
    name: "Pain During Bowel Movements",
    bangla: "পেট পরিষ্কার করার সময় ব্যথা",
  },
  { name: "Pain in Anal Region", bangla: "অ্যানাল অঞ্চলে ব্যথা" },
  { name: "Bloody Stool", bangla: "রক্তাক্ত পায়খানা" },
  { name: "Irritation in Anus", bangla: "অ্যানাসে জ্বালাপোড়া" },
  { name: "Neck Pain", bangla: "গলার ব্যথা" },
  { name: "Dizziness", bangla: "মাথা ঘোরা" },
  { name: "Cramps", bangla: "কোল্ড" },
  { name: "Bruising", bangla: "মাথা ফোটা" },
  { name: "Obesity", bangla: "মোটা" },
  { name: "Swollen Legs", bangla: "ফোলা পা" },
  { name: "Swollen Blood Vessels", bangla: "ফোলা রক্তনালী" },
  { name: "Puffy Face and Eyes", bangla: "ফোলা মুখ এবং চোখ" },
  { name: "Enlarged Thyroid", bangla: "বৃদ্ধির থাইরয়েড" },
  { name: "Brittle Nails", bangla: "ভাঙানো নখ" },
  { name: "Swollen Extremities", bangla: "ফোলা হাত-পা" },
  { name: "Excessive Hunger", bangla: "অতিরিক্ত ক্ষুধা" },
  {
    name: "Extra Marital Contacts",
    bangla: "বিবাহিত সম্পর্কের বাইরেও যোগাযোগ",
  },
  { name: "Drying and Tingling Lips", bangla: "শুকনো এবং শিরশির করা ঠোঁট" },
  { name: "Slurred Speech", bangla: "মাঠো ভাষণ" },
  { name: "Knee Pain", bangla: "ঘাড় ব্যথা" },
  { name: "Hip Joint Pain", bangla: "হিপের ব্যথা" },
  { name: "Muscle Weakness", bangla: "পেশির দুর্বলতা" },
  { name: "Stiff Neck", bangla: "কঠিন গলা" },
  { name: "Swelling Joints", bangla: "ফোলা জয়েন্ট" },
  { name: "Movement Stiffness", bangla: "গতির কঠিনতা" },
  { name: "Spinning Movements", bangla: "ঘূর্ণায়মান চলাচল" },
  { name: "Loss of Balance", bangla: "সমতা হারানো" },
  { name: "Unsteadiness", bangla: "অস্থিরতা" },
  { name: "Weakness of One Body Side", bangla: "একপাশে দুর্বলতা" },
  { name: "Loss of Smell", bangla: "গন্ধের অভাব" },
  { name: "Bladder Discomfort", bangla: "মূত্রথলির অস্বস্তি" },
  { name: "Foul Smell of Urine", bangla: "মূত্রের দুর্গন্ধ" },
  { name: "Continuous Feel of Urine", bangla: "অবিচ্ছিন্ন মূত্র অনুভূতি" },
  { name: "Passage of Gases", bangla: "গ্যাসের স্রাব" },
  { name: "Internal Itching", bangla: "অন্তরঙ্গ চুলকানি" },
  { name: "Depression", bangla: "বেদনা" },
  { name: "Irritability", bangla: "রেগে যাওয়া" },
  { name: "Muscle Pain", bangla: "পেশীর ব্যথা" },
  { name: "Red Spots Over Body", bangla: "দেহে লাল দাগ" },
  { name: "Belly Pain", bangla: "পেটের ব্যথা" },
  { name: "Abnormal Menstruation", bangla: "অস্বাভাবিক মাসিক" },
  { name: "Dischromic Patches", bangla: "ডিসক্রোমিক দাগ" },
  { name: "Watering from Eyes", bangla: "চোখ থেকে পানি ঝরা" },
  { name: "Increased Appetite", bangla: "অতিরিক্ত ক্ষুধা" },
  { name: "Polyuria", bangla: "পলিউরিয়া" },
  { name: "Family History", bangla: "পারিবারিক ইতিহাস" },
  { name: "Mucoid Sputum", bangla: "মিউকোয়িড শ্লেষ্মা" },
  { name: "Rusty Sputum", bangla: "জং স্ফিত" },
  { name: "Lack of Concentration", bangla: "মনোযোগের অভাব" },
  { name: "Visual Disturbances", bangla: "দৃষ্টি প্রতিবন্ধকতা" },
  { name: "Receiving Blood Transfusion", bangla: "রক্ত স্থানান্তর গ্রহণ" },
  { name: "Receiving Unsterile Injections", bangla: "অস্টেরিল ইনজেকশন গ্রহণ" },
  { name: "Coma", bangla: "কোমা" },
  { name: "Stomach Bleeding", bangla: "পেটের রক্তপাত" },
  { name: "Distention of Abdomen", bangla: "পেটের ফোলাভাব" },
  { name: "History of Alcohol Consumption", bangla: "মদ্যপান ইতিহাস" },
  { name: "Jaundice", bangla: "হেপাটাইটিস" },
  { name: "High Blood Pressure", bangla: "উচ্চ রক্তচাপ" },
  { name: "Muscle Cramps", bangla: "পেশীর কাঁপন" },
  { name: "Hair Loss", bangla: "চুল পড়া" },
  { name: "Frequent Urination", bangla: "ঘন ঘন মূত্রত্যাগ" },
  { name: "Swelling", bangla: "ফোলাভাব" },
  { name: "Thirst", bangla: "পিপাসা" },
  { name: "Fever", bangla: "জ্বর" },
  { name: "Cold Intolerance", bangla: "ঠান্ডার প্রতি অস্বাভাবিক সহিষ্ণুতা" },
  { name: "Bone Pain", bangla: "অস্থির ব্যথা" },
  { name: "Urinary Issues", bangla: "মূত্র সমস্যা" },
  { name: "Blood in Sputum", bangla: "শ্লেষ্মায় রক্ত" },
  { name: "Prominent Veins on Calf", bangla: "বাছুরে প্রকাশিত শিরা" },
  { name: "Palpitations", bangla: "হৃদপিণ্ডের গতি" },
  { name: "Painful Walking", bangla: "ব্যথাযুক্ত হাঁটা" },
  { name: "Pus Filled Pimples", bangla: "পুঁজপূর্ণ পিম্পল" },
  { name: "Blackheads", bangla: "কালো দাগ" },
  { name: "Scurring", bangla: "সকুত্ত" },
  { name: "Skin Peeling", bangla: "চামড়ার ওঠানামা" },
  { name: "Diarrhea", bangla: "ডায়রিয়া" },
  { name: "Blurred Vision", bangla: "অস্পষ্ট দৃষ্টি" },
  { name: "Tingling Sensation", bangla: "শিরশিরান অনুভূতি" },
  { name: "Silver Like Dusting", bangla: "সিলভার ধুলোর মতো" },
  { name: "Small Dents in Nails", bangla: "নখে ছোট গর্ত" },
  { name: "Inflammatory Nails", bangla: "প্রদাহগ্রস্ত নখ" },
  { name: "Blister", bangla: "ফুসকুড়ি" },
  { name: "Red Sore Around Nose", bangla: "নাকের চারপাশে লাল ঘা" },
  { name: "Yellow Crust Ooze", bangla: "হলুদ খোলের স্রাব" },
];

const MakeReport = () => {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

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
      setResponseData(null);
      router.push("/login"); // Redirect to the login page
      return;
    }

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

      if (response.ok) {
        setResponseData(result);
        setError(null); // Clear any previous error
      } else {
        setError(result.error);
        setResponseData(null); 
      }
    } catch (err) {
      console.error("Error during request:", err);
      setError("An error occurred while making the report.");
      setResponseData(null); 
      toast.error(err.message);  // Show the error message

      // Redirect to login in case of any other error (network issue, invalid response, etc.)
      if (err.message.includes("token") || err.message === "Failed to fetch") {
        router.push("/login"); // Redirect to the login page
      }
    }
  };

  // Fetch data for GET method (e.g., previous reports or other relevant data)
  const handleGet = async () => {
    const token = localStorage.getItem("accessToken"); // Get the JWT token from localStorage

    if (!token) {
      setError("No token found. Please log in again.");
      setResponseData(null);
      router.push("/login"); // Redirect to the login page
      return;
    }

    try {
      const response = await fetch("/api/v1/patient/make-report", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,  // Send JWT token to the API
        },
      });

      const result = await response.json();

      if (response.ok) {
        setResponseData(result);
        setError(null); // Clear any previous error
      } else {
        setError(result.error);
        setResponseData(null);
      }
    } catch (err) {
      console.error("Error during request:", err);
      setError("An error occurred while fetching data.");
      setResponseData(null);
      toast.error(err.message);  // Show the error message
    }
  };

  useEffect(() => {
    handleGet(); // Fetch data on component load, if required
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Symptom Checker</h1>
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
            Generate Report
          </button>
        </div>

        {/* Error or Response */}
        {error && <p className="text-red-600 text-center mt-4">{error}</p>}
        {responseData && (
          <div className="mt-6">
            <h3 className="text-2xl font-bold">Predicted Tests</h3>
            <ul>
              {responseData.predicted_tests?.map((test, index) => (
                <li key={index} className="text-lg">{test}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MakeReport;
