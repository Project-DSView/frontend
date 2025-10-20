// Material types
export interface MaterialCreator {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  is_teacher: boolean;
  profile_img: string;
  created_at: string;
  updated_at: string;
}

export interface Material {
  material_id: string;
  title: string;
  description: string;
  course_id: string;
  week: number;
  type: 'document' | 'video' | 'code_exercise' | 'pdf_exercise';
  submission_type: 'file' | 'code';
  file_name?: string;
  file_size?: number;
  file_url?: string;
  video_url?: string;
  mime_type?: string;
  deadline?: string;
  total_points?: number;
  is_graded?: boolean;
  is_public: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator: MaterialCreator;
  // Exercise-specific fields
  example_inputs?: string[];
  example_outputs?: string[];
  problem_images?: string[];
  problem_statement?: string;
  constraints?: string;
  hints?: string;
}

export interface MaterialsData {
  materials: Material[];
  limit: number;
  offset: number;
  total: number;
}

export interface MaterialsResponse {
  success: boolean;
  message: string;
  data: MaterialsData;
}

export interface MaterialResponse {
  success: boolean;
  message: string;
  data: Material;
}

export interface MaterialsParams {
  limit?: number;
  offset?: number;
}
