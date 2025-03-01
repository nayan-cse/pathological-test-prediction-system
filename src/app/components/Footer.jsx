// "use client";
// const Footer = () => {
//   return (
//     <footer className="bg-gray-800 text-white text-center p-4 mt-8">
//       <p>&copy; 2025 Pathological Test Prediction. All rights reserved.</p>
//       <p> Developed by Nayan Malakar.</p>
//       <p> Supervised by Abu Rafe Md Jamil</p>
//     </footer>
//   );
// };

// export default Footer;

"use client";
import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full py-6 bg-blue-600 text-white">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-3">
        <div className="text-sm">
          © 2025 Pathological Test Prediction. All rights reserved.
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm">
          <div>Developed by Nayan Malakar</div>
          <div>Supervised by Abu Rafe Md Jamil</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;