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
    title: ''
  });

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

  const handlePrint = () => {
    window.print();
  };

  const generateAiSummary = () => {
    if (!personalInfo.title) {
      alert("Please enter a Professional Title first to generate a summary.");
      return;
    }
    
    setIsGeneratingAi(true);
    
    // Simulate AI delay
    setTimeout(() => {
      const templates: Record<string, string> = {
        'default': `Dedicated and results-driven ${personalInfo.title} with a proven track record of delivering high-quality work. Adept at problem-solving, team collaboration, and continuously learning new skills to drive business success.`,
        'developer': `Innovative Software Developer with experience in building scalable web applications. Strong proficiency in modern JavaScript frameworks, responsive design, and RESTful API integration. Passionate about writing clean, maintainable code.`,
        'manager': `Experienced Manager with a strong background in leading cross-functional teams, optimizing operational workflows, and driving strategic initiatives. Proven ability to meet complex project deadlines while maintaining high team morale.`,
        'designer': `Creative Designer specializing in user-centric interfaces and compelling visual narratives. Expertise in turning complex requirements into intuitive, elegant designs that enhance user engagement and brand identity.`
      };
      
      const titleLower = personalInfo.title.toLowerCase();
      let matchedSummary = templates['default'];
      
      if (titleLower.includes('develop') || titleLower.includes('engineer') || titleLower.includes('programmer')) {
        matchedSummary = templates['developer'];
      } else if (titleLower.includes('manag') || titleLower.includes('lead') || titleLower.includes('director')) {
        matchedSummary = templates['manager'];
      } else if (titleLower.includes('design') || titleLower.includes('art') || titleLower.includes('ui/ux')) {
        matchedSummary = templates['designer'];
      }
      
      setPersonalInfo(prev => ({ ...prev, summary: matchedSummary }));
      setIsGeneratingAi(false);
    }, 1500);
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
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--rp-primary)] resize-none" 
                />
                <button 
                  onClick={generateAiSummary}
                  disabled={isGeneratingAi}
                  className="absolute bottom-3 right-3 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md text-sm font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" /> {isGeneratingAi ? 'Generating...' : 'AI Suggest'}
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
          
          <div className="bg-white shadow-xl rounded-sm p-8 min-h-[1056px] w-full max-w-[816px] mx-auto print:shadow-none print:min-h-0 print:p-0">
            
            {/* Resume Header */}
            <div className="border-b-2 border-gray-800 pb-6 mb-6">
              <h1 className="text-3xl font-serif font-bold text-gray-900 uppercase tracking-widest">{personalInfo.fullName || 'YOUR NAME'}</h1>
              <p className="text-lg text-gray-600 mt-1 font-medium">{personalInfo.title || 'Professional Title'}</p>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-gray-700">
                {personalInfo.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {personalInfo.email}</span>}
                {personalInfo.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {personalInfo.phone}</span>}
                {personalInfo.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {personalInfo.location}</span>}
              </div>
            </div>
            
            {/* Resume Summary */}
            {personalInfo.summary && (
              <div className="mb-6">
                <p className="text-sm text-gray-800 leading-relaxed text-justify">{personalInfo.summary}</p>
              </div>
            )}
            
            {/* Experience Section */}
            {experiences.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-1 mb-4">Professional Experience</h3>
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
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-1 mb-4">Education</h3>
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
            {skills && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b border-gray-300 pb-1 mb-4">Skills</h3>
                <p className="text-sm text-gray-800 leading-relaxed">{skills}</p>
              </div>
            )}
            
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
