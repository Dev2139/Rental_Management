import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface RentalRequest {
  id: string;
  property_id: string;
  tenant_id: string;
  owner_id: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string | null;
  move_in_date: string | null;
  created_at: string;
  updated_at: string;
  property?: {
    title: string;
    address: string;
    city: string;
    rent: number;
    images: string[] | null;
  };
  tenant?: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

export const useTenantRequests = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tenant-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('rental_requests')
        .select(`
          *,
          property:properties(title, address, city, rent, images)
        `)
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RentalRequest[];
    },
    enabled: !!user,
  });
};

export const useOwnerRequests = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['owner-requests', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: requests, error } = await supabase
        .from('rental_requests')
        .select(`
          *,
          property:properties(title, address, city, rent, images)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch tenant profiles separately
      const tenantIds = [...new Set(requests?.map(r => r.tenant_id) || [])];
      
      if (tenantIds.length === 0) return requests as RentalRequest[];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, phone')
        .in('user_id', tenantIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      return requests?.map(request => ({
        ...request,
        tenant: profileMap.get(request.tenant_id) || null,
      })) as RentalRequest[];
    },
    enabled: !!user,
  });
};

export const useCreateRentalRequest = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ propertyId, ownerId, message, moveInDate }: {
      propertyId: string;
      ownerId: string;
      message?: string;
      moveInDate?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('rental_requests')
        .insert({
          property_id: propertyId,
          tenant_id: user.id,
          owner_id: ownerId,
          message,
          move_in_date: moveInDate,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-requests'] });
      toast.success('Rental request sent successfully!');
    },
    onError: (error) => {
      if (error.message.includes('duplicate')) {
        toast.error('You have already requested this property');
      } else {
        toast.error('Failed to send request: ' + error.message);
      }
    },
  });
};

export const useUpdateRequestStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const { data, error } = await supabase
        .from('rental_requests')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['owner-requests'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-requests'] });
      toast.success(`Request ${data.status}!`);
    },
    onError: (error) => {
      toast.error('Failed to update request: ' + error.message);
    },
  });
};
