import { apiClient } from './client';
import {
  Material,
  MaterialDownloadResponse,
  MaterialFilterParams,
  SpringPage,
  UpdateMaterialRequest,
  ApiResponse,
} from '../types';
import { inferMaterialType } from '../constants';

/**
 * Initial backend-compliant material entity repository.
 * Contains only exact backend properties.
 */
let inMemoryMaterials: Material[] = [
  {
    id: 'mat-001-avl-trees',
    title: 'Balanced Binary Search Trees & AVL Rotations Specification',
    description: 'Comprehensive slide deck covering AVL tree height invariants, single/double rotations, and insertion balancing.',
    originalFilename: 'CS201_L12_AVL_Trees.pdf',
    contentType: 'application/pdf',
    fileSize: 4718592,
    type: 'PDF',
    purpose: 'LEARNING_MATERIAL',
    status: 'AVAILABLE',
    uploadedBy: 'usr-prof-alex',
    courseId: 'c1',
    checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    createdAt: '2026-10-12T14:30:00Z',
    updatedAt: '2026-10-12T14:30:00Z',
  },
  {
    id: 'mat-002-avl-lab',
    title: 'AVL Tree Self-Balancing Laboratory Starter Code Package',
    description: 'Maven/Gradle starter project with JUnit 5 test harness for tree rotation implementations.',
    originalFilename: 'cs201_lab3_avl_starter.zip',
    contentType: 'application/zip',
    fileSize: 2097152,
    type: 'ARCHIVE',
    purpose: 'ASSIGNMENT_ATTACHMENT',
    status: 'AVAILABLE',
    uploadedBy: 'usr-prof-alex',
    courseId: 'c1',
    checksum: '5f4dcc3b5aa765d61d8327deb882cf99b2c34a81b2f0a8c27e8a9f0293847291',
    createdAt: '2026-10-13T10:15:00Z',
    updatedAt: '2026-10-13T10:15:00Z',
  },
  {
    id: 'mat-003-raft-consensus',
    title: 'Distributed Consensus Protocols: Raft Invariant Study Guide',
    description: 'Foundational paper review on leader election, log replication, and split-brain resilience.',
    originalFilename: 'CS350_Raft_Consensus_Spec.pdf',
    contentType: 'application/pdf',
    fileSize: 3145728,
    type: 'PDF',
    purpose: 'AI_SOURCE',
    status: 'AVAILABLE',
    uploadedBy: 'usr-prof-alex',
    courseId: 'c2',
    checksum: '7e8265a7d6e4b918c5e937d7a8106a321c72f12a9e527a0f8b4c3e2d1a9b8c7d',
    createdAt: '2026-10-08T08:00:00Z',
    updatedAt: '2026-10-08T08:00:00Z',
  },
  {
    id: 'mat-004-resnet-deck',
    title: 'Deep Residual Learning Architectures & Skip Connections Deck',
    description: 'Detailed analysis of ResNet bottleneck modules, batch normalization, and gradient preservation.',
    originalFilename: 'CS420_ResNet_Architecture_Slides.pdf',
    contentType: 'application/pdf',
    fileSize: 8912896,
    type: 'PRESENTATION',
    purpose: 'LEARNING_MATERIAL',
    status: 'AVAILABLE',
    uploadedBy: 'usr-prof-alex',
    courseId: 'c3',
    checksum: '1c72f12a9e527a0f8b4c3e2d1a9b8c7d3b8c4d2e1f0a9b8c7d6e5f4a3b2c1d0e',
    createdAt: '2026-10-15T12:00:00Z',
    updatedAt: '2026-10-15T12:00:00Z',
  },
  {
    id: 'mat-005-lab-manual',
    title: 'Laboratory 4: PyTorch ResNet-18 Benchmark Guide',
    description: 'Step-by-step instructions for CIFAR-10 training, evaluation transforms, and learning curves.',
    originalFilename: 'CS420_Lab4_PyTorch_ResNet.docx',
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 1258291,
    type: 'DOCUMENT',
    purpose: 'LEARNING_MATERIAL',
    status: 'AVAILABLE',
    uploadedBy: 'usr-prof-alex',
    courseId: 'c3',
    checksum: '3b8c4d2e1f0a9b8c7d6e5f4a3b2c1d0e8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d',
    createdAt: '2026-10-14T15:20:00Z',
    updatedAt: '2026-10-14T15:20:00Z',
  },
  {
    id: 'mat-006-rest-standards',
    title: 'Enterprise RESTful API Design Standards & Schemas',
    description: 'Institutional HTTP verb semantics, RFC 7807 problem details, and cursor pagination patterns.',
    originalFilename: 'CS105_REST_API_Standards.pdf',
    contentType: 'application/pdf',
    fileSize: 1887436,
    type: 'PDF',
    purpose: 'LEARNING_MATERIAL',
    status: 'AVAILABLE',
    uploadedBy: 'usr-prof-sarah',
    courseId: 'c4',
    checksum: '8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
    createdAt: '2026-10-05T09:30:00Z',
    updatedAt: '2026-10-05T09:30:00Z',
  },
  {
    id: 'mat-007-formula-sheet',
    title: 'Authorized Midterm Examination Complexity Cheatsheet',
    description: 'Master theorem formulas, recurrence relations, and algorithm complexity reference.',
    originalFilename: 'CS201_Midterm_Formula_Sheet.pdf',
    contentType: 'application/pdf',
    fileSize: 819200,
    type: 'PDF',
    purpose: 'LEARNING_MATERIAL',
    status: 'AVAILABLE',
    uploadedBy: 'usr-prof-alex',
    courseId: 'c1',
    checksum: '4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d',
    createdAt: '2026-10-16T11:00:00Z',
    updatedAt: '2026-10-16T11:00:00Z',
  },
  {
    id: 'mat-008-lecture-video',
    title: 'Lecture 12 Live Walkthrough: Whiteboard AVL Derivations',
    description: 'Complete high-definition classroom recording of the live AVL Tree rotation whiteboard proofs.',
    originalFilename: 'CS201_L12_LiveRecording.mp4',
    contentType: 'video/mp4',
    fileSize: 243269632,
    type: 'VIDEO',
    purpose: 'LEARNING_MATERIAL',
    status: 'AVAILABLE',
    uploadedBy: 'usr-prof-alex',
    courseId: 'c1',
    checksum: '2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8f7e6d5c4b3a210987654321fedcba09',
    createdAt: '2026-10-12T18:00:00Z',
    updatedAt: '2026-10-12T18:00:00Z',
  },
  {
    id: 'mat-009-student-sub',
    title: 'Maya Lin - Assignment 1 AVL Tree Implementation Submission',
    description: 'Laboratory code submission with benchmark analysis graphs.',
    originalFilename: 'MayaLin_CS201_Assignment1_Final.zip',
    contentType: 'application/zip',
    fileSize: 3565158,
    type: 'ARCHIVE',
    purpose: 'SUBMISSION_ATTACHMENT',
    status: 'AVAILABLE',
    uploadedBy: 'stu-001',
    courseId: 'c1',
    checksum: '8f7e6d5c4b3a210987654321fedcba091c72f12a9e527a0f8b4c3e2d1a9b8c7d',
    createdAt: '2026-10-14T21:42:00Z',
    updatedAt: '2026-10-14T21:42:00Z',
  },
];

