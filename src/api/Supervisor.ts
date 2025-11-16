import api from './api';

export interface SupervisorTeamMember {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  teamProducts: string;
  teamArea: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface SupervisorInfo {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  teamProducts: string;
  teamArea: string;
}

export interface SupervisorTeamResponse {
  success: boolean;
  data: {
    supervisor: SupervisorInfo;
    team: {
      members: SupervisorTeamMember[];
      totalCount: number;
      summary: {
        totalMembers: number;
        roles: Record<string, number>;
      };
    };
  };
  message: string;
}

export const getSupervisorTeam = async (supervisorId: string): Promise<SupervisorTeamResponse> => {
  try {
    const response = await api.get(`/supervisor/${supervisorId}/team`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching supervisor team:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch supervisor team');
  }
};