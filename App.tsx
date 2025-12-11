import React, { useState } from 'react';
import { Role, StudentRecord, UploadedFile } from './types';
import FileUpload from './components/FileUpload';
import { UserCircle, Sparkles, Download, FileText, Plus, Search, Instagram, Trash2, List, X } from './components/Icons';

// Initial Data Empty
const INITIAL_STUDENTS: StudentRecord[] = [];

const App: React.FC = () => {
  const [role, setRole] = useState<Role>('student');
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  
  // Student State
  const [currentStudentName, setCurrentStudentName] = useState('');
  const [currentStudentId, setCurrentStudentId] = useState('');
  const [activeStudentSession, setActiveStudentSession] = useState<string | null>(null);

  // Teacher State
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStudentList, setShowStudentList] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');

  // --- Student Actions ---

  const handleCreateColumn = () => {
    if (!currentStudentName.trim() || !currentStudentId.trim()) {
      alert("Please enter your Name and Student ID to start.");
      return;
    }

    // Check if exists
    const existing = students.find(s => s.studentId === currentStudentId);
    if (existing) {
      setActiveStudentSession(existing.id);
    } else {
      const newStudent: StudentRecord = {
        id: Date.now().toString(),
        name: currentStudentName,
        studentId: currentStudentId,
        internshipFiles: [],
        participationFiles: []
      };
      setStudents(prev => [...prev, newStudent]);
      setActiveStudentSession(newStudent.id);
    }
  };

  const handleStudentUpload = (type: 'internship' | 'participation', file: UploadedFile) => {
    if (!activeStudentSession) return;

    setStudents(prev => prev.map(student => {
      if (student.id === activeStudentSession) {
        return {
          ...student,
          [type === 'internship' ? 'internshipFiles' : 'participationFiles']: [
            ...(type === 'internship' ? student.internshipFiles : student.participationFiles),
            file
          ]
        };
      }
      return student;
    }));
  };

  const handleStudentDeleteFile = (type: 'internship' | 'participation', fileName: string) => {
    if (!activeStudentSession) return;
    setStudents(prev => prev.map(student => {
      if (student.id === activeStudentSession) {
        const key = type === 'internship' ? 'internshipFiles' : 'participationFiles';
        return {
          ...student,
          [key]: student[key].filter(f => f.name !== fileName)
        };
      }
      return student;
    }));
  };

  // --- Teacher Actions ---

  const handleDownload = (file: UploadedFile, studentName?: string, category?: string) => {
    const link = document.createElement('a');
    link.href = file.dataUrl;
    
    if (studentName && category) {
      // Sanitize student name for filename (remove special chars)
      const safeStudentName = studentName.replace(/[^a-z0-9]/gi, '_');
      // New filename format: StudentName_Category_OriginalFileName
      link.download = `${safeStudentName}_${category}_${file.name}`;
    } else {
      link.download = file.name;
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteStudent = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the student details
    if (window.confirm("Are you sure you want to delete this student and all their uploaded data? This action cannot be undone.")) {
      setStudents(prev => prev.filter(s => s.id !== studentId));
      if (selectedStudentId === studentId) {
        setSelectedStudentId(null);
      }
    }
  };

  // --- Render Helpers ---

  const renderHeader = () => (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-lg text-white shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">SVC ECE Certificate Manager</h1>
        </div>
        
        <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-100">
          <button
            onClick={() => setRole('student')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
              role === 'student' ? 'bg-white text-blue-700 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Student View
          </button>
          <button
            onClick={() => setRole('staff')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
              role === 'staff' ? 'bg-white text-blue-700 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Staff View
          </button>
        </div>
      </div>
    </header>
  );

  const renderFooter = () => (
    <footer className="bg-white border-t border-slate-200 mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <div>
          &copy; {new Date().getFullYear()} SVC ECE Certificate Manager. All rights reserved.
        </div>
        <div className="flex items-center gap-2">
          <span>Created by Kowsik</span>
          <a 
            href="https://www.instagram.com/Iam_kowsik_/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 p-1.5 rounded-full transition-colors flex items-center gap-1"
            title="@Iam_kowsik_"
          >
            <Instagram className="w-5 h-5" />
            <span className="sr-only">Instagram</span>
          </a>
        </div>
      </div>
    </footer>
  );

  const renderStudentView = () => {
    const activeStudent = students.find(s => s.id === activeStudentSession);

    if (!activeStudent) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full px-4 bg-slate-50">
          <div className="max-w-lg w-full">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Create Your Portfolio</h2>
              <p className="text-slate-600 text-lg">Organize your internships and participation certificates.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={currentStudentName}
                    onChange={(e) => setCurrentStudentName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-400 text-slate-800 bg-white"
                    placeholder="e.g. Alex Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Student ID</label>
                  <input
                    type="text"
                    value={currentStudentId}
                    onChange={(e) => setCurrentStudentId(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-400 text-slate-800 bg-white"
                    placeholder="e.g. ST-2024-101"
                  />
                </div>
              </div>
              <button
                onClick={handleCreateColumn}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-md"
              >
                <Plus className="w-5 h-5" />
                Create My Column
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-10 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Welcome, {activeStudent.name}</h2>
            <p className="text-slate-500 mt-1">Manage your academic achievements.</p>
          </div>
          <button 
            onClick={() => setActiveStudentSession(null)}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Internship Container */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-50">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Internship Certificates</h3>
                <p className="text-sm text-slate-500">Upload your industry experience proofs</p>
              </div>
            </div>
            <FileUpload 
              label="Upload Document" 
              files={activeStudent.internshipFiles}
              onUpload={(f) => handleStudentUpload('internship', f)}
              onDelete={(n) => handleStudentDeleteFile('internship', n)}
            />
          </div>

          {/* Participation Container */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-50">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Participation Certificates</h3>
                <p className="text-sm text-slate-500">Upload Hackathons, Workshops, Events</p>
              </div>
            </div>
            <FileUpload 
              label="Upload Document" 
              files={activeStudent.participationFiles}
              onUpload={(f) => handleStudentUpload('participation', f)}
              onDelete={(n) => handleStudentDeleteFile('participation', n)}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderSelectedStudentDetails = () => {
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return null;

    return (
      <div className="mt-8 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{student.name}'s Documents</h2>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">{student.studentId}</span>
                <span>•</span>
                <span>Click download icon to save PDF</span>
              </div>
            </div>
            <button 
              onClick={() => setSelectedStudentId(null)}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              Close Details
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Internship Column */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                Internship Certificates
              </h4>
              <div className="grid gap-3">
                {student.internshipFiles.length === 0 && <p className="text-sm text-slate-400 italic py-4 text-center bg-slate-50 rounded-lg">No internship files uploaded.</p>}
                {student.internshipFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200 group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:scale-105 transition-transform">
                         <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 truncate">{file.name}</span>
                    </div>
                    <button 
                      onClick={() => handleDownload(file, student.name, 'Internship')} 
                      className="text-slate-400 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-full transition-colors" 
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Participation Column */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Participation Certificates
              </h4>
              <div className="grid gap-3">
                {student.participationFiles.length === 0 && <p className="text-sm text-slate-400 italic py-4 text-center bg-slate-50 rounded-lg">No participation files uploaded.</p>}
                {student.participationFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all duration-200 group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 group-hover:scale-105 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 truncate">{file.name}</span>
                    </div>
                    <button 
                      onClick={() => handleDownload(file, student.name, 'Participation')} 
                      className="text-slate-400 hover:text-emerald-600 p-2 hover:bg-emerald-50 rounded-full transition-colors" 
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStaffView = () => {
    // Search and Sort Logic
    const filteredAndSortedStudents = students
      .filter(s => {
        const query = searchQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(query) ||
          s.studentId.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        } else {
          // Sort by ID (created timestamp) descending - Newest first
          return b.id.localeCompare(a.id);
        }
      });

    return (
      <div className="max-w-7xl mx-auto px-4 py-8 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Student Portfolios</h2>
            <p className="text-slate-500 mt-1">Review, manage and download student certificates.</p>
          </div>
          
          <button
            onClick={() => setShowStudentList(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white border border-transparent px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg font-bold active:scale-[0.98] transform"
          >
            <List className="w-5 h-5" />
            Click for students uploaded list
          </button>
        </div>

        {/* Search Bar and Sort Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-end md:items-center">
          <div className="w-full md:max-w-lg relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 shadow-sm transition-all"
              placeholder="Search by name or student ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 bg-white p-1.5 border border-slate-200 rounded-xl shadow-sm self-start md:self-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Sort</span>
            <button
              onClick={() => setSortBy('name')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                sortBy === 'name' 
                  ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              Name
            </button>
            <button
              onClick={() => setSortBy('date')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                sortBy === 'date' 
                  ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              Date
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAndSortedStudents.map(student => (
            <div 
              key={student.id}
              onClick={() => setSelectedStudentId(student.id)}
              className={`bg-white rounded-2xl shadow-sm border p-6 cursor-pointer transition-all duration-200 hover:shadow-md relative group ${
                selectedStudentId === student.id ? 'border-blue-500 ring-2 ring-blue-50' : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              {/* Delete Button */}
              <button
                onClick={(e) => handleDeleteStudent(student.id, e)}
                className="absolute top-3 right-3 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                title="Delete Student"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4 mb-4 mt-2">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-100">
                  <UserCircle className="w-8 h-8" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-slate-800 truncate">{student.name}</h3>
                  <p className="text-xs text-slate-500 font-mono truncate">{student.studentId}</p>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-slate-50">
                <div className="flex justify-between text-sm items-center">
                  <span className="text-slate-500">Internships</span>
                  <span className={`font-semibold px-2 py-0.5 rounded-md text-xs ${student.internshipFiles.length > 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-400'}`}>
                    {student.internshipFiles.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-slate-500">Participation</span>
                  <span className={`font-semibold px-2 py-0.5 rounded-md text-xs ${student.participationFiles.length > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'}`}>
                    {student.participationFiles.length}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredAndSortedStudents.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-100">
              <UserCircle className="w-12 h-12 mb-3 text-slate-200" />
              <p className="font-medium text-lg text-slate-500">No students found.</p>
              <p className="text-sm text-slate-400">{students.length === 0 ? "Wait for students to create their columns." : "Try adjusting your search."}</p>
            </div>
          )}
        </div>

        {selectedStudentId && renderSelectedStudentDetails()}
        
        {/* Student List Modal */}
        {showStudentList && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
                <h3 className="font-bold text-lg text-slate-800">All Registered Students</h3>
                <button 
                  onClick={() => setShowStudentList(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="overflow-y-auto flex-1 p-2">
                {students.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <p>No students have registered yet.</p>
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {students
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((student, idx) => (
                      <li key={student.id}>
                        <button
                          onClick={() => {
                            setSelectedStudentId(student.id);
                            setShowStudentList(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl flex items-center gap-3 transition-colors group border border-transparent hover:border-slate-100"
                        >
                          <span className="text-xs font-bold text-slate-300 w-6">{idx + 1}.</span>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{student.name}</p>
                            <p className="text-xs text-slate-500">{student.studentId}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-800">
      {renderHeader()}
      <main className="flex-grow pt-6 pb-20 animate-in fade-in duration-500">
        {role === 'student' ? renderStudentView() : renderStaffView()}
      </main>
      {renderFooter()}
    </div>
  );
};

export default App;