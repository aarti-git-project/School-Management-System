import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear auth data and redirect to login
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export const auth = {
  signup: async (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role?: string;
    subjects?: string[];
    grade?: string;
    adminCode?: string;
  }) => {
    try {
      let endpoint = "/auth/signup";

      if (data.role === "teacher") {
        endpoint = "/auth/teacher/signup";
      } else if (data.role === "admin") {
        endpoint = "/auth/admin/signup";
      }

      const response = await api.post(endpoint, data);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("fullName", response.data.user.fullName);
        localStorage.setItem("email", response.data.user.email);
        localStorage.setItem("role", response.data.user.role);
        localStorage.setItem("userId", response.data.user.id);
      }

      return response.data;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  },

  login: async (data: { email: string; password: string; role: string }) => {
    try {
      const response = await api.post("/auth/login", data);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("fullName", response.data.user.fullName);
        localStorage.setItem("email", response.data.user.email);
        localStorage.setItem("role", response.data.user.role);
        localStorage.setItem("userId", response.data.user.id);
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  logout: () => {
    localStorage.clear();
    window.location.href = "/";
  },
};

export const parent = {
  getOverview: async () => {
    try {
      return await api.get("/parent/overview");
    } catch (error) {
      console.error("Error fetching parent overview:", error);
      throw error;
    }
  },

  getChildren: async () => {
    try {
      return await api.get("/parent/children");
    } catch (error) {
      console.error("Error fetching children:", error);
      throw error;
    }
  },

  addChild: async (data: any) => {
    try {
      return await api.post("/parent/children", data);
    } catch (error) {
      console.error("Error adding child:", error);
      throw error;
    }
  },
};

export const teacher = {
  getOverview: async () => {
    try {
      return await api.get("/teacher/overview");
    } catch (error) {
      console.error("Error fetching teacher overview:", error);
      throw error;
    }
  },

  getStudents: async () => {
    try {
      return await api.get("/teacher/students");
    } catch (error) {
      console.error("Error fetching students:", error);
      throw error;
    }
  },

  getParents: async () => {
    try {
      return await api.get("/teacher/parents");
    } catch (error) {
      console.error("Error fetching parents:", error);
      throw error;
    }
  },
};

export const admin = {
  getUsers: async () => {
    try {
      return await api.get("/admin/users");
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  getOverview: async () => {
    try {
      return await api.get("/admin/overview");
    } catch (error) {
      console.error("Error fetching admin overview:", error);
      throw error;
    }
  },

  updateTeacherStatus: async (teacherId: string, status: string) => {
    try {
      return await api.post(`/admin/teachers/${teacherId}/status`, { status });
    } catch (error) {
      console.error("Error updating teacher status:", error);
      throw error;
    }
  },

  assignTeachers: async (data: any) => {
    try {
      return await api.post("/admin/assign-teachers", data);
    } catch (error) {
      console.error("Error assigning teachers:", error);
      throw error;
    }
  },
};

export const assignments = {
  getAll: async () => {
    return await api.get("/assignments");
  },
  create: async (assignmentData: any) => {
    return await api.post("/assignments", assignmentData);
  },
  submit: async (submissionData: any) => {
    return await api.post("/assignments/submit", submissionData);
  },
  grade: async (submissionId: string, gradingData: any) => {
    return await api.post(`/assignments/grade/${submissionId}`, gradingData);
  },
};

export const messages = {
  send: async (data: {
    subject: string;
    content: string;
    type: "individual" | "class" | "announcement";
    recipients?: string[];
    grade?: string;
  }) => {
    try {
      return await api.post("/messages", data);
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  getAll: async (type?: string) => {
    try {
      return await api.get("/messages", {
        params: { type },
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  },

  markAsRead: async (messageId: string) => {
    try {
      return await api.post(`/messages/${messageId}/read`);
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw error;
    }
  },
};

export const grades = {
  create: async (data: {
    testTitle: string;
    subject: string;
    grade: string;
    score: number;
    studentId: string;
    comments?: string;
  }) => {
    try {
      return await api.post("/grades", data);
    } catch (error) {
      console.error("Error creating grade:", error);
      throw error;
    }
  },

  getAll: async () => {
    try {
      return await api.get("/grades");
    } catch (error) {
      console.error("Error fetching grades:", error);
      throw error;
    }
  },
};

export const submissions = {
  submit: async (submissionData: any) => {
    return await api.post("/assignments/submit", submissionData);
  },
  grade: async (submissionId: string, gradingData: any) => {
    return await api.post(`/assignments/grade/${submissionId}`, gradingData);
  },
};

export default api;
