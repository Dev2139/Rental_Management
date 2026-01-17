import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type PropertyType = Database['public']['Enums']['property_type'];

export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  property_type: PropertyType;
  rent: number;
  deposit: number;
  address: string;
  city: string;
  state: string | null;
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number | null;
  amenities: string[] | null;
  rules: string | null;
  images: string[] | null;
  is_available: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export const useProperties = (filters?: {
  city?: string;
  minRent?: number;
  maxRent?: number;
  propertyType?: string;
}) => {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters?.minRent) {
        query = query.gte('rent', filters.minRent);
      }
      if (filters?.maxRent) {
        query = query.lte('rent', filters.maxRent);
      }
      if (filters?.propertyType) {
        query = query.eq('property_type', filters.propertyType as PropertyType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Property[];
    },
  });
};

export const useOwnerProperties = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['owner-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Property[];
    },
    enabled: !!user,
  });
};

export const useProperty = (id: string) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Property;
    },
    enabled: !!id,
  });
};

type PropertyInsert = Database['public']['Tables']['properties']['Insert'];

export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (property: Omit<PropertyInsert, 'id' | 'owner_id' | 'created_at' | 'updated_at' | 'is_verified'>) => {
      if (!user) throw new Error('Not authenticated');

      const insertData: PropertyInsert = {
        ...property,
        owner_id: user.id,
      };

      const { data, error } = await supabase
        .from('properties')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['owner-properties'] });
      toast.success('Property listed successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create property: ' + error.message);
    },
  });
};

type PropertyUpdate = Database['public']['Tables']['properties']['Update'];

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: PropertyUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['owner-properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', data.id] });
      toast.success('Property updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update property: ' + error.message);
    },
  });
};

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['owner-properties'] });
      toast.success('Property deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete property: ' + error.message);
    },
  });
};
