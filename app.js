class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-black"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  try {
    const [selectedSemester, setSelectedSemester] = React.useState('Semester I');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedCourse, setSelectedCourse] = React.useState(null);
    const [showQuestionPapers, setShowQuestionPapers] = React.useState(false);
    const [selectedQuestionPaperSemester, setSelectedQuestionPaperSemester] = React.useState(null);
    
    const allCourses = curriculumData.getAllCourses();
    
    // Make handleCourseDetails globally available
    window.handleCourseDetails = (course) => {
      setSelectedCourse(course);
    };
    
    const handleBackToCourses = () => {
      setSelectedCourse(null);
    };

    const handleQuestionPapersClick = () => {
      setShowQuestionPapers(true);
      setSelectedCourse(null);
      setSelectedQuestionPaperSemester(null);
    };

    const handleBackFromQuestionPapers = () => {
      setShowQuestionPapers(false);
      setSelectedQuestionPaperSemester(null);
    };

    const handleShowQuestionPapersForSemester = (semester) => {
      setSelectedQuestionPaperSemester(semester);
    };

    const handleBackFromQuestionPapersYear = () => {
      setSelectedQuestionPaperSemester(null);
    };

    // Make the semester navigation function globally available
    window.showQuestionPapersForSemester = handleShowQuestionPapersForSemester;
    
    const filteredCourses = React.useMemo(() => {
      let courses;
      
      if (searchTerm) {
        // Search across all courses when user is searching
        courses = allCourses.filter(course =>
          course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.type.toLowerCase().includes(searchTerm.toLowerCase())
        );
      } else {
        // Show selected semester courses when not searching
        courses = curriculumData.getCoursesBySemester(selectedSemester);
      }
      
      return courses;
    }, [selectedSemester, searchTerm, allCourses]);
    
    const categorizedCourses = React.useMemo(() => {
      const theory = filteredCourses.filter(course => course.type === 'Theory');
      const lab = filteredCourses.filter(course => course.type === 'Lab');
      const electiveI = filteredCourses.filter(course => course.type === 'Elective I');
      const electiveII = filteredCourses.filter(course => course.type === 'Elective II');
      const electiveIII = filteredCourses.filter(course => course.type === 'Elective III');
      const electiveIV = filteredCourses.filter(course => course.type === 'Elective IV');
      const project = filteredCourses.filter(course => course.type === 'Project');
      return { theory, lab, electiveI, electiveII, electiveIII, electiveIV, project };
    }, [filteredCourses]);
    
    if (selectedCourse) {
      return (
        <CourseDetailPage 
          course={selectedCourse} 
          onBack={handleBackToCourses}
        />
      );
    }

    if (showQuestionPapers && selectedQuestionPaperSemester) {
      return (
        <QuestionPapersYear 
          selectedSemester={selectedQuestionPaperSemester}
          onBack={handleBackFromQuestionPapersYear}
        />
      );
    }

    if (showQuestionPapers) {
      return (
        <QuestionPapers 
          onBack={handleBackFromQuestionPapers}
        />
      );
    }
    
    return (
      <div className="min-h-screen bg-[#f0f0f0]" data-name="app" data-file="app.js">
        <Header 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedSemester={selectedSemester}
          onSemesterChange={setSelectedSemester}
          onQuestionPapersClick={handleQuestionPapersClick}
        />
        
        <main className="max-w-6xl mx-auto p-6">
          <ProgressStats 
            courses={allCourses}
            selectedSemester={selectedSemester}
          />
          
          {searchTerm && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-black mb-2">
                Search results for "{searchTerm}"
              </h2>
              <p className="text-gray-600">
                {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found across all semesters
              </p>
            </div>
          )}
          
          {!searchTerm && (
            <div className="mb-6">
              <h2 className="text-2xl font-black text-black mb-2">{selectedSemester}</h2>
              <p className="text-gray-600">
                Explore {filteredCourses.length} courses organized by categories
              </p>
            </div>
          )}
          
          {searchTerm ? (
            filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <CourseCard key={course.code} course={course} onViewDetails={setSelectedCourse} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] flex items-center justify-center mx-auto mb-4">
                  <div className="icon-search text-xl text-gray-400"></div>
                </div>
                <h3 className="text-lg font-bold text-black mb-2">No courses found</h3>
                <p className="text-gray-600">Try searching with different keywords</p>
              </div>
            )
          ) : (
            <div>
              <CategorySection 
                title="Theory Courses" 
                courses={categorizedCourses.theory} 
                icon="book-open" 
                color="bg-blue-500" 
              />
              <CategorySection 
                title="Laboratory Courses" 
                courses={categorizedCourses.lab} 
                icon="flask-conical" 
                color="bg-green-500" 
              />
              {selectedSemester === 'Semester II' && (
                <>
                  <CategorySection 
                    title="Elective I" 
                    courses={categorizedCourses.electiveI} 
                    icon="layers" 
                    color="bg-yellow-500" 
                  />
                  <CategorySection 
                    title="Elective II" 
                    courses={categorizedCourses.electiveII} 
                    icon="layers" 
                    color="bg-yellow-500" 
                  />
                </>
              )}
              {selectedSemester === 'Semester III' && (
                <>
                  <CategorySection 
                    title="Elective III" 
                    courses={categorizedCourses.electiveIII} 
                    icon="layers" 
                    color="bg-yellow-500" 
                  />
              <CategorySection 
                    title="Elective IV" 
                    courses={categorizedCourses.electiveIV} 
                icon="layers" 
                color="bg-yellow-500" 
              />
                </>
              )}
              <CategorySection 
                title="Project Work" 
                courses={categorizedCourses.project} 
                icon="folder-open" 
                color="bg-purple-500" 
              />
            </div>
          )}
        </main>
        
        <footer className="bg-[#f0f0f0] border-t-3 border-black mt-16 py-8">
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-white rounded-xl p-6 border-3 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] flex items-center justify-center">
                    <div className="icon-user text-2xl text-white"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-black">Maintainer</h3>
                    <p className="text-gray-600 font-bold">Built with ❤️ for MCA Students</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gray-900 hover:bg-gray-700 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] flex items-center justify-center transition-all"
                  >
                    <div className="icon-github text-white text-lg"></div>
                  </a>
                  
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] flex items-center justify-center transition-all"
                  >
                    <div className="icon-linkedin text-white text-lg"></div>
                  </a>
                  
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-sky-500 hover:bg-sky-400 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] flex items-center justify-center transition-all"
                  >
                    <div className="icon-twitter text-white text-lg"></div>
                  </a>
                  
                  <a
                    href="mailto:maintainer@example.com"
                    className="w-12 h-12 bg-green-600 hover:bg-green-500 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] flex items-center justify-center transition-all"
                  >
                    <div className="icon-mail text-white text-lg"></div>
                  </a>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t-2 border-gray-200 text-center">
                <p className="text-gray-600 font-bold">
                  © 2024 MCA Curriculum Tracker. Made for students, by students.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-black"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);