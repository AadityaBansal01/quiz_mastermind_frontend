// src/utils/api.ts

const API_BASE_URL = "https://quiz-mastermind-backend.onrender.com/api";

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('mathquiz_token');
};

// Helper function to create headers
export const getHeaders = (
  includeAuth = true,
  isMultipart = false
) => {
  const headers: Record<string, string> = {};

  // ❗ Only set JSON header if NOT multipart
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};


// Handle API responses
const handleResponse = async (response: Response) => {
  let data: any = {};

  try {
    data = await response.json();
  } catch {
    // response has no body (PUT/204/etc)
    data = {};
  }

 if (!response.ok) {
  const message =
    data?.message ||
    `Request failed with status ${response.status}`;
  throw {
    response: { data: { message } },
  };
}


  return { data };
};


// ============================================
// AUTH ENDPOINTS
// ============================================

export const authAPI = {
  // Register new user
  register: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Login user
  login: async (credentials: { email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(false),
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

// Send OTP
sendOtp: async (data: { email?: string; mobile?: string; method: "email" | "mobile" }) => {
  const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
},

// Verify OTP
verifyOtp: async (data: { email?: string; mobile?: string; otp: string }) => {
  const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
},





  // Get current user profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },


// Update user profile
updateProfile: async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
},


  // Logout
  logout: () => {
    localStorage.removeItem('mathquiz_token');
    localStorage.removeItem('mathquiz_user');
  },


// Change password
changePassword: async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
},





  
  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('mathquiz_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
  },
};

// ============================================
// ADMIN ENDPOINTS
// ============================================

export const adminAPI = {




  
// Update questions inside a quiz
updateQuizQuestions: async (quizId: string, questionIds: string[]) => {
  const response = await fetch(`${API_BASE_URL}/admin/quiz/${quizId}/questions`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ questions: questionIds }),
  });
  return handleResponse(response);
},




getStudentById: async (id: string) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/student/${id}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
  return handleResponse(response);
},

toggleStudentStatus: async (id: string) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/student/${id}/toggle`,
    {
      method: "PUT",
      headers: getHeaders(),
    }
  );
  return handleResponse(response);
},



// ===============================
// QOD MANAGER (ADMIN)
// ===============================

// Update scheduled QOD
updateQOD: async (id: string, data: {
  date: string;
  questionId: string;
  class: number;
}) => {
  const response = await fetch(
    `${API_BASE_URL}/qod-manager/${id}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );
  return handleResponse(response);
},