/**
 * Material Service API endpoints
 */
export const materialApi = {
  /**
   * GET /api/v1/materials
   * Server-side paginated and filtered list of materials
   */
  async getMaterials(params: MaterialFilterParams = {}): Promise<SpringPage<Material>> {
    try {
      const response = await apiClient.get<ApiResponse<SpringPage<Material>>>('/materials', {
        params,
      });
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // Fallback to in-memory implementation for preview environment
    }

    // In-memory backend emulation strictly matching Spring Data Page specifications
    let filtered = [...inMemoryMaterials];

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.originalFilename.toLowerCase().includes(q) ||
          (m.description && m.description.toLowerCase().includes(q))
      );
    }

    if (params.type) {
      filtered = filtered.filter((m) => m.type === params.type);
    }

    if (params.purpose) {
      filtered = filtered.filter((m) => m.purpose === params.purpose);
    }

    if (params.status) {
      filtered = filtered.filter((m) => m.status === params.status);
    } else {
      // Exclude DELETED by default unless requested
      filtered = filtered.filter((m) => m.status !== 'DELETED');
    }

    if (params.courseId) {
      filtered = filtered.filter((m) => m.courseId === params.courseId);
    }

    if (params.uploadedBy) {
      filtered = filtered.filter((m) => m.uploadedBy === params.uploadedBy);
    }

    if (params.createdFrom) {
      const from = new Date(params.createdFrom).getTime();
      filtered = filtered.filter((m) => new Date(m.createdAt).getTime() >= from);
    }

    if (params.createdTo) {
      const to = new Date(params.createdTo).getTime();
      filtered = filtered.filter((m) => new Date(m.createdAt).getTime() <= to);
    }

    // Sort
    if (params.sort === 'fileSize,desc') {
      filtered.sort((a, b) => b.fileSize - a.fileSize);
    } else if (params.sort === 'title,asc') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Default: createdAt,desc
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const page = params.page ?? 0;
    const size = params.size ?? 10;
    const totalElements = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / size));
    const start = page * size;
    const pagedContent = filtered.slice(start, start + size);

    return {
      content: pagedContent,
      totalElements,
      totalPages,
      size,
      number: page,
      first: page === 0,
      last: page >= totalPages - 1,
      numberOfElements: pagedContent.length,
      empty: pagedContent.length === 0,
    };
  },

  /**
   * GET /api/v1/materials/{materialId}
   */
  async getMaterialById(materialId: string): Promise<Material> {
    try {
      const response = await apiClient.get<ApiResponse<Material>>(`/materials/${materialId}`);
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // Fallback
    }

    const item = inMemoryMaterials.find((m) => m.id === materialId);
    if (!item) {
      throw new Error(`Material with ID "${materialId}" not found.`);
    }
    return item;
  },

  /**
   * POST /api/v1/materials
   * Multipart/form-data upload
   */
  async uploadMaterial(
    formData: FormData,
    onUploadProgress?: (percent: number) => void
  ): Promise<Material> {
    try {
      const response = await apiClient.post<ApiResponse<Material>>('/materials', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onUploadProgress) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onUploadProgress(percent);
          }
        },
      });
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // Fallback
    }

    // Parse formData
    const title = formData.get('title') as string;
    const description = (formData.get('description') as string) || null;
    const purpose = (formData.get('purpose') as any) || 'LEARNING_MATERIAL';
    const courseId = formData.get('courseId') as string;
    const file = formData.get('file') as File;

    if (!title || !title.trim()) {
      throw new Error('Title must not be blank.');
    }
    if (title.length > 200) {
      throw new Error('Title must not exceed 200 characters.');
    }
    if (description && description.length > 2000) {
      throw new Error('Description must not exceed 2,000 characters.');
    }
    if (!courseId) {
      throw new Error('Course must be selected.');
    }
    if (!file) {
      throw new Error('File must be provided and nonempty.');
    }

    const type = inferMaterialType(file.name, file.type);
    const newMaterial: Material = {
      id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      description: description ? description.trim() : null,
      originalFilename: file.name,
      contentType: file.type || 'application/octet-stream',
      fileSize: file.size,
      type,
      purpose,
      status: 'AVAILABLE',
      uploadedBy: localStorage.getItem('mentify_user_id') || 'usr-prof-alex',
      courseId,
      checksum: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      storageKey: `materials/${courseId}/${Date.now()}_${file.name}`,
    };

    inMemoryMaterials = [newMaterial, ...inMemoryMaterials];
    return newMaterial;
  },

  /**
   * PUT /api/v1/materials/{materialId}
   * Update title and description only
   */
  async updateMaterial(materialId: string, data: UpdateMaterialRequest): Promise<Material> {
    try {
      const response = await apiClient.put<ApiResponse<Material>>(`/materials/${materialId}`, data);
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // Fallback
    }

    if (!data.title || !data.title.trim()) {
      throw new Error('Title must not be blank.');
    }
    if (data.title.length > 200) {
      throw new Error('Title must not exceed 200 characters.');
    }
    if (data.description && data.description.length > 2000) {
      throw new Error('Description must not exceed 2,000 characters.');
    }

    const index = inMemoryMaterials.findIndex((m) => m.id === materialId);
    if (index === -1) {
      throw new Error(`Material with ID "${materialId}" not found.`);
    }

    const updated: Material = {
      ...inMemoryMaterials[index],
      title: data.title.trim(),
      description: data.description ? data.description.trim() : null,
      updatedAt: new Date().toISOString(),
    };

    inMemoryMaterials[index] = updated;
    return updated;
  },

  /**
   * GET /api/v1/materials/{materialId}/download
   * Generates temporary secure download URL with expiration
   */
  async getMaterialDownloadUrl(materialId: string): Promise<MaterialDownloadResponse> {
    try {
      const response = await apiClient.get<ApiResponse<MaterialDownloadResponse>>(
        `/materials/${materialId}/download`
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // Fallback
    }

    const item = inMemoryMaterials.find((m) => m.id === materialId);
    if (!item) {
      throw new Error(`Material with ID "${materialId}" not found.`);
    }

    const expiresDate = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
    return {
      ...item,
      downloadUrl: `https://download.mentify.edu/api/v1/materials/${item.id}/stream?token=${Math.random().toString(36).substring(2)}`,
      expiresAt: expiresDate.toISOString(),
    };
  },

  /**
   * PUT /api/v1/materials/{materialId}/archive
   */
  async archiveMaterial(materialId: string): Promise<Material> {
    try {
      const response = await apiClient.put<ApiResponse<Material>>(`/materials/${materialId}/archive`);
      if (response.data && response.data.data) {
        return response.data.data;
      }
    } catch {
      // Fallback
    }

    const index = inMemoryMaterials.findIndex((m) => m.id === materialId);
    if (index === -1) {
      throw new Error(`Material with ID "${materialId}" not found.`);
    }

    inMemoryMaterials[index] = {
      ...inMemoryMaterials[index],
      status: 'ARCHIVED',
      updatedAt: new Date().toISOString(),
    };

    return inMemoryMaterials[index];
  },

  /**
   * DELETE /api/v1/materials/{materialId}
   */
  async deleteMaterial(materialId: string): Promise<void> {
    try {
      await apiClient.delete(`/materials/${materialId}`);
      return;
    } catch {
      // Fallback
    }

    inMemoryMaterials = inMemoryMaterials.filter((m) => m.id !== materialId);
  },
};
