import React from "react";
import {
  FaAward,
  FaTimes,
  FaPrint,
  FaCheckCircle,
  FaShieldAlt
} from "react-icons/fa";

const CertificateModal = ({ certificate, studentName, onClose }) => {
  if (!certificate) return null;

  const {
    course,
    certificateId,
    approvedAt,
    teacherSignature,
    completedAt
  } = certificate;

  const realStudentName = (studentName || "Student Name").toUpperCase();
  const rawCourseTitle = course?.title || "Course Title";
  const realCourseTitle = rawCourseTitle.toUpperCase();
  const realInstructorName = course?.instructor || "Course Instructor";
  const realCertificateId =
    certificateId || `CERT-EDU-${Date.now().toString(36).toUpperCase()}`;

  const realDateOfCompletion = approvedAt
    ? new Date(approvedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : completedAt
    ? new Date(completedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const realTeacherSignature =
    teacherSignature ||
    `Digitally Signed by Prof. ${realInstructorName}`;

  const handlePrint = () => {
    let iframe = document.getElementById("certificate-print-frame");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "certificate-print-frame";
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0px";
      iframe.style.height = "0px";
      iframe.style.border = "none";
      iframe.style.visibility = "hidden";
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${realStudentName}</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 0mm;
            }
            html, body {
              width: 100vw;
              height: 100vh;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
              background-color: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-family: 'Times New Roman', Times, serif, Georgia, serif;
            }
            .certificate-card {
              width: 100vw;
              height: 100vh;
              box-sizing: border-box;
              background-image: url('/certificate-bg.png');
              background-size: 100% 100%;
              background-position: center;
              background-repeat: no-repeat;
              padding: 85px 100px 80px 100px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              text-align: center;
              color: #0f172a;
            }
            .top-spacer {
              height: 45px;
            }
            .subtitle {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 13px;
              font-weight: bold;
              letter-spacing: 4px;
              color: #475569;
              text-transform: uppercase;
              margin-bottom: 12px;
            }
            .student-name-container {
              margin: 10px 0;
            }
            .student-name {
              font-size: 40px;
              font-weight: 900;
              text-transform: uppercase;
              color: #451a03;
              border-bottom: 2px solid rgba(217, 119, 6, 0.4);
              display: inline-block;
              padding-bottom: 6px;
              letter-spacing: 2px;
            }
            .completion-desc {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 12px;
              color: #475569;
              max-width: 560px;
              margin: 12px auto;
              line-height: 1.5;
            }
            .course-title-container {
              margin: 10px 0;
            }
            .course-title {
              font-size: 28px;
              font-weight: 800;
              color: #78350f;
              text-transform: uppercase;
              letter-spacing: 1px;
              line-height: 1.2;
            }
            .academy-tag {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 11px;
              font-weight: bold;
              letter-spacing: 2px;
              color: #92400e;
              text-transform: uppercase;
              margin-top: 8px;
            }
            .footer-grid {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              border-top: 1px solid rgba(217, 119, 6, 0.4);
              padding-top: 14px;
              padding-left: 10px;
              padding-right: 10px;
              margin-bottom: 5px;
            }
            .footer-col {
              display: flex;
              flex-direction: column;
            }
            .footer-label {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 9.5px;
              font-weight: bold;
              color: #475569;
              letter-spacing: 1px;
              margin-bottom: 4px;
              text-transform: uppercase;
            }
            .signature-text {
              font-style: italic;
              font-size: 14px;
              font-weight: bold;
              color: #451a03;
              border-bottom: 1px solid #94a3b8;
              padding-bottom: 2px;
              display: inline-block;
            }
            .cert-id {
              font-family: monospace;
              font-weight: bold;
              background-color: #fef3c7;
              padding: 2px 8px;
              border-radius: 4px;
              border: 1px solid #fcd34d;
              color: #0f172a;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="certificate-card">
            <div class="top-spacer"></div>

            <div>
              <div class="subtitle">THIS IS PROUDLY PRESENTED TO</div>
              <div class="student-name-container">
                <div class="student-name">${realStudentName}</div>
              </div>
              <div class="completion-desc">for successfully completing all requirements, practical assessments, and modules for the course</div>
              <div class="course-title-container">
                <div class="course-title">${realCourseTitle}</div>
              </div>
              <div class="academy-tag">EduPortal Academy • Verified Course Program</div>
            </div>

            <div class="footer-grid">
              <div class="footer-col" style="text-align: left;">
                <span class="footer-label">DATE OF COMPLETION</span>
                <strong style="color: #0f172a; font-size: 13px;">${realDateOfCompletion}</strong>
              </div>

              <div class="footer-col" style="text-align: center;">
                <span class="footer-label">CERTIFICATE ID</span>
                <div><span class="cert-id">${realCertificateId}</span></div>
              </div>

              <div class="footer-col" style="text-align: right;">
                <span class="footer-label">TEACHER'S SIGNATURE</span>
                <div><span class="signature-text">✍️ ${realTeacherSignature}</span></div>
                <span style="font-size: 11px; font-weight: bold; margin-top: 3px; color: #0f172a;">${realInstructorName}</span>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      
      {/* Main Modal Container */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.3)] overflow-hidden text-slate-900 my-4">
        
        {/* Modal Top Control Bar */}
        <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-amber-950/90 via-slate-900 to-slate-950 border-b border-amber-500/30 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40">
              <FaAward className="text-2xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Official Course Certificate
                </h2>
                <span className="bg-emerald-950 text-emerald-400 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                  <FaShieldAlt /> Digitally Verified
                </span>
              </div>
              <p className="text-xs text-amber-300/80">
                Issued by EduPortal Academy & Verified by Instructor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all hover:scale-[1.02]"
            >
              <FaPrint /> Print / Save Certificate PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
              title="Close Modal"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        {/* Modal Body Card View */}
        <div className="p-3 sm:p-6 bg-slate-950 flex justify-center items-center">
          
          {/* THE CERTIFICATE CARD */}
          <div
            className="certificate-card relative w-full aspect-[4/3] max-w-[900px] rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-12 flex flex-col justify-between text-slate-900 bg-white"
            style={{
              backgroundImage: "url('/certificate-bg.png')",
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >

            {/* TOP AREA: Spacing for pre-printed "CERTIFICATE OF COMPLETION" title on background */}
            <div className="h-14 sm:h-20"></div>

            {/* MIDDLE AREA: Student Name & Course Details */}
            <div className="text-center px-4 sm:px-12 my-auto space-y-2 sm:space-y-3">
              
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-slate-600 font-sans">
                THIS IS PROUDLY PRESENTED TO
              </p>

              {/* Real Student Name */}
              <div className="py-1">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase text-amber-950 font-serif tracking-wider drop-shadow-sm border-b-2 border-amber-600/30 inline-block px-6 pb-2">
                  {realStudentName}
                </h1>
              </div>

              <p className="text-[11px] sm:text-xs font-medium text-slate-600 max-w-lg mx-auto leading-relaxed">
                for successfully completing all requirements, practical assessments, and modules for the course
              </p>

              {/* Real Course Title */}
              <div className="py-1">
                <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-amber-900 font-serif uppercase tracking-normal">
                  {realCourseTitle}
                </h2>
              </div>

              <p className="text-[10px] sm:text-xs text-amber-800/80 font-bold uppercase tracking-widest">
                EduPortal Academy • Verified Course Program
              </p>
            </div>

            {/* BOTTOM AREA: Date, Certificate ID, and Real Teacher Signature */}
            <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end pt-3 sm:pt-4 border-t border-amber-600/30 px-2 sm:px-6 text-slate-800 mb-1">
              
              {/* Left: Real Date of Completion */}
              <div className="text-left space-y-1">
                <div className="text-[9px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  DATE OF COMPLETION
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 font-serif">
                  {realDateOfCompletion}
                </div>
              </div>

              {/* Center: Certificate ID */}
              <div className="text-center space-y-1">
                <div className="text-[9px] sm:text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  CERTIFICATE ID
                </div>
                <div className="text-[10px] sm:text-xs font-mono font-bold text-slate-900 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-400/40 inline-block">
                  {realCertificateId}
                </div>
              </div>

              {/* Right: Real Teacher's Signature */}
              <div className="text-right space-y-1">
                <div className="text-[9px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  TEACHER'S SIGNATURE
                </div>
                
                {/* Real Teacher Signature String */}
                <div>
                  <span className="text-xs sm:text-base font-serif italic text-amber-950 font-bold tracking-wide border-b border-slate-400/60 pb-0.5 inline-block">
                    ✍️ {realTeacherSignature}
                  </span>
                </div>

                <div className="text-[10px] sm:text-xs font-bold text-slate-900">
                  {realInstructorName}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-slate-950 border-t border-white/10 text-white">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
            <FaCheckCircle /> Dynamically Generated & Authenticated Certificate
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all hover:scale-[1.02]"
            >
              <FaPrint /> Print / Save Certificate PDF
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors border border-white/10"
            >
              Close Window
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CertificateModal;