// Delete scheduled QOD
deleteQODSchedule: async (id: string) => {
  const response = await fetch(
    `${API_BASE_URL}/qod-manager/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );
  return handleResponse(response);
},





getQODScheduleList: async () => {
  const response = await fetch(
    `${API_BASE_URL}/qod-manager/list`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
  return handleResponse(response);
},

assignQOD: async (data: {
  date: string;
  questionId: string;
  class: number;
}) => {
  const response = await fetch(
    `${API_BASE_URL}/qod-manager/assign`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );
  return handleResponse(response);
},



  // Create question
  createQuestion: async (questionData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/question/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(questionData),
    });
    return handleResponse(response);
  },

  // Get all questions
 getQuestions: async (filters: any = {}) => {
  const cleanedFilters: Record<string, string> = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "all"
    ) {
      cleanedFilters[key] = String(value);
    }
  });

  const query = new URLSearchParams(cleanedFilters).toString();

  const response = await fetch(
    `${API_BASE_URL}/admin/questions${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
},


// Delete student
deleteStudent: async (studentId: string) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/student/${studentId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );
  return handleResponse(response);
},


// Get single question by ID
getQuestionById: async (questionId: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/question/${questionId}`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
},

  // Update question
  updateQuestion: async (questionId: string, questionData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/question/${questionId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(questionData),
    });
    return handleResponse(response);
  },

  // Delete question
  deleteQuestion: async (questionId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/question/${questionId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Create quiz
  createQuiz: async (quizData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/quiz/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(quizData),
    });
    return handleResponse(response);
  },

  // Get all quizzes (admin)
  getQuizzes: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/quizzes`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

// Get single quiz by ID
getQuizById: async (quizId: string) => {
  const response = await fetch(`${API_BASE_URL}/admin/quiz/${quizId}`, {
    method: 'GET',
    headers: getHeaders(),
  });
  return handleResponse(response);
},





  // Update quiz
  updateQuiz: async (quizId: string, quizData: any) => {
    const response = await fetch(`${API_BASE_URL}/admin/quiz/${quizId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(quizData),
    });
    return handleResponse(response);
  },

  // Delete quiz
  deleteQuiz: async (quizId: string) => {
    const response = await fetch(`${API_BASE_URL}/admin/quiz/${quizId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get analytics
  getAnalytics: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get all students
  getStudents: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/students`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};


// ============================================
// PYQ ENDPOINTS (Admin / Student)
// ============================================

export const pyqAPI = {
  // Admin: get all PYQs
  getAllForAdmin: async () => {
    const response = await fetch(`${API_BASE_URL}/pyqs/admin`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Admin: upload PYQ
  upload: async (data: FormData) => {
    const response = await fetch(`${API_BASE_URL}/pyqs/upload`, {
      method: "POST",
      headers: getHeaders(true, true), // multipart
      body: data,
    });
    return handleResponse(response);
  },

  // Student: get PYQs
  getForStudent: async () => {
    const response = await fetch(`${API_BASE_URL}/pyqs/student`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};



// ============================================
// QUIZ ENDPOINTS (Student)
// ============================================

export const quizAPI = {
  // Get quizzes for a class
  getQuizzesByClass: async (classNumber: number) => {
    const response = await fetch(`${API_BASE_URL}/quiz/list/${classNumber}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },



  
// Get single quiz by ID (Student)
getQuizById: async (quizId: string) => {
  const response = await fetch(
    `${API_BASE_URL}/quiz/${quizId}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
  return handleResponse(response);
},

// Get logged-in student's quiz attempts
getMyAttempts: async (limit = 5) => {
  const response = await fetch(
    `${API_BASE_URL}/quiz/my-attempts?limit=${limit}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
  return handleResponse(response);
},



// Get practice questions for student
getPracticeQuestions: async (classNumber: number) => {
  const response = await fetch(
    `${API_BASE_URL}/quiz/practice/${classNumber}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
  return handleResponse(response);
},

 // ✅ OPTION 3 — PRACTICE ATTEMPT SAVE
  savePracticeAttempt: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/practice/attempt`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

// Get practice analytics summary (Option D)
getPracticeSummary: async () => {
  const response = await fetch(
    `${API_BASE_URL}/practice/my-summary`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
  return handleResponse(response);
},




  submitQuiz: async (quizData: any) => {
    const response = await fetch(`${API_BASE_URL}/quiz/submit`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(quizData),
    });
    return handleResponse(response);
  },

  getQuizResult: async (attemptId: string) => {
    const response = await fetch(`${API_BASE_URL}/quiz/result/${attemptId}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};
  
 



// ============================================
// QOD ENDPOINTS
// ============================================

export const qodAPI = {
  // Get today's QOD
  getTodayQOD: async (classNumber: number) => {
    const response = await fetch(`${API_BASE_URL}/qod/today/${classNumber}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Submit QOD answer
  submitQOD: async (answerData: any) => {
    const response = await fetch(`${API_BASE_URL}/qod/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(answerData),
    });
    return handleResponse(response);
  },

  // Get QOD history
  getQODHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/qod/history`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get QOD stats
  getQODStats: async () => {
    const response = await fetch(`${API_BASE_URL}/qod/stats`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};


// ============================================
// COTD ENDPOINTS (Concept of the Day)
// ============================================

export const cotdAPI = {
  // Get today's Concept of the Day
  getTodayConcept: async (classNumber: number) => {
    const response = await fetch(`${API_BASE_URL}/cotd/today/${classNumber}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get Concept History
  getConceptHistory: async (classNumber: number) => {
    const response = await fetch(`${API_BASE_URL}/cotd/history/${classNumber}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Create concept (Admin)
  createConcept: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/cotd/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Get all concepts (Admin)
  getAllConcepts: async () => {
    const response = await fetch(`${API_BASE_URL}/cotd/all`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Update concept (Admin)
  updateConcept: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/cotd/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Delete concept (Admin)
  deleteConcept: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/cotd/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// ============================================
// FORMULA SHEETS API
// ============================================
export const formulaAPI = {
  // Admin
  upload: async (data: FormData) => {
    const res = await fetch(`${API_BASE_URL}/formulas/upload`, {
      method: "POST",
      headers: getHeaders(true, true), // auth + multipart
      body: data,
    });
    return handleResponse(res);
  },

  getAllForAdmin: async () => {
    const res = await fetch(`${API_BASE_URL}/formulas/admin`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/formulas/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Student
  getForStudent: async () => {
    const res = await fetch(`${API_BASE_URL}/formulas/student`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export const bookAPI = {
  upload: async (data: FormData) => {
    const res = await fetch(`${API_BASE_URL}/books/upload`, {
      method: "POST",
      headers: getHeaders(true, true),
      body: data,
    });
    return handleResponse(res);
  },

  getAllForAdmin: async () => {
    const res = await fetch(`${API_BASE_URL}/books/admin`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getForStudent: async () => {
    const res = await fetch(`${API_BASE_URL}/books/student`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

 delete: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },



};


export const importantLetterAPI = {
  upload: async (data: FormData) => {
    const res = await fetch(
      "http://localhost:5000/api/important-letters/upload",
      {
        method: "POST",
        headers: getHeaders(true, true),
        body: data,
      }
    );
    return handleResponse(res);
  },

  getAllForAdmin: async () => {
    const res = await fetch(
      "http://localhost:5000/api/important-letters/admin",
      {
        headers: getHeaders(),
      }
    );
    return handleResponse(res);
  },

  getForStudent: async () => {
    const res = await fetch(
      "http://localhost:5000/api/important-letters/student",
      {
        headers: getHeaders(),
      }
    );
    return handleResponse(res);
  },

  delete: async (id: string) => {
    const res = await fetch(
      `http://localhost:5000/api/important-letters/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );
    return handleResponse(res);
  },
};

export const paperStructureAPI = {
upload: async (data: FormData) => {
  const res = await fetch(
    "http://localhost:5000/api/paper-structure/create",
    {
      method: "POST",
      headers: getHeaders(true, true),
      body: data,
    }
  );
  return handleResponse(res);
},

  getAllForAdmin: async () => {
    const res = await fetch(
      "http://localhost:5000/api/paper-structure/admin",
      {
        headers: getHeaders(),
      }
    );
    return handleResponse(res);
  },

  delete: async (id: string) => {
    const res = await fetch(
      `http://localhost:5000/api/paper-structure/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );
    return handleResponse(res);
  },

  getForStudent: async () => {
    const res = await fetch(
      "http://localhost:5000/api/paper-structure/student",
      {
        headers: getHeaders(),
      }
    );
    return handleResponse(res);
  },
};




// ============================================
// MODEL TEST PAPERS API
// ============================================

export const modelPaperAPI = {
  // ================= ADMIN =================

  upload: async (data: FormData) => {
    const res = await fetch(
      "http://localhost:5000/api/model-papers/create",
      {
        method: "POST",
        headers: getHeaders(true, true), // auth + multipart
        body: data,
      }
    );
    return handleResponse(res);
  },

  getAllForAdmin: async () => {
    const res = await fetch(
      "http://localhost:5000/api/model-papers/admin",
      {
        headers: getHeaders(),
      }
    );
    return handleResponse(res);
  },

 delete: async (id: string) => {
  const res = await fetch(
    `http://localhost:5000/api/model-papers/admin/${id}`, // ✅
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );
  return handleResponse(res);
},

  // ================= STUDENT =================

  getForStudent: async () => {
    const res = await fetch(
      "http://localhost:5000/api/model-papers/student",
      {
        headers: getHeaders(),
      }
    );
    return handleResponse(res);
  },
};


// ============================================
// BOOKMARKS API (Student)
// ============================================

export const bookmarkAPI = {
  // Toggle PYQ bookmark
  togglePYQ: async (id: string) => {
    const res = await fetch(
      `${API_BASE_URL}/bookmarks/pyq/${id}`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );
    return handleResponse(res);
  },

  // Toggle Model Test Paper bookmark
  toggleModelTest: async (id: string) => {
    const res = await fetch(
      `${API_BASE_URL}/bookmarks/model-test/${id}`,
      {
        method: "POST",
        headers: getHeaders(),
      }
    );
    return handleResponse(res);
  },

  // Get all bookmarks of logged-in student
  getAll: async () => {
    const res = await fetch(
      `${API_BASE_URL}/bookmarks`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    return handleResponse(res);
  },
};



// Export all APIs
export default {
  auth: authAPI,
  admin: adminAPI,
  quiz: quizAPI,
  qod: qodAPI,
  cotd: cotdAPI,
};