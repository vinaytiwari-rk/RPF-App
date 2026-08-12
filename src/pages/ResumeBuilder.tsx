import React, { useState, useRef } from 'react';
import { FileText, Download, Briefcase, GraduationCap, Sparkles, Plus, Trash2, User, Mail, Phone, MapPin } from 'lucide-react';

interface Experience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  year: string;
}

const ResumeBuilder: React.FC = () => {
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    coverLetter: '',
    title: ''
  });

  const [template, setTemplate] = useState<'default' | 'modern' | 'corporate'>('default');

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [skills, setSkills] = useState<string>('');
  
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
  };

  const addExperience = () => {
    setExperiences([...experiences, {
      id: Date.now().toString(),
      company: '',
      title: '',
      startDate: '',
      endDate: '',
      description: ''
    }]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setExperiences(experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id));
  };

  const addEducation = () => {
    setEducation([...education, {
      id: Date.now().toString(),
      school: '',
      degree: '',
      year: ''
    }]);
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu));
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter(edu => edu.id !== id));
  };

  const handlePrint = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;
      
      const resumeElement = document.getElementById("resume-preview");
      if (!resumeElement) return;

      const canvas = await html2canvas(resumeElement, { scale: 2 });
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Resume_${personalInfo.fullName.replace(/\s+/g, '_') || 'Generated'}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const generateAiSummary = async () => {
    if (!personalInfo.title) {
      alert("Please enter a Professional Title first to generate a summary and cover letter.");
      return;
    }
    
    setIsGeneratingAi(true);
    
    try {
      const expContext = experiences.map(e => `${e.title} at ${e.company}`).join(', ');
      
      const response = await fetch('/api/ai/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: personalInfo.fullName || 'Candidate',
          title: personalInfo.title,
          experience: expContext || 'Entry level',
          skills: skills || 'General professional skills'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from AI service');
      }

      const data = await response.json();
      
      setPersonalInfo(prev => ({ 
        ...prev, 
        summary: data.summary || prev.summary,
        coverLetter: data.coverLetter || prev.coverLetter
      }));
    } catch (err) {
      console.error(err);
      alert("AI generation failed. Please try again or check your API key.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-fadeIn max-w-7xl mx-auto space-y-6 print:p-0 print:m-0 print:block">
      
      {/* Hide this entire header section when printing */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-8 h-8 text-[var(--rp-primary)]" />
            AI Resume Builder
          </h1>
          <p className="text-gray-600">Create a professional resume instantly and export to PDF.</p>
        </div>
        <button
          onClick={handlePrint}
          className="px-6 py-2 bg-[var(--rp-primary)] text-white rounded-lg hover:bg-blue-800 transition-colors font-medium flex items-center gap-2"
        >
          <Download className="w-5 h-5" /> Export PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:w-full">
        
        {/* Editor Form - Hidden when printing */}
        <div className="space-y-6 print:hidden">
          
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" /> Premium Templates
            </h2>
            <div className="grid grid-cols-3 gap-3 mb-2">
              <button 
                onClick={() => setTemplate('default')} 
                className={`p-3 rounded-xl border-2 transition-all ${template === 'default' ? 'border-[var(--rp-primary)] bg-blue-50/50' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}
              >
                <div className="h-16 bg-white border border-gray-200 rounded mb-2 flex flex-col p-1 gap-1">
                  <div className="h-2 bg-gray-300 w-1/2 rounded" />
                  <div className="h-1 bg-gray-200 w-full rounded" />
                  <div className="h-1 bg-gray-200 w-full rounded" />
                </div>
                <p className="text-xs font-bold text-center text-gray-700">Classic</p>
              </button>
              
              <button 
                onClick={() => setTemplate('modern')} 
                className={`p-3 rounded-xl border-2 transition-all ${template === 'modern' ? 'border-[var(--rp-primary)] bg-blue-50/50' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}
              >
                <div className="h-16 bg-white border border-gray-200 rounded mb-2 flex p-1 gap-1">
                  <div className="w-1/3 h-full bg-blue-100 rounded" />
                  <div className="w-2/3 h-full flex flex-col gap-1">
                    <div className="h-2 bg-gray-300 w-3/4 rounded" />
                    <div className="h-1 bg-gray-200 w-full rounded" />
                  </div>
                </div>
                <p className="text-xs font-bold text-center text-gray-700">Modern</p>
              </button>
              
              <button 
                onClick={() => setTemplate('corporate')} 
                className={`p-3 rounded-xl border-2 transition-all ${template === 'corporate' ? 'border-[var(--rp-primary)] bg-blue-50/50' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}
              >
                <div className="h-16 bg-gray-900 border border-gray-800 rounded mb-2 flex flex-col p-1 gap-1 items-center justify-center">
                  <div className="h-2 bg-gray-300 w-1/2 rounded" />
                  <div className="h-1 bg-gray-500 w-3/4 rounded" />
                </div>
                <p className="text-xs font-bold text-center text-gray-700">Corporate</p>
              </button>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" /> Personal Info
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" name="fullName" placeholder="Full Name" value={personalInfo.fullName} onChange={handlePersonalInfoChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--rp-primary)]" />
              <input type="text" name="title" placeholder="Professional Title (e.g. Software Engineer)" value={personalInfo.title} onChange={handlePersonalInfoChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--rp-primary)]" />
              <input type="email" name="email" placeholder="Email Address" value={personalInfo.email} onChange={handlePersonalInfoChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--rp-primary)]" />
              <input type="tel" name="phone" placeholder="Phone Number" value={personalInfo.phone} onChange={handlePersonalInfoChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--rp-primary)]" />
              <input type="text" name="location" placeholder="Location (City, Country)" value={personalInfo.location} onChange={handlePersonalInfoChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--rp-primary)] sm:col-span-2" />
              
              <div className="sm:col-span-2 relative">
                <textarea 
                  name="summary" 
                  placeholder="Professional Summary" 
                  value={personalInfo.summary} 
                  onChange={handlePersonalInfoChange} 
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--rp-primary)] resize-none" 
                />
              </div>

              <div className="sm:col-span-2 relative">
                <textarea 
                  name="coverLetter" 
                  placeholder="AI Cover Letter (Auto-generated)" 
                  value={personalInfo.coverLetter} 
                  onChange={handlePersonalInfoChange} 
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--rp-primary)] resize-none" 
                />
                <button 
                  onClick={generateAiSummary}
                  disabled={isGeneratingAi}
                  className="absolute bottom-3 right-3 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" /> {isGeneratingAi ? 'Generating AI Profile...' : 'AI Generate Profile'}
                </button>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gray-500" /> Experience
              </h2>
              <button onClick={addExperience} className="p-2 text-[var(--rp-primary)] hover:bg-blue-50 rounded-lg transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {experiences.map((exp, index) => (
                <div key={exp.id} className="p-4 border border-gray-100 rounded-xl relative bg-gray-50/50">
                  <button onClick={() => removeExperience(exp.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                    <input type="text" placeholder="Job Title" value={exp.title} onChange={(e) => updateExperience(exp.id, 'title', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--rp-primary)]" />
                    <input type="text" placeholder="Company" value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--rp-primary)]" />
                    <input type="text" placeholder="Start (e.g. Jan 2020)" value={exp.startDate} onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--rp-primary)]" />
                    <input type="text" placeholder="End (e.g. Present)" value={exp.endDate} onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--rp-primary)]" />
                    <textarea placeholder="Description of responsibilities..." value={exp.description} onChange={(e) => updateExperience(exp.id, 'description', e.target.value)} rows={3} className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--rp-primary)] sm:col-span-2 resize-none" />
                  </div>
                </div>
              ))}
              {experiences.length === 0 && <p className="text-sm text-gray-500 italic">No experience added yet.</p>}
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-gray-500" /> Education
              </h2>
              <button onClick={addEducation} className="p-2 text-[var(--rp-primary)] hover:bg-blue-50 rounded-lg transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {education.map((edu, index) => (
                <div key={edu.id} className="p-4 border border-gray-100 rounded-xl relative bg-gray-50/50">
                  <button onClick={() => removeEducation(edu.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                    <input type="text" placeholder="Degree / Certificate" value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--rp-primary)]" />
                    <input type="text" placeholder="School / University" value={edu.school} onChange={(e) => updateEducation(edu.id, 'school', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--rp-primary)]" />
                    <input type="text" placeholder="Year (e.g. 2018 - 2022)" value={edu.year} onChange={(e) => updateEducation(edu.id, 'year', e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--rp-primary)] sm:col-span-2" />
                  </div>
                </div>
              ))}
              {education.length === 0 && <p className="text-sm text-gray-500 italic">No education added yet.</p>}
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gray-500" /> Skills
            </h2>
            <textarea 
              placeholder="E.g. JavaScript, React, Node.js, Project Management, Graphic Design..." 
              value={skills} 
              onChange={(e) => setSkills(e.target.value)} 
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--rp-primary)] resize-none" 
            />
          </div>

        </div>
        
        {/* Live Preview / Print Area */}
        {/* We use an explicit width for the preview to mimic an A4 page, scaling it down on small screens via container */}
        <div className="lg:sticky lg:top-24 h-auto lg:h-[calc(100vh-8rem)] overflow-y-auto print:h-auto print:overflow-visible no-scrollbar">
          
          <div id="resume-preview" className={`bg-white shadow-xl rounded-sm min-h-[1056px] w-full max-w-[816px] mx-auto print:shadow-none print:min-h-0 print:max-w-full print:w-full ${template === 'modern' ? 'flex' : 'p-8 print:p-0'}`}>
            
            {template === 'modern' && (
              <div className="w-1/3 bg-gray-100 p-8 border-r border-gray-200 min-h-full">
                <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">{personalInfo.fullName || 'YOUR NAME'}</h1>
                <p className="text-md text-[var(--rp-primary)] font-semibold mb-6">{personalInfo.title || 'Professional Title'}</p>
                
                <div className="space-y-3 text-sm text-gray-700 mb-8">
                  {personalInfo.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> <span className="break-all">{personalInfo.email}</span></div>}
                  {personalInfo.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> <span>{personalInfo.phone}</span></div>}
                  {personalInfo.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> <span>{personalInfo.location}</span></div>}
                </div>

                {skills && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">Skills</h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{skills}</p>
                  </div>
                )}
              </div>
            )}

            <div className={`${template === 'modern' ? 'w-2/3 p-8' : ''} ${template === 'corporate' ? 'bg-gray-50 min-h-full' : ''}`}>
              
              {template !== 'modern' && (
                <div className={`${template === 'corporate' ? 'bg-gray-900 text-white p-8 -mx-8 -mt-8 mb-8' : 'border-b-2 border-gray-800 pb-6 mb-6'}`}>
                  <h1 className={`text-3xl font-bold uppercase tracking-widest ${template === 'corporate' ? 'text-white' : 'text-gray-900 font-serif'}`}>
                    {personalInfo.fullName || 'YOUR NAME'}
                  </h1>
                  <p className={`text-lg mt-1 font-medium ${template === 'corporate' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {personalInfo.title || 'Professional Title'}
                  </p>
                  
                  <div className={`flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm ${template === 'corporate' ? 'text-gray-400' : 'text-gray-700'}`}>
                    {personalInfo.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {personalInfo.email}</span>}
                    {personalInfo.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {personalInfo.phone}</span>}
                    {personalInfo.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {personalInfo.location}</span>}
                  </div>
                </div>
              )}
            
            {/* Resume Summary */}
            {personalInfo.summary && (
              <div className="mb-8">
                {template === 'modern' && <h3 className="text-xs font-bold text-[var(--rp-primary)] uppercase tracking-widest mb-3">Profile</h3>}
                <p className={`text-sm leading-relaxed text-justify ${template === 'corporate' ? 'text-gray-700' : 'text-gray-800'}`}>{personalInfo.summary}</p>
              </div>
            )}
            
            {/* Experience Section */}
            {experiences.length > 0 && (
              <div className="mb-8">
                <h3 className={`text-sm font-bold uppercase tracking-widest pb-1 mb-4 border-b ${template === 'modern' ? 'text-[var(--rp-primary)] border-gray-200' : 'text-gray-900 border-gray-300'}`}>
                  Professional Experience
                </h3>
                <div className="space-y-5">
                  {experiences.map(exp => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h4 className="font-bold text-gray-900">{exp.title || 'Job Title'}</h4>
                        <span className="text-xs text-gray-600 font-medium">{exp.startDate} {exp.endDate ? `- ${exp.endDate}` : ''}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-2">{exp.company || 'Company Name'}</p>
                      {exp.description && (
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Education Section */}
            {education.length > 0 && (
              <div className="mb-8">
                <h3 className={`text-sm font-bold uppercase tracking-widest pb-1 mb-4 border-b ${template === 'modern' ? 'text-[var(--rp-primary)] border-gray-200' : 'text-gray-900 border-gray-300'}`}>
                  Education
                </h3>
                <div className="space-y-4">
                  {education.map(edu => (
                    <div key={edu.id} className="flex justify-between items-baseline">
                      <div>
                        <h4 className="font-bold text-gray-900">{edu.degree || 'Degree'}</h4>
                        <p className="text-sm text-gray-700">{edu.school || 'School'}</p>
                      </div>
                      <span className="text-xs text-gray-600 font-medium">{edu.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Skills Section */}
            {skills && template !== 'modern' && (
              <div className="mb-8">
                <h3 className={`text-sm font-bold uppercase tracking-widest pb-1 mb-4 border-b ${template === 'corporate' ? 'text-gray-900 border-gray-300' : 'text-gray-900 border-gray-300'}`}>
                  Skills
                </h3>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{skills}</p>
              </div>
            )}

            {/* Cover Letter Section (Page Break for Print) */}
            {personalInfo.coverLetter && (
              <div className="print:break-before-page mt-12 pt-12 border-t border-gray-200">
                <h3 className={`text-sm font-bold uppercase tracking-widest pb-1 mb-6 border-b ${template === 'modern' ? 'text-[var(--rp-primary)] border-gray-200' : 'text-gray-900 border-gray-300'}`}>
                  Cover Letter
                </h3>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap text-justify">
                  {personalInfo.coverLetter}
                </p>
              </div>
            )}
            
            </div> {/* End of dynamic content wrapper */}
            
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
